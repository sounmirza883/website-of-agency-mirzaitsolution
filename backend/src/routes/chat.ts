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
  "id,conversationId:conversation_id,senderId:sender_id,text,mentions,attachmentPath:attachment_path,attachmentName:attachment_name,attachmentType:attachment_type,editedAt:edited_at,deletedAt:deleted_at,createdAt:created_at,sender:users(name,role)";

/** Multipart fields arrive as strings, so mention ids come over as JSON there. */
function safeParseIds(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Keep only ids that actually belong to the conversation. The client resolves
 * @names itself, so this is what stops a crafted request from recording a
 * mention of someone who isn't even in the thread.
 */
async function validMentionIds(conversationId: number, raw: unknown): Promise<number[]> {
  if (!Array.isArray(raw) || raw.length === 0 || !supabase) return [];
  const requested = [...new Set(raw.map(Number).filter((n) => Number.isInteger(n)))];
  if (requested.length === 0) return [];
  const { data } = await supabase
    .from("chat_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .in("user_id", requested);
  return (data ?? []).map((m) => m.user_id);
}

/**
 * Swap stored object paths for short-lived signed URLs. The bucket is private,
 * so a raw path is useless to the browser on its own — and because the URL
 * expires in an hour, it can't be passed around as a permanent public link.
 */
async function attachSignedUrls<T extends { attachmentPath?: string | null }>(rows: T[]): Promise<Array<Omit<T, "attachmentPath"> & { attachmentUrl: string | null }>> {
  const paths = [...new Set(rows.map((r) => r.attachmentPath).filter((p): p is string => !!p))];

  // Signed in ONE batched call rather than one call per attachment. The
  // per-row version fanned out a Storage request for every attachment in the
  // response, on every poll and every received message — a thread with a few
  // hundred files would exhaust the request budget before the page rendered.
  const urlByPath = new Map<string, string>();
  if (paths.length > 0 && supabaseAdmin) {
    const { data } = await supabaseAdmin.storage.from(FILES_BUCKET).createSignedUrls(paths, 3600);
    for (const entry of data ?? []) {
      if (entry.path && entry.signedUrl) urlByPath.set(entry.path, entry.signedUrl);
    }
  }

  // The storage path is an internal detail — sign it, then drop it rather than
  // handing the client a key it has no use for.
  return rows.map(({ attachmentPath, ...row }) => ({
    ...row,
    attachmentUrl: attachmentPath ? urlByPath.get(attachmentPath) ?? null : null,
  }));
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
 * member (for DMs), an unread count, a mention flag and a last-message preview.
 *
 * The counts come from the chat_conversation_summary RPC rather than being
 * computed here. The previous version pulled every message of every
 * conversation the user belonged to — full text included — purely to produce a
 * handful of numbers, and repeated that on every poll and every realtime nudge.
 * Only conversation and member rows are fetched now, both bounded by the number
 * of conversations rather than the message history behind them.
 */
router.get("/conversations", ...staffOnly, asyncHandler(async (req, res) => {
  const authed = req as AuthedRequest;
  if (!supabase) return res.json([]);
  const me = authed.user!.id;

  const summary = await supabase.rpc("chat_conversation_summary", { p_user_id: me });
  if (summary.error) return res.status(500).json({ error: summary.error.message });
  const rows = (summary.data ?? []) as Array<{
    conv_id: number; unread: number; mentioned: boolean;
    newest_id: number | null; preview_text: string | null; preview_at: string | null;
  }>;
  const ids = rows.map((r) => r.conv_id);
  if (ids.length === 0) return res.json([]);
  const summaryBy = new Map(rows.map((r) => [r.conv_id, r]));

  const [conversations, allMembers] = await Promise.all([
    supabase.from("chat_conversations").select("id,kind,name,createdAt:created_at").in("id", ids),
    supabase.from("chat_members").select("conversation_id,user_id,users(name,role)").in("conversation_id", ids),
  ]);
  for (const q of [conversations, allMembers]) {
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

  const payload = ((conversations.data ?? []) as any[]).map((c) => {
    const members = membersByConversation.get(c.id) ?? [];
    const s = summaryBy.get(c.id);
    return {
      id: c.id,
      kind: c.kind,
      // A DM has no stored name — it's labelled with whoever the other member is.
      name: c.kind === "dm" ? (members.find((m) => m.id !== me)?.name ?? "Deleted user") : c.name,
      otherUserId: c.kind === "dm" ? (members.find((m) => m.id !== me)?.id ?? null) : null,
      members,
      unreadCount: Number(s?.unread ?? 0),
      mentionsMe: !!s?.mentioned,
      lastMessage: s?.preview_at
        ? { text: s.preview_text ?? "Attachment", createdAt: s.preview_at }
        : null,
      newestMessageId: s?.newest_id ?? 0,
    };
  });

  // Sorted by newest message id rather than last_message_at, for the same
  // clock-skew reason the read cursor uses ids: conversations messaged within a
  // couple of seconds of each other would otherwise sort unpredictably.
  payload.sort((a, b) => b.newestMessageId - a.newestMessageId);
  return res.json(payload);
}));

/** Open a DM: returns the existing thread for this pair if there is one. */
router.post("/conversations/dm", ...staffOnly, asyncHandler(async (req, res) => {
  const authed = req as AuthedRequest;
  const me = authed.user!.id;
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
}));

/** Create a named channel. Admin-only, mirroring who can create other shared resources. */
router.post("/conversations/channel", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const authed = req as AuthedRequest;
  const me = authed.user!.id;
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
}));

/** Newest-first page size. Kept modest because every row may carry an attachment to sign. */
const MESSAGE_PAGE_SIZE = 50;

/**
 * One page of a thread, newest first, oldest-last in the response.
 *
 * Keyset paginated on `id` (`?before=<id>` walks backwards) rather than
 * offset — it rides the existing (conversation_id, id) index and can't skip or
 * repeat rows when new messages arrive mid-scroll.
 *
 * The bound also matters for correctness, not just speed: PostgREST caps
 * unbounded selects at its own `max-rows` WITHOUT raising an error, and the
 * previous ascending-unbounded query would have silently returned the OLDEST
 * rows once a thread crossed that cap. An explicit limit makes the behaviour
 * the same whatever the server is configured to allow.
 */
router.get("/conversations/:id/messages", ...staffOnly, asyncHandler(async (req, res) => {
  const authed = req as AuthedRequest;
  const conversationId = Number(req.params.id);
  const before = Number(req.query.before);
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!supabase) return res.json({ messages: [], hasMore: false });
  if (!(await isMember(conversationId, authed.user!.id))) return res.status(403).json({ error: "You are not a member of this conversation" });

  let query = supabase.from("chat_messages").select(MESSAGE_SELECT).eq("conversation_id", conversationId);
  if (Number.isInteger(before) && before > 0) query = query.lt("id", before);

  // Fetch one extra to detect a further page without a second count query.
  const { data, error } = await query.order("id", { ascending: false }).limit(MESSAGE_PAGE_SIZE + 1);
  if (error) return res.status(500).json({ error: error.message });

  const rows = data ?? [];
  const hasMore = rows.length > MESSAGE_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, MESSAGE_PAGE_SIZE) : rows;
  // Reversed so the client still renders oldest-at-top.
  const messages = await attachSignedUrls(page.reverse() as any[]);
  return res.json({ messages, hasMore });
}));

