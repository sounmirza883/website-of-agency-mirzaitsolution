/**
 * Project chat conversation lists.
 *
 * Project threads are membership-by-assignment — admin_projects.employee_id and
 * .client_id — rather than by a members table, so every caller re-derives access
 * from the project row. The three roles differ only in which projects they can
 * see, so the listing logic lives here once.
 *
 * Unread state keys on message id, never a timestamp. project_messages.time is a
 * display string, and Postgres now() was measured running ~2s ahead of the Node
 * clock, which left timestamp-based unread counts permanently stuck.
 */
import { supabase } from "./supabase.js";

export type ProjectConversation = {
  projectId: number;
  name: string;
  client: string | null;
  status: string | null;
  lastMessage: string | null;
  lastSenderRole: string | null;
  newestId: number | null;
  unread: number;
};

type ProjectRow = { id: number; name: string; client: string | null; status: string | null };

/**
 * Builds the sidebar list: every project the caller can see, newest activity
 * first, with a preview and an unread count.
 */
export async function listProjectConversations(projects: ProjectRow[], userId: number): Promise<ProjectConversation[]> {
  if (!supabase || projects.length === 0) return [];
  const ids = projects.map((p) => p.id);

  // One query for messages and one for cursors, rather than per-project queries.
  // Bounded deliberately: an unbounded select would be silently truncated by
  // PostgREST's max-rows, and with ascending order would return the oldest rows.
  const [{ data: messages }, { data: cursors }] = await Promise.all([
    supabase
      .from("project_messages")
      .select("id,project_id,text,sender_role")
      .in("project_id", ids)
      .order("id", { ascending: false })
      .limit(2000),
    supabase.from("project_message_reads").select("project_id,last_read_message_id").eq("user_id", userId).in("project_id", ids),
  ]);

  const readBy = new Map((cursors ?? []).map((c) => [c.project_id, c.last_read_message_id ?? 0]));
  const latest = new Map<number, { id: number; text: string; senderRole: string }>();
  const unread = new Map<number, number>();

  for (const m of messages ?? []) {
    // Descending order means the first row seen for a project is its newest.
    if (!latest.has(m.project_id)) latest.set(m.project_id, { id: m.id, text: m.text, senderRole: m.sender_role });
    if (m.id > (readBy.get(m.project_id) ?? 0)) unread.set(m.project_id, (unread.get(m.project_id) ?? 0) + 1);
  }

  return projects
    .map((p) => {
      const last = latest.get(p.id);
      return {
        projectId: p.id,
        name: p.name,
        client: p.client,
        status: p.status,
        lastMessage: last?.text ?? null,
        lastSenderRole: last?.senderRole ?? null,
        newestId: last?.id ?? null,
        unread: unread.get(p.id) ?? 0,
      };
    })
    .sort((a, b) => (b.newestId ?? 0) - (a.newestId ?? 0));
}

/** Moves the caller's read cursor to the newest message in a project. */
export async function markProjectRead(projectId: number, userId: number): Promise<void> {
  if (!supabase) return;
  const { data: newest } = await supabase
    .from("project_messages")
    .select("id")
    .eq("project_id", projectId)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  await supabase
    .from("project_message_reads")
    .upsert({ project_id: projectId, user_id: userId, last_read_message_id: newest?.id ?? 0 }, { onConflict: "project_id,user_id" });
}

/** Everyone who should be told about activity in a project thread. */
export async function projectAudience(projectId: number): Promise<number[]> {
  if (!supabase) return [];
  const { data: project } = await supabase.from("admin_projects").select("employee_id,client_id").eq("id", projectId).maybeSingle();
  const { data: admins } = await supabase.from("users").select("id").eq("role", "admin").limit(50);
  const ids = [project?.employee_id, project?.client_id, ...(admins ?? []).map((a) => a.id)];
  return [...new Set(ids.filter((id): id is number => typeof id === "number"))];
}
