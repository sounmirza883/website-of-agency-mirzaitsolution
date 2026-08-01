import { Router } from "express";
import multer from "multer";
import { supabase } from "../supabase.js";
import { supabaseAdmin, FILES_BUCKET } from "../supabaseAdmin.js";
import { listUsersByRole } from "../authStore.js";
import { type AuthedRequest, requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { broadcastChatActivity } from "../realtime.js";

/**
 * Staff chat: 1-on-1 DMs and named channels between admins and employees,
 * independent of projects (unlike project_messages, whose every authorization
 * check hangs off a project_id).
 *
 * Authorization is membership-based and re-checked on every request against
 * chat_members — the conversation id in the URL is never trusted on its own.
 */
const router = Router();

// Same 25 MB cap as the other upload routes in this codebase.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const staffOnly = [requireAuth, requireRole("admin", "employee")] as const;

const MESSAGE_SELECT =
  "id,conversationId:conversation_id,senderId:sender_id,text,attachmentPath:attachment_path,attachmentName:attachment_name,attachmentType:attachment_type,createdAt:created_at,sender:users(name,role)";

/**
 * Swap stored object paths for short-lived signed URLs. The bucket is private,
 * so a raw path is useless to the browser on its own — and because the URL
 * expires in an hour, it can't be passed around as a permanent public link.
 */
async function attachSignedUrls<T extends { attachmentPath?: string | null }>(rows: T[]): Promise<Array<Omit<T, "attachmentPath"> & { attachmentUrl: string | null }>> {
  return Promise.all(
    rows.map(async ({ attachmentPath, ...row }) => {
      // The storage path is an internal detail — sign it, then drop it rather
      // than handing the client a key it has no use for.
      if (!attachmentPath || !supabaseAdmin) return { ...row, attachmentUrl: null };
      const { data } = await supabaseAdmin.storage.from(FILES_BUCKET).createSignedUrl(attachmentPath, 3600);
      return { ...row, attachmentUrl: data?.signedUrl ?? null };
    })
  );
}

/** True when the user belongs to the conversation. Every handler gates on this. */
async function isMember(conversationId: number, userId: number): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase
    .from("chat_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

/** Everyone this user is allowed to start a DM with: all other staff. */
router.get("/contacts", ...staffOnly, asyncHandler(async (req, res) => {
  const me = (req as AuthedRequest).user!.id;
  const [admins, employees] = await Promise.all([listUsersByRole("admin"), listUsersByRole("employee")]);
  const contacts = [...admins, ...employees]
    .filter((u) => u.id !== me && u.status === "Active")
    .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, position: u.position ?? null }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return res.json(contacts);
}));

/**
 * Sidebar payload: every conversation the caller belongs to, with the other
 * member (for DMs), an unread count, and a last-message preview.
 *
 * Message metadata for all of the caller's conversations is pulled in one query
 * and grouped in memory rather than issuing a count query per conversation.
 * Fine at team scale; if staff chat volume ever grows into the tens of
 * thousands this should become a Postgres RPC that returns the counts directly.
 */
router.get("/conversations", ...staffOnly, async (req: AuthedRequest, res) => {
  if (!supabase) return res.json([]);
  const me = req.user!.id;

  const memberships = await supabase.from("chat_members").select("conversation_id,last_read_message_id").eq("user_id", me);
  if (memberships.error) return res.status(500).json({ error: memberships.error.message });
  const ids = (memberships.data ?? []).map((m) => m.conversation_id);
  if (ids.length === 0) return res.json([]);

  const lastReadBy = new Map<number, number>();
  for (const m of memberships.data ?? []) lastReadBy.set(m.conversation_id, m.last_read_message_id ?? 0);

  const [conversations, allMembers, messages] = await Promise.all([
    supabase.from("chat_conversations").select("id,kind,name,createdAt:created_at,lastMessageAt:last_message_at").in("id", ids),
    supabase.from("chat_members").select("conversation_id,user_id,users(name,role)").in("conversation_id", ids),
    supabase.from("chat_messages").select("id,conversation_id,sender_id,text,attachment_name,created_at").in("conversation_id", ids).order("id", { ascending: true }),
  ]);
  for (const q of [conversations, allMembers, messages]) {
    if (q.error) return res.status(500).json({ error: q.error.message });
  }

  const membersByConversation = new Map<number, Array<{ id: number; name: string; role: string }>>();
  for (const row of (allMembers.data ?? []) as any[]) {
    const list = membersByConversation.get(row.conversation_id) ?? [];
    // users() is null when the account was deleted; membership rows are removed
    // on delete, so this only shows up mid-cleanup.
    list.push({ id: row.user_id, name: row.users?.name ?? "Deleted user", role: row.users?.role ?? "" });
    membersByConversation.set(row.conversation_id, list);
  }

  // Messages arrive ordered by id ascending, so the last one seen per
  // conversation is the newest — it doubles as the preview and the sort key.
  const unread = new Map<number, number>();
  const preview = new Map<number, { text: string; createdAt: string }>();
  const newestId = new Map<number, number>();
  for (const m of (messages.data ?? []) as any[]) {
    preview.set(m.conversation_id, { text: m.text ?? m.attachment_name ?? "Attachment", createdAt: m.created_at });
    newestId.set(m.conversation_id, m.id);
    const isUnread = m.sender_id !== me && m.id > (lastReadBy.get(m.conversation_id) ?? 0);
    if (isUnread) unread.set(m.conversation_id, (unread.get(m.conversation_id) ?? 0) + 1);
  }

  const payload = ((conversations.data ?? []) as any[]).map((c) => {
    const members = membersByConversation.get(c.id) ?? [];
    return {
      id: c.id,
      kind: c.kind,
      // A DM has no stored name — it's labelled with whoever the other member is.
      name: c.kind === "dm" ? (members.find((m) => m.id !== me)?.name ?? "Deleted user") : c.name,
      otherUserId: c.kind === "dm" ? (members.find((m) => m.id !== me)?.id ?? null) : null,
      members,
      unreadCount: unread.get(c.id) ?? 0,
      lastMessage: preview.get(c.id) ?? null,
      lastMessageAt: c.lastMessageAt,
      newestMessageId: newestId.get(c.id) ?? 0,
    };
  });

  // Sorted by newest message id rather than last_message_at, for the same
  // clock-skew reason the read cursor uses ids: conversations messaged within a
  // couple of seconds of each other would otherwise sort unpredictably.
  payload.sort((a, b) => b.newestMessageId - a.newestMessageId);
  return res.json(payload);
});

/** Open a DM: returns the existing thread for this pair if there is one. */
router.post("/conversations/dm", ...staffOnly, async (req: AuthedRequest, res) => {
  const me = req.user!.id;
  const otherId = Number(req.body?.userId);
  if (!otherId) return res.status(400).json({ error: "userId is required" });
  if (otherId === me) return res.status(400).json({ error: "You can't DM yourself" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });

  const other = await supabase.from("users").select("id,role").eq("id", otherId).maybeSingle();
  if (!other.data) return res.status(404).json({ error: "User not found" });
  if (other.data.role === "client") return res.status(403).json({ error: "Staff chat is for admins and employees only" });

  const [mine, theirs] = await Promise.all([
    supabase.from("chat_members").select("conversation_id").eq("user_id", me),
    supabase.from("chat_members").select("conversation_id").eq("user_id", otherId),
  ]);
  const theirIds = new Set((theirs.data ?? []).map((r) => r.conversation_id));
  const sharedIds = (mine.data ?? []).map((r) => r.conversation_id).filter((id) => theirIds.has(id));

  if (sharedIds.length > 0) {
    // Only a DM counts as existing — a shared channel isn't a private thread.
    const existing = await supabase.from("chat_conversations").select("id").eq("kind", "dm").in("id", sharedIds).limit(1).maybeSingle();
    if (existing.data) return res.json({ id: existing.data.id, kind: "dm", created: false });
  }

  const created = await supabase.from("chat_conversations").insert({ kind: "dm", created_by: me }).select("id").single();
  if (created.error) return res.status(500).json({ error: created.error.message });

  const members = await supabase.from("chat_members").insert([
    { conversation_id: created.data.id, user_id: me },
    { conversation_id: created.data.id, user_id: otherId },
  ]);
  if (members.error) {
    // Don't leave a memberless conversation behind if the second insert failed.
    await supabase.from("chat_conversations").delete().eq("id", created.data.id);
    return res.status(500).json({ error: members.error.message });
  }

  return res.status(201).json({ id: created.data.id, kind: "dm", created: true });
});

/** Create a named channel. Admin-only, mirroring who can create other shared resources. */
router.post("/conversations/channel", requireAuth, requireRole("admin"), async (req: AuthedRequest, res) => {
  const me = req.user!.id;
  const { name, memberIds } = req.body ?? {};
  if (!name?.trim()) return res.status(400).json({ error: "name is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });

  const created = await supabase.from("chat_conversations").insert({ kind: "channel", name: name.trim(), created_by: me }).select("id,kind,name").single();
  if (created.error) return res.status(500).json({ error: created.error.message });

  // The creator is always a member; ids are de-duplicated so a caller listing
  // themselves doesn't violate the composite primary key.
  const ids = Array.from(new Set<number>([me, ...(Array.isArray(memberIds) ? memberIds.map(Number).filter(Boolean) : [])]));
  const members = await supabase.from("chat_members").insert(ids.map((user_id) => ({ conversation_id: created.data.id, user_id })));
  if (members.error) {
    await supabase.from("chat_conversations").delete().eq("id", created.data.id);
    return res.status(500).json({ error: members.error.message });
  }

  return res.status(201).json(created.data);
});

router.get("/conversations/:id/messages", ...staffOnly, async (req: AuthedRequest, res) => {
  const conversationId = Number(req.params.id);
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!supabase) return res.json([]);
  if (!(await isMember(conversationId, req.user!.id))) return res.status(403).json({ error: "You are not a member of this conversation" });

  const { data, error } = await supabase.from("chat_messages").select(MESSAGE_SELECT).eq("conversation_id", conversationId).order("id", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(await attachSignedUrls((data ?? []) as any[]));
});

router.post("/conversations/:id/messages", ...staffOnly, async (req: AuthedRequest, res) => {
  const conversationId = Number(req.params.id);
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!text) return res.status(400).json({ error: "text is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  if (!(await isMember(conversationId, req.user!.id))) return res.status(403).json({ error: "You are not a member of this conversation" });

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, sender_id: req.user!.id, text })
    .select(MESSAGE_SELECT)
    .single();
  if (error) return res.status(500).json({ error: error.message });

  // Drives sidebar ordering; a failure here shouldn't fail the send.
  await supabase.from("chat_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);

  // Nudge every member (including the sender, whose other tabs need it too) so
  // their sidebar and open thread refresh without waiting for the poll.
  const members = await supabase.from("chat_members").select("user_id").eq("conversation_id", conversationId);
  await broadcastChatActivity((members.data ?? []).map((m) => m.user_id), conversationId);

  return res.status(201).json(data);
});

/**
 * Send a file or image. Separate from the JSON route above because this one is
 * multipart; an optional caption rides along in the same message row.
 */
router.post("/conversations/:id/attachments", ...staffOnly, upload.single("file"), async (req: AuthedRequest, res) => {
  const conversationId = Number(req.params.id);
  const file = req.file;
  const caption = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!file) return res.status(400).json({ error: "file is required" });
  if (!supabase || !supabaseAdmin) return res.status(503).json({ error: "File storage not configured" });
  // Checked before the upload so a non-member can't write into the bucket at all.
  if (!(await isMember(conversationId, req.user!.id))) return res.status(403).json({ error: "You are not a member of this conversation" });

  const path = `chat/${conversationId}/${Date.now()}-${file.originalname}`;
  const { error: uploadError } = await supabaseAdmin.storage.from(FILES_BUCKET).upload(path, file.buffer, { contentType: file.mimetype });
  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: req.user!.id,
      text: caption || null,
      attachment_path: path,
      attachment_name: file.originalname,
      attachment_type: file.mimetype,
    })
    .select(MESSAGE_SELECT)
    .single();
  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("chat_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
  const members = await supabase.from("chat_members").select("user_id").eq("conversation_id", conversationId);
  await broadcastChatActivity((members.data ?? []).map((m) => m.user_id), conversationId);

  return res.status(201).json((await attachSignedUrls([data as any]))[0]);
});

/**
 * Clear the unread badge by advancing this member's cursor to the newest
 * message in the conversation. Reads the id back from the database rather than
 * using a timestamp, so app-server clock drift can't strand messages as unread.
 */
router.post("/conversations/:id/read", ...staffOnly, async (req: AuthedRequest, res) => {
  const conversationId = Number(req.params.id);
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  if (!(await isMember(conversationId, req.user!.id))) return res.status(403).json({ error: "You are not a member of this conversation" });

  const newest = await supabase
    .from("chat_messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (newest.error) return res.status(500).json({ error: newest.error.message });

  const { error } = await supabase
    .from("chat_members")
    .update({ last_read_message_id: newest.data?.id ?? 0 })
    .eq("conversation_id", conversationId)
    .eq("user_id", req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, lastReadMessageId: newest.data?.id ?? 0 });
});

export default router;
