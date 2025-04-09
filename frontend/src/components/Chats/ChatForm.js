import { useState } from "react";
import { IconLike } from "./SvgIcon";
import InputImage from "./InputImage";
import { Picker } from "emoji-mart";
import TextArea from "antd/es/input/TextArea";

const ChatForm = ({ handleSubmit, inputRef }) => {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleTyping = (e) => setMessage(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() || fileList.length > 0) {
        handleSubmit({ mess: message, fileList });
        setMessage("");
        setFileList([]);
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || fileList.length > 0) {
      handleSubmit({ mess: message, fileList });
      setMessage("");
      setFileList([]);
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex items-center gap-3 justify-between border rounded-full py-2.5 px-4 mx-5 mb-5 relative"
    >
      <span
        onClick={() => !fileList.length && setShowEmojis(!showEmojis)}
        className={`cursor-pointer hover:opacity-60 ${fileList.length > 0 ? "opacity-50 pointer-events-none" : ""}`}
      >
        {/* Icon Emoji */}
      </span>

      {showEmojis && (
        <div className="absolute bottom-14 -left-10">
          <Picker
            set="google"
            onSelect={(e) => setMessage(message + e.native)}
            title="Emojis"
          />
        </div>
      )}

      <TextArea
        ref={inputRef} // Sử dụng ref từ bên ngoài
        className="flex-1 outline-none text-sm scrollbar"
        value={message}
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        placeholder={fileList.length > 0 ? "Bạn đã chọn ảnh!" : "Message..."}
        autoSize={{ minRows: 1, maxRows: 3 }}
        onFocus={() => setShowEmojis(false)}
        disabled={fileList.length > 0}
      />

      {fileList.length > 0 && (
        <div className="absolute bottom-14 left-0 bg-white p-2 rounded-lg shadow-lg z-10">
          <InputImage fileList={fileList} onChange={setFileList} />
        </div>
      )}

      {message.trim() || fileList.length > 0 ? (
        <button className="text-primary-blue font-medium text-sm">Send</button>
      ) : (
        <>
          <InputImage onChange={setFileList} fileList={fileList} />
          <IconLike className="cursor-pointer" handleSubmit={handleSubmit} />
        </>
      )}
    </form>
  );
};

export default ChatForm;