router.post("/conversations/:id/messages", ...staffOnly, asyncHandler(async (req, res) => {
  const authed = req as AuthedRequest;
  const conversationId = Number(req.params.id);
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!text) return res.status(400).json({ error: "text is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  if (!(await isMember(conversationId, authed.user!.id))) return res.status(403).json({ error: "You are not a member of this conversation" });

  const mentions = await validMentionIds(conversationId, req.body?.mentionIds);
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, sender_id: authed.user!.id, text, mentions })
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
}));

/**
 * Send a file or image. Separate from the JSON route above because this one is
 * multipart; an optional caption rides along in the same message row.
 */
router.post("/conversations/:id/attachments", ...staffOnly, upload.single("file"), asyncHandler(async (req, res) => {
  const authed = req as AuthedRequest;
  const conversationId = Number(req.params.id);
  const file = req.file;
  const caption = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!file) return res.status(400).json({ error: "file is required" });
  if (!supabase || !supabaseAdmin) return res.status(503).json({ error: "File storage not configured" });
  // Checked before the upload so a non-member can't write into the bucket at all.
  if (!(await isMember(conversationId, authed.user!.id))) return res.status(403).json({ error: "You are not a member of this conversation" });

  const path = `chat/${conversationId}/${Date.now()}-${file.originalname}`;
  const { error: uploadError } = await supabaseAdmin.storage.from(FILES_BUCKET).upload(path, file.buffer, { contentType: file.mimetype });
  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const mentions = await validMentionIds(conversationId, safeParseIds(req.body?.mentionIds));
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: authed.user!.id,
      text: caption || null,
      attachment_path: path,
      attachment_name: file.originalname,
      attachment_type: file.mimetype,
      mentions,
    })
    .select(MESSAGE_SELECT)
    .single();
  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("chat_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
  const members = await supabase.from("chat_members").select("user_id").eq("conversation_id", conversationId);
  await broadcastChatActivity((members.data ?? []).map((m) => m.user_id), conversationId);

  return res.status(201).json((await attachSignedUrls([data as any]))[0]);
}));

