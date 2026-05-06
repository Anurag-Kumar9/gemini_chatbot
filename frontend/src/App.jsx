import { useMemo, useState } from "react";
import ChatFeed from "./components/ChatFeed.jsx";
import Composer from "./components/Composer.jsx";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatId, setChatId] = useState(() => crypto.randomUUID());
  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const canSend = useMemo(
    () => !isLoading && Boolean(input.trim() || selectedFile),
    [input, isLoading, selectedFile]
  );

  async function sendMessage(event) {
    event.preventDefault();
    if (!canSend) return;

    const text = input.trim();
    const upload = selectedFile;

    setMessages((items) => [
      ...items,
      { role: "user", text, fileDetails: upload?.name || null },
    ]);
    setInput("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("message", text);
    if (upload) formData.append("file", upload);

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(await readApiError(response));

      const data = await response.json();
      setMessages((items) => [
        ...items,
        { role: "bot", text: data.response || "", fileDetails: null },
      ]);
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      setMessages((items) => [
        ...items,
        {
          role: "bot",
          text: error.message || "I couldn't reach the server. Please try again.",
          fileDetails: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function startNewChat() {
    const staleChatId = chatId;

    setMessages([]);
    setInput("");
    setSelectedFile(null);
    setChatId(crypto.randomUUID());

    try {
      await fetch(`${backendUrl}/api/chat/${staleChatId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="app-shell min-h-screen">
      <section className="chat-panel min-w-0">
        <header className="topbar">
          <div>
            <p>Infollion Chatbot</p>
            <h1>AI Assistant</h1>
          </div>
          <button className="topbar-new-chat" onClick={startNewChat} type="button">
            New Chat
          </button>
        </header>

        <ChatFeed messages={messages} isLoading={isLoading} />

        <Composer
          canSend={canSend}
          input={input}
          isLoading={isLoading}
          onFileChange={setSelectedFile}
          onInputChange={setInput}
          onSubmit={sendMessage}
          selectedFile={selectedFile}
        />
      </section>
    </main>
  );
}

async function readApiError(response) {
  try {
    const data = await response.json();
    return data.detail || "The request failed. Please try again.";
  } catch {
    return await response.text();
  }
}

export default App;
