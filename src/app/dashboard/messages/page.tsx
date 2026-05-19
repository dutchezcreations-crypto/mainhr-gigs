import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Send, 
  Paperclip,
  Smile,
  Circle,
  Loader2,
  Briefcase
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Messages.module.css";
import { useSearchParams } from "react-router-dom";

export default function MessagesPage() {
  const supabase = createClient() as any;
  const [searchParams] = useSearchParams();
  const initialId = searchParams?.get('id');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        await fetchConversations(user.id);
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (initialId && conversations.length > 0) {
      const target = conversations.find(c => c.id === initialId);
      if (target) setActiveConv(target);
    }
  }, [initialId, conversations]);

  async function fetchConversations(userId: string) {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        participant_one_profile:profiles!conversations_participant_one_fkey(id, full_name, avatar_url, role),
        participant_two_profile:profiles!conversations_participant_two_fkey(id, full_name, avatar_url, role),
        jobs(title)
      `)
      .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (data) {
      setConversations(data);
      if (data.length > 0 && !activeConv) {
        setActiveConv(data[0]);
      }
    }
  }

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      markAsRead(activeConv.id);
      
      const channel = supabase
        .channel(`conv_${activeConv.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${activeConv.id}`,
          },
          (payload: any) => {
            setMessages((prev) => [...prev, payload.new]);
            if (payload.new.sender_id !== currentUser?.id) {
               markAsRead(activeConv.id);
            }
          }
        )
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const typing = Object.values(state)
            .flat()
            .some((p: any) => p.user_id !== currentUser?.id && p.is_typing);
          setPartnerTyping(typing);
        })
        .subscribe(async (status: any) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ user_id: currentUser?.id, is_typing: isTyping });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeConv, currentUser, isTyping]);

  async function markAsRead(convId: string) {
    if (!currentUser) return;
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", convId)
      .neq("sender_id", currentUser.id);
  }

  async function fetchMessages(convId: string) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    
    if (data) setMessages(data);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv || !currentUser) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${activeConv.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      await supabase.from("messages").insert({
        conversation_id: activeConv.id,
        sender_id: currentUser.id,
        content: `Sent an attachment: ${file.name}`,
        attachments: [publicUrl]
      });

    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv || !currentUser) return;

    const content = messageInput.trim();
    setMessageInput("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConv.id,
      sender_id: currentUser.id,
      content: content,
    });

    if (error) {
      alert(error.message);
    } else {
      await supabase.from("conversations").update({
        last_message_at: new Date().toISOString()
      }).eq("id", activeConv.id);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getPartnerProfile = (conv: any) => {
    if (!conv || !currentUser) return null;
    return conv.participant_one === currentUser.id ? conv.participant_two_profile : conv.participant_one_profile;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.title}>Messages</h2>
              <div className={styles.search}>
                <Search size={18} />
                <input type="text" placeholder="Search chats..." />
              </div>
            </div>

            <div className={styles.convList}>
              {conversations.map((c) => {
                const partner = getPartnerProfile(c);
                return (
                  <button 
                    key={c.id} 
                    className={`${styles.convItem} ${activeConv?.id === c.id ? styles.convActive : ""}`}
                    onClick={() => setActiveConv(c)}
                  >
                    <div className={styles.avatarWrapper}>
                      <div className={styles.avatar} style={{ backgroundImage: partner?.avatar_url ? `url(${partner.avatar_url})` : 'none' }}></div>
                      <div className={styles.onlineIndicator}></div>
                    </div>
                    <div className={styles.convInfo}>
                      <div className={styles.convTop}>
                        <span className={styles.convName}>{partner?.full_name || 'User'}</span>
                        <span className={styles.convTime}>
                          {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={styles.convBottom}>
                        <p className={styles.convMsg}>{partner?.role || partner?.headline || 'Member'}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {conversations.length === 0 && (
                <div className={styles.emptyState}>
                  <p>No conversations yet.</p>
                </div>
              )}
            </div>
          </aside>

          {/* Chat Area */}
          <main className={styles.chatArea}>
            {activeConv ? (
              <>
                {/* Chat Header */}
                <header className={styles.chatHeader}>
                  <div className={styles.chatUser}>
                    <div className={styles.avatarLarge} style={{ backgroundImage: getPartnerProfile(activeConv)?.avatar_url ? `url(${getPartnerProfile(activeConv).avatar_url})` : 'none' }}></div>
                    <div>
                      <h3 className={styles.userName}>{getPartnerProfile(activeConv)?.full_name || 'User'}</h3>
                      <div className="flex flex-col">
                        {partnerTyping ? (
                          <p className="text-xs font-bold text-primary-600 animate-pulse uppercase tracking-wider">Typing...</p>
                        ) : (
                          <>
                            {activeConv.jobs && (
                              <div className={styles.jobContext}>
                                <Briefcase size={12} /> {activeConv.jobs.title}
                              </div>
                            )}
                            <p className={styles.userStatus}>Online • {getPartnerProfile(activeConv)?.role || 'Member'}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.chatActions}>
                    <button className={styles.iconBtn}><Phone size={20} /></button>
                    <button className={styles.iconBtn}><Video size={20} /></button>
                    <div className={styles.divider}></div>
                    <button className={styles.iconBtn}><MoreVertical size={20} /></button>
                  </div>
                </header>

                {/* Messages */}
                <div className={styles.messageScroll} ref={scrollRef}>
                  {messages.map((m) => (
                    <div key={m.id} className={`${styles.messageWrapper} ${m.sender_id === currentUser.id ? styles.meWrapper : ""}`}>
                      {m.sender_id !== currentUser.id && <div className={styles.msgAvatar} style={{ backgroundImage: getPartnerProfile(activeConv)?.avatar_url ? `url(${getPartnerProfile(activeConv).avatar_url})` : 'none' }}></div>}
                      <div className={styles.message}>
                        <div className={styles.msgBubble}>
                          {m.content}
                          {m.attachments?.[0] && (
                            <div className={styles.attachment}>
                              <a href={m.attachments[0]} target="_blank" className="flex items-center gap-2 mt-2 p-2 bg-black/10 rounded-lg text-xs font-bold hover:bg-black/20 transition-colors">
                                <Paperclip size={14} /> View Attachment
                              </a>
                            </div>
                          )}
                        </div>
                        <span className={styles.msgTime}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <form className={styles.inputArea} onSubmit={handleSendMessage}>
                  <div className={styles.inputWrapper}>
                    <button type="button" className={styles.inputIconBtn}><Smile size={20} /></button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                    <button 
                      type="button" 
                      className={styles.inputIconBtn}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                    </button>
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className={styles.msgInput} 
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        if (!isTyping) setIsTyping(true);
                      }}
                      onBlur={() => setIsTyping(false)}
                    />
                    <button type="submit" className={styles.sendBtn} disabled={!messageInput.trim()}>
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className={styles.emptyChat}>
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