/**
 * Clear the unread badge by advancing this member's cursor to the newest
 * message in the conversation. Reads the id back from the database rather than
 * using a timestamp, so app-server clock drift can't strand messages as unread.
 */
/**
 * Edit your own message. Only the sender, only while it still exists — an admin
 * may remove someone's message but may not rewrite what they said.
 */
router.patch("/conversations/:id/messages/:messageId", ...staffOnly, asyncHandler(async (req, res) => {
  const authed = req as AuthedRequest;
  const conversationId = Number(req.params.id);
  const messageId = Number(req.params.messageId);
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!conversationId || !messageId) return res.status(400).json({ error: "Invalid id" });
  if (!text) return res.status(400).json({ error: "text is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  if (!(await isMember(conversationId, authed.user!.id))) return res.status(403).json({ error: "You are not a member of this conversation" });

  const existing = await supabase
    .from("chat_messages")
    .select("id,sender_id,deleted_at")
    .eq("id", messageId)
    .eq("conversation_id", conversationId)
    .maybeSingle();
  if (!existing.data) return res.status(404).json({ error: "Message not found" });
  if (existing.data.sender_id !== authed.user!.id) return res.status(403).json({ error: "You can only edit your own messages" });
  if (existing.data.deleted_at) return res.status(400).json({ error: "This message was deleted" });

  const mentions = await validMentionIds(conversationId, req.body?.mentionIds);
  const { data, error } = await supabase
    .from("chat_messages")
    .update({ text, mentions, edited_at: new Date().toISOString() })
    .eq("id", messageId)
    .select(MESSAGE_SELECT)
    .single();
  if (error) return res.status(500).json({ error: error.message });

  const members = await supabase.from("chat_members").select("user_id").eq("conversation_id", conversationId);
  await broadcastChatActivity((members.data ?? []).map((m) => m.user_id), conversationId);
  return res.json((await attachSignedUrls([data as any]))[0]);
}));

/**
 * Delete a message. Senders may remove their own; admins may remove anyone's,
 * for moderation. Soft delete — the row stays so keyset paging and any future
 * replies don't develop holes, and the client shows a tombstone.
 */
router.delete("/conversations/:id/messages/:messageId", ...staffOnly, asyncHandler(async (req, res) => {
  const authed = req as AuthedRequest;
  const conversationId = Number(req.params.id);
  const messageId = Number(req.params.messageId);
  if (!conversationId || !messageId) return res.status(400).json({ error: "Invalid id" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  if (!(await isMember(conversationId, authed.user!.id))) return res.status(403).json({ error: "You are not a member of this conversation" });

  const existing = await supabase
    .from("chat_messages")
    .select("id,sender_id,attachment_path")
    .eq("id", messageId)
    .eq("conversation_id", conversationId)
    .maybeSingle();
  if (!existing.data) return res.status(404).json({ error: "Message not found" });
  const isOwn = existing.data.sender_id === authed.user!.id;
  if (!isOwn && authed.user!.role !== "admin") return res.status(403).json({ error: "You can only delete your own messages" });

  // Text and attachment metadata are cleared, not just flagged, so a deleted
  // message stops being readable through the API at all.
  const { error } = await supabase
    .from("chat_messages")
    .update({ deleted_at: new Date().toISOString(), text: null, attachment_path: null, attachment_name: null, attachment_type: null, mentions: [] })
    .eq("id", messageId);
  if (error) return res.status(500).json({ error: error.message });

  // Drop the stored object too, otherwise deleting a message would leave its
  // file paying for storage forever with nothing referencing it. Done after the
  // row update so a storage hiccup can't leave the message readable.
  if (existing.data.attachment_path && supabaseAdmin) {
    const removal = await supabaseAdmin.storage.from(FILES_BUCKET).remove([existing.data.attachment_path]);
    if (removal.error) console.warn("chat attachment cleanup failed:", removal.error.message);
  }

  const members = await supabase.from("chat_members").select("user_id").eq("conversation_id", conversationId);
  await broadcastChatActivity((members.data ?? []).map((m) => m.user_id), conversationId);
  return res.json({ success: true });
}));

/** Rename a channel. Admin-only, matching who can create one. */
router.patch("/conversations/:id", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const conversationId = Number(req.params.id);
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!name) return res.status(400).json({ error: "name is required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });

  const conv = await supabase.from("chat_conversations").select("id,kind").eq("id", conversationId).maybeSingle();
  if (!conv.data) return res.status(404).json({ error: "Conversation not found" });
  if (conv.data.kind !== "channel") return res.status(400).json({ error: "Only channels can be renamed" });

  const { data, error } = await supabase.from("chat_conversations").update({ name }).eq("id", conversationId).select("id,kind,name").single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}));

/** Add someone to a channel. Admin-only. */
router.post("/conversations/:id/members", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const conversationId = Number(req.params.id);
  const userId = Number(req.body?.userId);
  if (!conversationId || !userId) return res.status(400).json({ error: "conversationId and userId are required" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });

  const conv = await supabase.from("chat_conversations").select("id,kind").eq("id", conversationId).maybeSingle();
  if (!conv.data) return res.status(404).json({ error: "Conversation not found" });
  // A DM is defined by its two participants; adding a third would silently turn
  // it into something the rest of the code still treats as a DM.
  if (conv.data.kind !== "channel") return res.status(400).json({ error: "Members can only be added to channels" });

  const target = await supabase.from("users").select("id,role").eq("id", userId).maybeSingle();
  if (!target.data) return res.status(404).json({ error: "User not found" });
  if (target.data.role === "client") return res.status(403).json({ error: "Staff chat is for admins and employees only" });

  // Already-a-member is a no-op rather than a duplicate-key error.
  const { error } = await supabase.from("chat_members").upsert(
    { conversation_id: conversationId, user_id: userId },
    { onConflict: "conversation_id,user_id", ignoreDuplicates: true }
  );
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ success: true });
}));

