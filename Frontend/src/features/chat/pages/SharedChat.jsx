import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getSharedChatApi } from "../service/chat.api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SharedChat = () => {
  const { shareSlug } = useParams();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        const data = await getSharedChatApi({ shareSlug });
        setChat(data.chat);
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load this shared chat.");
      } finally {
        setLoading(false);
      }
    };

    if (shareSlug) fetchSharedChat();
  }, [shareSlug]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">Loading shared chat...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-red-400">{error}</div>;
  }

  return (
    <main className="h-screen overflow-y-auto bg-zinc-950 p-6 text-zinc-100">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6 border-b border-zinc-800 pb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Shared chat</p>
          <h1 className="mt-2 text-3xl font-bold">{chat?.title || "Shared conversation"}</h1>
          <p className="mt-2 text-sm text-zinc-400">By {chat?.owner || "Unknown user"}</p>
        </div>

        <div className="space-y-4">
          {messages.map((message, idx) => (
            <div key={idx} className={`rounded-2xl border p-4 ${message.role === "user" ? "border-cyan-500/30 bg-cyan-500/10" : "border-zinc-800 bg-zinc-950/60"}`}>
              <div className="mb-2 text-xs uppercase tracking-[0.15em] text-zinc-400">{message.role === "user" ? "You" : "AI"}</div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default SharedChat;
