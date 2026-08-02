"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth";
import { MessageBody } from "../message-body";
import { useChatActivity, useStaffPresence } from "../realtime";
import {
  useChatContacts, useChatConversations, useChatMessages,
  useSendChatMessage, useSendChatAttachment, useOpenChatDm, useCreateChatChannel, useMarkChatRead,
  useEditChatMessage, useDeleteChatMessage, useLeaveChatConversation, useToggleChatReaction, useRenameChatChannel, useAddChatMember, useRemoveChatMember, useDeleteChatChannel,
} from "../hooks";

interface ChatMessage {
  id: number;
  senderId: number | null;
  text: string | null;
  mentions: number[] | null;
  attachmentName: string | null;
  attachmentType: string | null;
  attachmentUrl: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  replyTo: { id: number; text: string | null; senderName: string | null } | null;
  reactions: Array<{ emoji: string; count: number; mine: boolean }>;
  createdAt: string;
  sender: { name: string; role: string } | null;
}

interface Contact {
  id: number;
  name: string;
  role: string;
  position: string | null;
}

interface Conversation {
  id: number;
  kind: "dm" | "channel";
  name: string;
  otherUserId: number | null;
  members: Array<{ id: number; name: string; role: string }>;
  unreadCount: number;
  mentionsMe: boolean;
  lastMessage: { text: string; createdAt: string } | null;
}