/** Remove someone from a channel. Admin-only. */
router.delete("/conversations/:id/members/:userId", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const conversationId = Number(req.params.id);
  const userId = Number(req.params.userId);
  if (!conversationId || !userId) return res.status(400).json({ error: "Invalid id" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });

  const conv = await supabase.from("chat_conversations").select("id,kind").eq("id", conversationId).maybeSingle();
  if (!conv.data) return res.status(404).json({ error: "Conversation not found" });
  if (conv.data.kind !== "channel") return res.status(400).json({ error: "Members can only be removed from channels" });

  const { error } = await supabase.from("chat_members").delete().eq("conversation_id", conversationId).eq("user_id", userId);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
}));

/** Leave a channel yourself. Anyone may leave; DMs can't be left, only ignored. */
router.post("/conversations/:id/leave", ...staffOnly, asyncHandler(async (req, res) => {
  const authed = req as AuthedRequest;
  const conversationId = Number(req.params.id);
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });

  const conv = await supabase.from("chat_conversations").select("id,kind").eq("id", conversationId).maybeSingle();
  if (!conv.data) return res.status(404).json({ error: "Conversation not found" });
  if (conv.data.kind !== "channel") return res.status(400).json({ error: "You can't leave a direct message" });

  const { error } = await supabase.from("chat_members").delete().eq("conversation_id", conversationId).eq("user_id", authed.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
}));

/** Delete a whole channel. Admin-only; members and messages cascade. */
router.delete("/conversations/:id", requireAuth, requireRole("admin"), asyncHandler(async (req, res) => {
  const conversationId = Number(req.params.id);
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });

  const conv = await supabase.from("chat_conversations").select("id,kind").eq("id", conversationId).maybeSingle();
  if (!conv.data) return res.status(404).json({ error: "Conversation not found" });
  if (conv.data.kind !== "channel") return res.status(400).json({ error: "Only channels can be deleted" });

  const { error } = await supabase.from("chat_conversations").delete().eq("id", conversationId);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
}));

router.post("/conversations/:id/read", ...staffOnly, asyncHandler(async (req, res) => {
  const authed = req as AuthedRequest;
  const conversationId = Number(req.params.id);
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id" });
  if (!supabase) return res.status(503).json({ error: "Database not configured" });
  if (!(await isMember(conversationId, authed.user!.id))) return res.status(403).json({ error: "You are not a member of this conversation" });

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
    .eq("user_id", authed.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, lastReadMessageId: newest.data?.id ?? 0 });
}));

export default router;
