function LoadingRow() {
  return (
    <article className="message-row message-bot">
      <div className="message-author">Gemini</div>
      <div className="loading-dots" aria-label="Bot is typing">
        <span />
        <span />
        <span />
      </div>
    </article>
  );
}

export default LoadingRow;
