import { useRef, useState } from "react";
import { IconLike } from "./SvgIcon";
import InputImage from "./InputImage";
import { Picker } from "emoji-mart";
import TextArea from "antd/es/input/TextArea";

const ChatForm = ({ handleSubmit }) => {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [fileList, setFileList] = useState([]);
  const inputRef = useRef(null);

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
        className={`cursor-pointer hover:opacity-60 ${
          fileList.length > 0 ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <svg
          aria-label="Emoji"
          color="#262626"
          fill="#262626"
          height="24"
          role="img"
          viewBox="0 0 24 24"
          width="24"
        >
          <path d="M15.83 10.997a1.167 1.167 0 101.167 1.167 1.167 1.167 0 00-1.167-1.167zm-6.5 1.167a1.167 1.167 0 10-1.166 1.167 1.167 1.167 0 001.166-1.167zm5.163 3.24a3.406 3.406 0 01-4.982.007 1 1 0 10-1.557 1.256 5.397 5.397 0 008.09 0 1 1 0 00-1.55-1.263zM12 .503a11.5 11.5 0 1011.5 11.5A11.513 11.513 0 0012 .503zm0 21a9.5 9.5 0 119.5-9.5 9.51 9.51 0 01-9.5 9.5z"></path>
        </svg>
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
        ref={inputRef}
        className="flex-1 outline-none text-sm scrollbar"
        value={message}
        onChange={handleTyping}
        onKeyDown={handleKeyDown}
        placeholder={fileList.length > 0 ? "Bạn đã chọn ảnh!" : "Message..."}
        autoSize={{ minRows: 1, maxRows: 3 }}
        onFocus={() => setShowEmojis(false)}
        disabled={fileList.length > 0}
      />

      {fileList.length > 0 ? (
        <div className="absolute bottom-14 left-0 bg-white p-2 rounded-lg shadow-lg z-10">
          <InputImage fileList={fileList} onChange={setFileList} />
        </div>
      ) : null}

      {/* Gửi tin nhắn hoặc ảnh */}
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