// A small fixed set beats pulling in an emoji-picker dependency for now.
const EMOJI = ["👍", "👎", "✅", "❌", "🎉", "👀", "🔥", "😀", "😂", "😕", "🙏", "❤️", "🚀", "⚠️", "🐛", "💡"];
const REACTIONS = ["👍", "✅", "🎉", "👀"];

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [picker, setPicker] = useState<null | "dm" | "channel">(null);
  const [channelName, setChannelName] = useState("");
  const [channelMembers, setChannelMembers] = useState<number[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  // The @ autocomplete only helps you type; who was actually mentioned is
  // re-derived from the final text on send, so editing or deleting a name can't
  // leave a stale id behind.
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: number; text: string | null; senderName: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const { data: conversations } = useChatConversations();
  const { data: contacts } = useChatContacts();
  const messagesQuery = useChatMessages(activeId);
  const loadingMessages = messagesQuery.isLoading;
  // Pages come newest-page-first, each page oldest-last, so reverse the page
  // order to get one continuous oldest-to-newest thread.
  const messages = messagesQuery.data
    ? [...messagesQuery.data.pages].reverse().flatMap((pg) => pg.messages as ChatMessage[])
    : undefined;
  const sendMessage = useSendChatMessage();
  const sendAttachment = useSendChatAttachment();
  const openDm = useOpenChatDm();
  const createChannel = useCreateChatChannel();
  const markRead = useMarkChatRead();
  const editMessage = useEditChatMessage();
  const deleteMessage = useDeleteChatMessage();
  const leaveConversation = useLeaveChatConversation();
  const toggleReaction = useToggleChatReaction();
  const renameChannel = useRenameChatChannel();
  const addMember = useAddChatMember();
  const removeMember = useRemoveChatMember();
  const deleteChannel = useDeleteChatChannel();

  const list: Conversation[] = conversations ?? [];
  const active = list.find((c) => c.id === activeId) ?? null;
  const mentionableMembers = (active?.members ?? []).filter((m) => m.id !== user?.id);
  const mentionMatches = mentionQuery === null
    ? []
    : mentionableMembers.filter((m) => m.name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 6);

  const channels = list.filter((c) => c.kind === "channel");
  const dms = list.filter((c) => c.kind === "dm");

  // Realtime: a broadcast only says "conversation N changed", so refetch it
  // over the authenticated API rather than trusting anything off the socket.
  const queryClient = useQueryClient();
  // Only advertise typing while actually composing in the open thread.
  const { online: onlineIds, typingByConversation } = useStaffPresence(user?.id, isTyping ? activeId : null);
  const typingHere = (typingByConversation.get(activeId ?? -1) ?? []).filter((id) => id !== user?.id);
  useChatActivity(user?.id, (conversationId) => {
    queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
    queryClient.invalidateQueries({ queryKey: ["chatMessages", conversationId] });
  });

  // Opening a thread (or receiving into the open one) clears its badge.
  const unreadForActive = active?.unreadCount ?? 0;
  useEffect(() => {
    if (activeId && unreadForActive > 0) markRead.mutate(activeId);
    // markRead is a stable mutation object; including it would re-fire the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, unreadForActive]);

  const newestId = messages?.length ? messages[messages.length - 1].id : null;
  useEffect(() => {
    // Keyed on the newest id, not length, so loading older history (which also
    // changes length) doesn't yank the view back down to the bottom.
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [newestId, activeId]);

  const sending = sendMessage.isPending || sendAttachment.isPending;

  // Everyone whose name appears as @Name in the text, resolved at send time.
  function resolveMentions(body: string): number[] {
    return mentionableMembers.filter((m) => body.includes(`@${m.name}`)).map((m) => m.id);
  }

  function handleTextChange(value: string) {
    setText(value);
    setIsTyping(value.trim().length > 0);
    // Open the picker only while typing the word directly after an @.
    const trailing = value.match(/@([^@]*)$/);
    setMentionQuery(trailing && !trailing[1].includes(" ") ? trailing[1] : null);
  }

  function insertMention(name: string) {
    setText((prev) => prev.replace(/@[^@]*$/, `@${name} `));
    setMentionQuery(null);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId) return;
    // A file may ride with an optional caption; without one it's a plain message.
    if (pendingFile) {
      await sendAttachment.mutateAsync({ conversationId: activeId, file: pendingFile, text: text.trim(), mentionIds: resolveMentions(text) });
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setText("");
      return;
    }
    if (!text.trim()) return;
    await sendMessage.mutateAsync({ conversationId: activeId, text: text.trim(), mentionIds: resolveMentions(text), replyToId: replyTo?.id ?? null });
    setText("");
    setMentionQuery(null);
    setReplyTo(null);
    setIsTyping(false);
  }

  async function handleSaveEdit(messageId: number) {
    if (!activeId || !editText.trim()) return;
    await editMessage.mutateAsync({ conversationId: activeId, messageId, text: editText.trim(), mentionIds: resolveMentions(editText) });
    setEditingId(null);
    setEditText("");
  }

  async function handleDelete(messageId: number) {
    if (!activeId) return;
    if (!window.confirm("Delete this message? This can't be undone.")) return;
    await deleteMessage.mutateAsync({ conversationId: activeId, messageId });
  }

  async function handleLeave() {
    if (!activeId || !active) return;
    if (!window.confirm(`Leave # ${active.name}?`)) return;
    await leaveConversation.mutateAsync(activeId);
    setActiveId(null);
    setShowSettings(false);
  }

  // Pasting or dropping a file routes into the same pending-attachment slot the
  // paperclip uses, so there's one send path rather than three.
  function handlePaste(e: React.ClipboardEvent) {
    const file = Array.from(e.clipboardData.files)[0];
    if (file) { e.preventDefault(); setPendingFile(file); }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files)[0];
    if (file) setPendingFile(file);
  }

  async function handleStartDm(userId: number) {
    const conv = await openDm.mutateAsync(userId);
    setPicker(null);
    setActiveId(conv.id);
  }

  async function handleCreateChannel(e: React.FormEvent) {
    e.preventDefault();
    if (!channelName.trim()) return;
    const conv = await createChannel.mutateAsync({ name: channelName.trim(), memberIds: channelMembers });
    setPicker(null);
    setChannelName("");
    setChannelMembers([]);
    setActiveId(conv.id);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">Messages</h1>
        <p className="text-sm text-gray-500">Direct messages and channels with your team</p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col min-h-0">
          <div className="p-3 border-b border-gray-200 flex gap-2">
            <button onClick={() => setPicker("dm")} className="flex-1 bg-accent text-gray-50 text-xs font-medium px-3 py-2 rounded-lg">+ New DM</button>
            <button onClick={() => setPicker("channel")} className="flex-1 bg-gray-100 text-gray-900 text-xs font-medium px-3 py-2 rounded-lg">+ Channel</button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-4">
            <Section title="Channels" items={channels} activeId={activeId} onSelect={setActiveId} prefix="#" />
            <Section title="Direct Messages" items={dms} activeId={activeId} onSelect={setActiveId} onlineIds={onlineIds} />
            {list.length === 0 && (
              <p className="text-xs text-gray-400 text-center px-2 py-6">No conversations yet. Start a DM to get going.</p>
            )}
          </div>
        </aside>

        {/* Thread */}
        <section
          onDragOver={(e) => { if (active) { e.preventDefault(); setDragOver(true); } }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex-1 flex flex-col bg-white rounded-xl border min-h-0 ${dragOver ? "border-accent border-dashed" : "border-gray-200"}`}>
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Select a conversation to start chatting.
            </div>
          ) : (
            <>
              <header className="px-5 py-3 border-b border-gray-200 shrink-0 flex items-start justify-between gap-3">
                <div>
                <div className="font-semibold text-gray-900">{active.kind === "channel" ? `# ${active.name}` : active.name}</div>
                <div className="text-xs text-gray-500">
                  {active.kind === "channel"
                    ? `${active.members.length} member${active.members.length === 1 ? "" : "s"}`
                    : active.otherUserId != null && onlineIds.has(active.otherUserId)
                      ? "Online"
                      : "Offline"}
                </div>
                </div>
                {active.kind === "channel" && (
                  <button onClick={() => setShowSettings(true)} className="text-xs text-gray-500 hover:text-gray-900 shrink-0">Settings</button>
                )}
              </header>

              <div className="flex-1 overflow-auto p-5 space-y-3">
                {messagesQuery.hasNextPage && (
                  <div className="text-center">
                    <button type="button" onClick={() => messagesQuery.fetchNextPage()} disabled={messagesQuery.isFetchingNextPage}
                      className="text-xs text-gray-500 hover:text-gray-900 underline disabled:opacity-50">
                      {messagesQuery.isFetchingNextPage ? "Loading…" : "Load older messages"}
                    </button>
                  </div>
                )}
                {loadingMessages ? (
                  <p className="text-sm text-gray-400 text-center mt-8">Loading…</p>
                ) : messages?.length ? (
                  messages.map((m, i) => {
                    const isMe = m.senderId === user?.id;
                    const prev = i > 0 ? messages[i - 1] : null;
                    const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
                    // Consecutive messages from the same person within a few
                    // minutes hide the repeated name/time header.
                    const grouped = !newDay && !!prev && prev.senderId === m.senderId && !prev.deletedAt && !m.deletedAt &&
                      new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000;
                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${grouped ? "-mt-2" : ""}`}>
                        {newDay && (
                          <div className="w-full flex items-center gap-3 my-3">
                            <span className="flex-1 h-px bg-gray-200" />
                            <span className="text-[11px] uppercase tracking-wide text-gray-400">{dayLabel(m.createdAt)}</span>
                            <span className="flex-1 h-px bg-gray-200" />
                          </div>
                        )}
                        {!grouped && (
                          <span className="text-xs text-gray-400 mb-1">
                            {isMe ? "You" : m.sender?.name ?? "Deleted user"} · {timeLabel(m.createdAt)}
                          </span>
                        )}
                        {m.deletedAt ? (
                          <div className="max-w-[70%] px-4 py-2 rounded-2xl text-sm italic text-gray-400 border border-gray-200">
                            This message was deleted
                          </div>
                        ) : editingId === m.id ? (
                          <div className="w-full max-w-[70%] flex gap-2">
                            <input value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus
                              onKeyDown={(e) => { if (e.key === "Escape") setEditingId(null); }}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                            <button onClick={() => handleSaveEdit(m.id)} disabled={editMessage.isPending || !editText.trim()}
                              className="bg-accent text-gray-50 text-xs font-medium px-3 py-2 rounded-lg disabled:opacity-50">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 px-2">Cancel</button>
                          </div>
                        ) : (
                          <div className="group flex items-center gap-2">
                            {isMe && (
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 text-xs text-gray-500">
                                <button onClick={() => { setEditingId(m.id); setEditText(m.text ?? ""); }} className="hover:text-gray-900">Edit</button>
                                <button onClick={() => handleDelete(m.id)} className="hover:text-gray-900">Delete</button>
                                <button onClick={() => setReplyTo({ id: m.id, text: m.text, senderName: m.sender?.name ?? "You" })} className="hover:text-gray-900">Reply</button>
                                {REACTIONS.map((e) => (
                                  <button key={e} type="button" onClick={() => activeId && toggleReaction.mutate({ conversationId: activeId, messageId: m.id, emoji: e })}>{e}</button>
                                ))}
                              </span>
                            )}
                            {!isMe && true && (
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500 order-last">
                                <button onClick={() => handleDelete(m.id)} className="hover:text-gray-900">Delete</button>
                              </span>
                            )}
                            <div className={`px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-accent text-gray-50 rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                              {m.replyTo && (
                                <div className="mb-1 pl-2 border-l-2 border-gray-300 text-xs opacity-80">
                                  <span className="font-medium">{m.replyTo.senderName}</span>{" "}
                                  {m.replyTo.text ?? <span className="italic">deleted message</span>}
                                </div>
                              )}
                              {m.attachmentUrl && (
                                <Attachment url={m.attachmentUrl} name={m.attachmentName} type={m.attachmentType} />
                              )}
                              <MessageBody text={m.text} members={active.members} me={user?.id} />
                              {m.editedAt && <span className="ml-2 text-[11px] opacity-70">(edited)</span>}
                            </div>
                            {m.reactions?.length > 0 && (
                              <span className="flex gap-1">
                                {m.reactions.map((r) => (
                                  <button key={r.emoji} type="button" onClick={() => activeId && toggleReaction.mutate({ conversationId: activeId, messageId: m.id, emoji: r.emoji })}
                                    className={"text-xs px-1.5 py-0.5 rounded-full border " + (r.mine ? "border-accent bg-gray-100" : "border-gray-200")}>
                                    {r.emoji} {r.count}
                                  </button>
                                ))}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center mt-8">No messages yet. Say hello!</p>
                )}
                <div ref={bottomRef} />
              </div>

              {typingHere.length > 0 && (
                <div className="px-4 pb-1 text-xs text-gray-500 italic shrink-0">
                  {typingHere.map((id) => active.members.find((m) => m.id === id)?.name ?? "Someone").join(", ")}
                  {typingHere.length === 1 ? " is typing…" : " are typing…"}
                </div>
              )}
              <form onSubmit={handleSend} className="border-t border-gray-200 p-4 shrink-0">
                {replyTo && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 bg-gray-100 rounded-lg px-3 py-2">
                    <span className="truncate flex-1">Replying to <span className="font-medium">{replyTo.senderName}</span>: {replyTo.text ?? "attachment"}</span>
                    <button type="button" onClick={() => setReplyTo(null)} className="text-gray-500 hover:text-gray-900">Cancel</button>
                  </div>
                )}
                {pendingFile && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 bg-gray-100 rounded-lg px-3 py-2">
                    <span className="truncate flex-1">{pendingFile.name}</span>
                    <button type="button" onClick={() => { setPendingFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-gray-500 hover:text-gray-900">Remove</button>
                  </div>
                )}
                {showEmoji && (
                  <div className="mb-2 p-2 border border-gray-200 rounded-lg flex flex-wrap gap-1">
                    {EMOJI.map((e) => (
                      <button key={e} type="button" onClick={() => { setText((prev) => prev + e); setShowEmoji(false); }}
                        className="w-8 h-8 rounded hover:bg-gray-100 text-lg leading-none">{e}</button>
                    ))}
                  </div>
                )}
                {mentionMatches.length > 0 && (
                  <div className="mb-2 border border-gray-200 rounded-lg overflow-hidden">
                    {mentionMatches.map((m) => (
                      <button key={m.id} type="button" onClick={() => insertMention(m.name)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100">
                        @{m.name} <span className="text-xs text-gray-500">{m.role}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input ref={fileInputRef} type="file" className="hidden"
                    onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach a file"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:text-gray-900">+</button>
                  <button type="button" onClick={() => setShowEmoji((v) => !v)} title="Emoji"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:text-gray-900">☺</button>
                <input
                  value={text}
                  onPaste={handlePaste}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={pendingFile ? "Add a caption (optional)" : active.kind === "channel" ? `Message # ${active.name}` : `Message ${active.name}`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                  <button type="submit" disabled={sending || (!text.trim() && !pendingFile)} className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>

      {picker && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setPicker(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6 max-h-[80vh] overflow-auto">
            {picker === "dm" ? (
              <>
                <h2 className="text-lg font-bold mb-4">Start a conversation</h2>
                <div className="space-y-1">
                  {contacts?.length ? contacts.map((c: Contact) => (
                    <button key={c.id} onClick={() => handleStartDm(c.id)} disabled={openDm.isPending}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-left disabled:opacity-50">
                      <Avatar name={c.name} />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-900 truncate">{c.name}</span>
                        <span className="block text-xs text-gray-500 truncate">{c.position || c.role}</span>
                      </span>
                    </button>
                  )) : <p className="text-sm text-gray-500">No other staff accounts yet.</p>}
                </div>
              </>
            ) : (
              <form onSubmit={handleCreateChannel}>
                <h2 className="text-lg font-bold mb-4">New channel</h2>
                <input value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="Channel name" required
                  className="w-full mb-4 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                <p className="text-xs text-gray-500 mb-2">Add members (you&apos;re included automatically)</p>
                <div className="space-y-1 mb-4">
                  {contacts?.map((c: Contact) => (
                    <label key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input type="checkbox" checked={channelMembers.includes(c.id)}
                        onChange={(e) => setChannelMembers((prev) => e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id))} />
                      <span className="text-sm text-gray-900">{c.name}</span>
                      <span className="text-xs text-gray-500">{c.position || c.role}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setPicker(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                  <button type="submit" disabled={createChannel.isPending || !channelName.trim()}
                    className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
                    {createChannel.isPending ? "Creating…" : "Create"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showSettings && active && active.kind === "channel" && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-xl p-6 max-h-[80vh] overflow-auto">
            <h2 className="text-lg font-bold mb-4"># {active.name}</h2>

            <p className="text-xs text-gray-500 mb-2">Rename</p>
            <form className="flex gap-2 mb-5" onSubmit={async (e) => {
              e.preventDefault();
              const next = renameValue.trim();
              if (!next || !activeId) return;
              await renameChannel.mutateAsync({ conversationId: activeId, name: next });
              setRenameValue("");
            }}>
              <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder={active.name}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <button type="submit" disabled={renameChannel.isPending || !renameValue.trim()}
                className="bg-accent text-gray-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">Save</button>
            </form>

            <p className="text-xs text-gray-500 mb-2">Members</p>
            <div className="space-y-1 mb-4">
              {active.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100">
                  <span className="text-sm text-gray-900">{m.name} <span className="text-xs text-gray-500">{m.role}</span></span>
                  {m.id !== user?.id && (
                    <button onClick={() => activeId && removeMember.mutate({ conversationId: activeId, userId: m.id })}
                      className="text-xs text-gray-500 hover:text-gray-900">Remove</button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-2">Add someone</p>
            <div className="space-y-1 mb-5">
              {(contacts ?? []).filter((c: Contact) => !active.members.some((m) => m.id === c.id)).map((c: Contact) => (
                <button key={c.id} onClick={() => activeId && addMember.mutate({ conversationId: activeId, userId: c.id })}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-900">
                  {c.name} <span className="text-xs text-gray-500">{c.position || c.role}</span>
                </button>
              ))}
              {(contacts ?? []).every((c: Contact) => active.members.some((m) => m.id === c.id)) && (
                <p className="text-xs text-gray-400 px-3">Everyone is already in this channel.</p>
              )}
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-4">
              <button onClick={handleLeave} className="text-sm text-gray-600 hover:text-gray-900">Leave channel</button>
              <button onClick={async () => {
                if (!activeId || !window.confirm(`Delete # ${active.name} for everyone? This can't be undone.`)) return;
                await deleteChannel.mutateAsync(activeId);
                setActiveId(null);
                setShowSettings(false);
              }} className="text-sm text-red-600 hover:text-red-700">Delete channel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Attachment({ url, name, type }: { url: string; name?: string | null; type?: string | null }) {
  // Images preview inline; anything else gets a download link, since the signed
  // URL expires in an hour and is not a permanent public link.
  if (type?.startsWith("image/")) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block mb-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name ?? "attachment"} className="max-h-60 rounded-lg" />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block mb-1 underline break-all">
      {name ?? "Download"}
    </a>
  );
}

function Avatar({ name, online }: { name: string; online?: boolean }) {
  return (
    <span className="relative w-8 h-8 shrink-0">
      <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center text-xs font-bold">
        {initials(name)}
      </span>
      {online !== undefined && (
        <span
          title={online ? "Online" : "Offline"}
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${online ? "bg-green-500" : "bg-gray-300"}`}
        />
      )}
    </span>
  );
}

function Section({ title, items, activeId, onSelect, prefix = "", onlineIds }: {
  title: string;
  items: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  prefix?: string;
  onlineIds?: Set<number>;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      <div className="space-y-0.5">
        {items.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors ${c.id === activeId ? "bg-gray-100" : "hover:bg-gray-50"}`}>
            {prefix
              ? <span className="w-8 text-center text-gray-400">{prefix}</span>
              : <Avatar name={c.name} online={onlineIds ? (c.otherUserId != null && onlineIds.has(c.otherUserId)) : undefined} />}
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-gray-900 truncate">{c.name}</span>
              {c.lastMessage && <span className="block text-xs text-gray-500 truncate">{c.lastMessage.text}</span>}
            </span>
            {c.mentionsMe && (
              <span title="You were mentioned"
                className="shrink-0 w-5 h-5 rounded-full bg-accent text-gray-50 text-[11px] font-bold flex items-center justify-center">@</span>
            )}
            {c.unreadCount > 0 && (
              <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-accent text-gray-50 text-[11px] font-bold flex items-center justify-center">
                {c.unreadCount > 99 ? "99+" : c.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
