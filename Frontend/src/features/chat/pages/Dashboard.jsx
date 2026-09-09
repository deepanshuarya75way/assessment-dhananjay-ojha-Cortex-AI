import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import remarkGfm from "remark-gfm";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../../auth/hook/useAuth";
import { Sparkles, Plus, Moon, Sun, Share2, Send, LogOut, Newspaper, Code2, TrendingUp, Zap } from "lucide-react";

// Suggestion tiles shown on the empty state (center of the screen)
const SUGGESTIONS = [
  { icon: Newspaper, label: "What's happening in tech today?" },
  { icon: Code2, label: "Best React practices in 2026" },
  { icon: TrendingUp, label: "Gold price in India today" },
  { icon: Zap, label: "Explain quantum computing simply" },
];

const Dashboard = () => {
  const chat = useChat();
  const auth = useAuth();
  const [chatInput, setChatInput] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [copyMessage, setCopyMessage] = useState("");
  const [deleteChatId, setDeleteChatId] = useState(null);

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isGenerating = useSelector((state) => state.chat.isLoading);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const restoreActiveChat = async () => {
      const socket = chat.initializeSocketConnection(chat.handleSocketNewMessage);
      const normalizedChats = await chat.handleGetChats();

      const savedChatId = localStorage.getItem("perplexity-current-chat");
      if (savedChatId && normalizedChats[savedChatId]) {
        await chat.handleOpenChat(savedChatId, normalizedChats);
      }

      return socket;
    };

    const socketPromise = restoreActiveChat();

    return () => {
      socketPromise.then((socket) => socket?.disconnect?.());
    };
  }, []);

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    const message = chatInput.trim();
    if (!message) return;

    chat.handleSendMessage({ message, chatId: currentChatId });
    setChatInput("");
  };

  const handleSuggestionClick = (label) => {
    setChatInput(label);
  };

  const handleNewChat = () => {
    setChatInput("");
    chat.handleCreateNewChat();
  };

  const handleLogout = async () => {
    await auth.handleLogout();
    window.location.href = "/login";
  };

  const handleShareCurrentChat = async () => {
    if (!currentChatId) return;

    const shareUrl = await chat.handleShareChat(currentChatId);
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage("Share link copied");
      setTimeout(() => setCopyMessage(""), 1800);
    }
  };

  const confirmDeleteChat = async () => {
    if (!deleteChatId) return;
    await chat.handleDeleteChat(deleteChatId);
    setDeleteChatId(null);
  };

  const hasMessages = currentChatId ? chats[currentChatId]?.messages?.length > 0 : false;

  // ---- theme tokens (kept simple: two variants, no external config needed) ----
  const theme = isDark
    ? {
      page: "bg-[#0A0A0A] text-white",
      panelBorder: "border-white/12",
      subtleBorder: "border-white/10",
      subtleBg: "bg-white/[0.03]",
      subtleBgHover: "hover:bg-white/[0.06]",
      muted: "text-white/50",
    }
    : {
      page: "bg-[#F4F4EF] text-[#0A0A0A]",
      panelBorder: "border-black/12",
      subtleBorder: "border-black/10",
      subtleBg: "bg-black/[0.03]",
      subtleBgHover: "hover:bg-black/[0.06]",
      muted: "text-black/50",
    };

  const accent = "#6EE7FF"; // electric lime — the single signature accent color

  return (
    <main
      className={`
    h-screen
    w-full
    p-4
    font-[Inter]
    ${theme.page}
    transition-all
    duration-700
    ease-[cubic-bezier(0.22,1,0.36,1)]
  `}
    >
      {deleteChatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Delete chat?</h3>
            <p className="mt-2 text-sm text-zinc-300">
              This action will permanently remove the selected conversation and all its messages.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteChatId(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteChat}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap');

        html,
        body,
        #root {
          transition:
            background-color 0.7s cubic-bezier(.22,1,.36,1),
            color 0.7s cubic-bezier(.22,1,.36,1);
          font-family: 'Open Sans', 'Segoe UI', sans-serif;
        }

        * {
          transition:
            background-color 0.5s ease,
            border-color 0.5s ease,
            color 0.5s ease;
          font-family: 'Open Sans', 'Segoe UI', sans-serif;
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.98);
            filter: blur(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .animate-message {
          animation: messageIn 0.35s cubic-bezier(.22,1,.36,1);
        }

        .typing-dots {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 20px;
        }

        .typing-dots span {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background-color: rgba(255,255,255,0.75);
          display: block;
          animation: typing 1.2s infinite ease-in-out;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.3s;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.18) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 9999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.18);
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          40% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        .chat-card:hover {
          transform: translateY(-2px);
        }

        .btn-hover:hover {
          transform: scale(1.03);
        }

        .btn-hover:active {
          transform: scale(.97);
        }
      `}</style>

      {/* Outer bordered frame — mirrors the wireframe's single outlined container */}
      <div
        className={`
flex
h-full
w-full
gap-4
rounded-4xl
border
${theme.panelBorder}
p-4
overflow-hidden
transition-all
duration-700
`}
      >
        {/* ---------------- SIDEBAR ---------------- */}
        <aside
          className={`
hidden
md:flex
w-72
shrink-0
flex-col
rounded-3xl
border
${theme.subtleBorder}
${theme.subtleBg}
p-4
transition-all
duration-700
`}
        >
          {/* Brand label — top-left box in wireframe */}
          <div className={`inline-flex w-fit items-center gap-2 rounded-full border ${theme.subtleBorder} px-4 py-2 mb-5`}>
            <Sparkles size={15} style={{ color: accent }} />
            <span className="font-display font-semibold text-[14px]">Cortex AI</span>
          </div>

          {/* New chat button */}
          <button
            onClick={handleNewChat}
            className="mb-5 rounded-2xl py-3 font-semibold text-[14px] text-black transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: accent }}
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={16} /> New Chat
            </span>
          </button>

          {/* Chat history list */}
          <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
            {Object.values(chats).map((item) => {
              const isActive = item.id === currentChatId;
              return (
                <div
                  key={item.id}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left text-[13.5px] transition-colors ${isActive ? "border-transparent" : `${theme.subtleBorder} ${theme.subtleBgHover}`
                    }`}
                  style={
                    isActive
                      ? {
                        background: "rgba(19,20,28,.78)",
                        backdropFilter: "blur(24px)",
                        border: "1px solid rgba(255,255,255,.07)",
                      }
                      : {}
                  }
                >
                  <button
                    onClick={() => chat.handleOpenChat(item.id, chats)}
                    className="flex-1 truncate text-left"
                    title={item.title}
                  >
                    {item.title}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteChatId(item.id);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-lg text-white/70 hover:bg-white/5"
                    aria-label={`Delete ${item.title}`}
                    title="Delete chat"
                  >
                    ⋯
                  </button>
                </div>
              );
            })}
          </div>

          {/* User + logout box — bottom-left of wireframe */}
          <div className={`mt-4 rounded-2xl border ${theme.subtleBorder} p-3`}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-black text-[13px]"
                style={{ backgroundColor: accent }}
              >
                {(user?.username || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-semibold truncate">{user?.username || "User"}</p>
                <p className={`text-[11.5px] ${theme.muted}`}>Free Plan</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 py-2.5 text-[13px] text-red-400 transition-colors hover:bg-red-500/20`}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </aside>

        {/* ---------------- MAIN AREA ---------------- */}
        <section className="relative flex flex-1 min-w-0 flex-col min-h-0">
          {/* Top-right controls — Dark Mode + Share, as in wireframe */}
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={() => setIsDark((d) => !d)}
              className={`inline-flex items-center gap-2 rounded-full border ${theme.subtleBorder} ${theme.subtleBgHover} px-4 py-2 text-[13px] transition-all duration-500 hover:scale-[1.02]`}
            >
              <div
                className={`transition-all duration-700 ${isDark ? "rotate-180 scale-110" : "rotate-0 scale-100"
                  }`}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </div>
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={handleShareCurrentChat}
              className={`
inline-flex
items-center
gap-2
rounded-full
border
${theme.subtleBorder}
${theme.subtleBgHover}
px-4
py-2
text-[13px]
transition-all
duration-500
hover:scale-105
`}
            >
              <Share2 size={14} /> {copyMessage || "Share"}
            </button>
          </div>

          {/* Empty state OR message list */}
          {!hasMessages ? (
            <div className="flex flex-1 flex-col items-center justify-center fade-up">
              {isGenerating ? (
                <div className="typing-dots" aria-label="AI is typing">
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                <>
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl pulse-badge"
                    style={{ backgroundColor: `${accent}22`, border: `1px solid ${accent}55` }}
                  >
                    <Sparkles size={22} style={{ color: accent }} />
                  </div>
                  <h1 className="font-display text-[1.9rem] font-semibold tracking-tight">Ask anything</h1>
                  <p className={`text-[14px] mt-1.5 ${theme.muted}`}>powered by Cortex</p>

                  <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-md">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(s.label)}
                        className={`flex items-center gap-2.5 rounded-2xl border ${theme.subtleBorder} ${theme.subtleBgHover} px-4 py-3 text-left text-[13px] transition-colors`}
                      >
                        <s.icon size={15} style={{ color: accent }} className="shrink-0" />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 px-1 pb-4 pr-2 custom-scrollbar">
              {chats[currentChatId]?.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                    } animate-message`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed
        transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${message.role === "user"
                        ? "text-black shadow-lg"
                        : `border ${theme.subtleBorder} ${theme.subtleBg}`
                      }`}
                    style={{
                      fontFamily: "'Open Sans', 'Segoe UI', sans-serif",
                      ...(message.role === "user" ? { backgroundColor: accent } : {}),
                    }}
                  >
                    {message.role === "user" ? (
                      <p>{message.content}</p>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({ children }) => (
                            <code
                              className="rounded bg-black/30 px-1.5 py-0.5 text-[13px]"
                              style={{ color: accent }}
                            >
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="mb-2 overflow-x-auto rounded-xl bg-black/30 p-3">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start animate-message">
                  <div
                    className={`rounded-2xl border ${theme.subtleBorder} ${theme.subtleBg} px-4 py-3`}
                    style={{ minWidth: "72px" }}
                  >
                    <div className="typing-dots" aria-label="AI is typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input bar — bottom row, spans the main area next to the sidebar */}
          <form
            onSubmit={handleSubmitMessage}
            className={`mt-3 flex w-[92%] items-center gap-2 rounded-2xl border ${theme.subtleBorder} ${theme.subtleBg} p-2 transition-all duration-700`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${theme.subtleBorder} shrink-0`}>
              <Plus size={16} />
            </div>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Say anything to Cortex..."
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-inherit placeholder:opacity-40 py-2"
              style={{ fontFamily: "'Open Sans', 'Segoe UI', sans-serif" }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-black transform:translateY(-2px);border-color:#60A5FA;scale(1.08)rotate(8deg);scale(.9)
box-shadow:0 0 20px rgba(96,165,250,.15);"
              style={{ backgroundColor: accent }}
            >
              <Send size={15} />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;