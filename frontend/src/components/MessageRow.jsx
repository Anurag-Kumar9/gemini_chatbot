import { Paperclip } from "lucide-react";

function MessageRow({ message }) {
  const isUser = message.role === "user";

  return (
    <article className={`message-row ${isUser ? "message-user" : "message-bot"}`}>
      <div className="message-author">{isUser ? "You" : "Gemini"}</div>
      {message.fileDetails && (
        <div className="message-file">
          <Paperclip size={14} />
          <span>{message.fileDetails}</span>
        </div>
      )}
      {message.text && <p>{message.text}</p>}
    </article>
  );
}

export default MessageRow;
