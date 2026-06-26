import { useEffect, useRef, useState } from "react";
import {
Bot,
Send,
UserRound,
Sparkles,
HelpCircle,
FileText,
CalendarDays,
LoaderCircle,
RotateCcw,
ClipboardList
} from "lucide-react";
import api from "../api/axios";

const initialMessage = {
role: "assistant",
text: "Hello! I can help you with documents, schedules, announcements, and common student questions.",
source: "system",
};

const quickQuestions = [
{ text: "Do I have any pending requests?", icon: FileText },
{ text: "What is my next class?", icon: CalendarDays },
{ text: "How many days until exams?", icon: Sparkles },
];

export default function AssistantChat({ setCurrentPage }) {
const [messages, setMessages] = useState([initialMessage]);
const [question, setQuestion] = useState("");
const [loading, setLoading] = useState(false);
const messagesEndRef = useRef(null);

useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
}, [messages, loading]);

const askAssistant = async (customQuestion = null) => {
const finalQuestion = (customQuestion || question).trim();

if (!finalQuestion || loading) return;

const userMessage = {
role: "user",
text: finalQuestion,
};

setMessages((prev) => [...prev, userMessage]);
setQuestion("");
setLoading(true);

try {
const res = await api.post("/assistant/ask", {
question: finalQuestion,
});

const assistantMessage = {
role: "assistant",
text: res.data.answer,
source: res.data.source,
score: res.data.score,
link: res.data.link,
};

setMessages((prev) => [...prev, assistantMessage]);
} catch {
setMessages((prev) => [
...prev,
{
role: "assistant",
text: "Sorry, I could not process your question right now.",
source: "error",
},
]);
} finally {
setLoading(false);
}
};

const handleKeyDown = (event) => {
if (event.key === "Enter" && !event.shiftKey) {
event.preventDefault();
askAssistant();
}
};

return (
<div className="h-[100dvh] overflow-hidden bg-white px-4 pt-4 pb-24 sm:px-5 sm:pt-5 sm:pb-28">
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-3 sm:gap-4">
        <section className="shrink-0 rounded-[1.35rem] border border-blue-100 bg-[#F8FAFF] p-3 sm:rounded-[2rem] sm:p-4">
            <div className="mb-2 flex items-center gap-2 text-[#0B3D7A] sm:mb-3">
                <Sparkles size={18} />
                <h2 className="text-sm font-extrabold uppercase tracking-wide">
                    Quick Questions
                </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {quickQuestions.map((item) => {
                const Icon = item.icon;

                return (
                <button key={item.text} type="button" onClick={()=> askAssistant(item.text)}
                    disabled={loading}
                    className="flex min-w-[210px] flex-1 items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-left text-sm font-extrabold text-[#102033] shadow-sm transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 sm:gap-3 sm:px-4 sm:py-3 md:min-w-0"
                    >
                    <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EAF3FF] text-[#1557A6] sm:h-9 sm:w-9">
                        <Icon size={18} />
                    </span>
                    <span className="leading-snug">{item.text}</span>
                </button>
                );
                })}
            </div>
        </section>

        <section
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-sm sm:rounded-[2rem]">
            <div
                className="shrink-0 flex items-center justify-between border-b border-blue-100 bg-white px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                    <span
                        className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[#1557A6]">
                        <Bot size={21} />
                        <span
                            className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                    </span>

                    <div>
                        <h2 className="text-sm font-extrabold text-[#102033]">
                            Taleeb Assistant
                        </h2>
                        <p className="text-xs font-semibold text-slate-400">
                            Online
                        </p>
                    </div>
                </div>

                <button type="button" onClick={()=> setMessages([initialMessage])}
                    aria-label="Reset chat"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-blue-50 hover:text-[#1557A6] disabled:opacity-40"
                    disabled={loading || messages.length === 1}
                    >
                    <RotateCcw size={18} />
                </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-white to-[#F8FAFF] p-4 sm:p-5">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                    <ChatBubble key={index} message={message} setCurrentPage={setCurrentPage} />
                    ))}

                    {loading && (
                    <div className="flex items-end gap-3">
                        <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[#1557A6]">
                            <Bot size={20} />
                        </div>

                        <div
                            className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-[#EAF3FF] px-4 py-3 text-sm font-bold text-[#0B3D7A]">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Thinking
                        </div>
                    </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <form onSubmit={(e)=> {
                e.preventDefault();
                askAssistant();
                }}
                className="shrink-0 border-t border-blue-100 bg-white p-3 sm:p-4"
                >
                <div
                    className="flex items-end gap-3 rounded-2xl border border-blue-100 bg-[#F8FAFF] p-2 transition focus-within:border-[#1557A6] focus-within:ring-4 focus-within:ring-blue-100">
                    <textarea value={question} onChange={(e)=> setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                rows={1}
                className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-base font-semibold leading-relaxed text-[#102033] outline-none placeholder:text-slate-400 sm:text-sm"
              />

              <button
                type="submit"
                disabled={loading || !question.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1557A6] text-white transition hover:bg-[#0B3D7A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function ChatBubble({ message, setCurrentPage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-end gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3FF] text-[#1557A6]">
          <Bot size={20} />
        </div>
      )}

      <div
        className={`max-w-[min(82%,680px)] rounded-2xl px-4 py-3 text-sm shadow-sm sm:px-5 sm:py-4 sm:text-base ${
          isUser
            ? "rounded-br-md bg-[#1557A6] text-white"
            : "rounded-bl-md border border-blue-100 bg-white text-[#102033]"
        }`}
      >
        <p className="whitespace-pre-line break-words leading-relaxed">
          {message.text}
        </p>
{!isUser && message.link && (
  <button
    onClick={() => setCurrentPage(message.link)}
    className="mt-3 px-4 py-2 rounded-xl bg-[#1557A6] text-white text-sm font-bold hover:bg-[#0B3D7A] transition"
  >
    See more
  </button>
)}
        {!isUser && message.source && message.source !== "system" && (
          <div className="mt-3">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
                message.source === "personal"
                  ? "bg-purple-100 text-purple-700"
                  : message.source === "faq"
                  ? "bg-blue-100 text-[#1557A6]"
                  : message.source === "announcement"
                  ? "bg-green-100 text-green-700"
                  : message.source === "fallback"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              Source: {message.source}
            </span>
          </div>
        )}
        
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#0B3D7A] text-white">
          <UserRound size={20} />
        </div>
      )}
    </div>
  );
}
