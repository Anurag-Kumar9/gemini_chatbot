import LoadingRow from "./LoadingRow.jsx";
import MessageRow from "./MessageRow.jsx";

function ChatFeed({ messages, isLoading }) {
  return (
    <div className="feed-scroll">
      <div className="feed-inner">
        {messages.length === 0 ? (
          <section className="empty-state">
            <h2>How can I help?</h2>
          </section>
        ) : (
          <div className="message-list">
            {messages.map((message, index) => (
              <MessageRow key={`${message.role}-${index}`} message={message} />
            ))}
          </div>
        )}
        {isLoading && <LoadingRow />}
      </div>
    </div>
  );
}

export default ChatFeed;
