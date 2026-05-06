import { Image, Paperclip, Send, X } from "lucide-react";
import { useRef } from "react";

const ACCEPTED_FILES = ".pdf,.txt,.png,.jpg";

function Composer({
  canSend,
  input,
  isLoading,
  onFileChange,
  onInputChange,
  onSubmit,
  selectedFile,
}) {
  const fileInputRef = useRef(null);

  function chooseFile(event) {
    onFileChange(event.target.files?.[0] || null);
    event.target.value = "";
  }

  return (
    <footer className="composer-wrap">
      <form className="composer-form" onSubmit={onSubmit}>
        {selectedFile && (
          <div className="file-chip">
            <Paperclip size={16} />
            <span>{selectedFile.name}</span>
            <button
              aria-label="Remove selected file"
              onClick={() => onFileChange(null)}
              type="button"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="composer">
          <textarea
            disabled={isLoading}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSubmit(event);
              }
            }}
            placeholder="Ask anything"
            rows={1}
            value={input}
          />

          <div className="composer-actions">
            <input
              accept={ACCEPTED_FILES}
              className="hidden-input"
              onChange={chooseFile}
              ref={fileInputRef}
              type="file"
            />
            <div className="tool-buttons">
              <IconButton label="Attach file" onClick={() => fileInputRef.current?.click()}>
                <Paperclip size={18} />
              </IconButton>
              <IconButton label="Attach image" onClick={() => fileInputRef.current?.click()}>
                <Image size={18} />
              </IconButton>
            </div>
            <button
              aria-label="Send message"
              className="send-button"
              disabled={!canSend}
              type="submit"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </form>
    </footer>
  );
}

function IconButton({ children, label, onClick }) {
  return (
    <button
      aria-label={label}
      className="icon-button"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

export default Composer;
