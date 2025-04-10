import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Message from "./Message";
import { ArrowDownOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const ChatBox = ({
  loggedInUser,
  chat,
  roomName,
  friend,
  handleSetReply,
  handleDeleteMessage,
}) => {
  const messageRefs = useRef({});
  const [targetMessageId, setTargetMessageId] = useState(null);
  const scrollRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { messages } = useSelector((state) => state.allMessages);

  const handleSetTargetMessage = useCallback((id) => {
    setTargetMessageId(id);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (targetMessageId && messageRefs.current[targetMessageId]) {
      messageRefs.current[targetMessageId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [targetMessageId]);

  useEffect(() => {
    const chatBox = chatContainerRef.current;
    if (!chatBox) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatBox;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 20);
    };

    chatBox.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => chatBox.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    setTargetMessageId(null);
  };

  return (
    <div
      ref={chatContainerRef}
      className="chat-container relative overflow-y-auto"
    >
      {messages.map((mess) => (
        <Fragment key={mess._id}>
          <div ref={(el) => (messageRefs.current[mess._id] = el)}>
            <Message
              ownMsg={mess.sender === loggedInUser._id}
              friend={
                roomName
                  ? chat.users.find((user) => user._id === mess.sender)
                  : friend
              }
              message={mess}
              handleSetReply={handleSetReply}
              handleDeleteMessage={handleDeleteMessage}
              targetMessageId={targetMessageId}
              setTargetMessageId={handleSetTargetMessage}
            />
          </div>
          <div ref={scrollRef}></div>
        </Fragment>
      ))}

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 right-1/3 bg-purple-500 text-white p-3 rounded-full shadow-lg hover:bg-purple-600 transition"
        >
          <ArrowDownOutlined size={20} />
        </button>
      )}
    </div>
  );
};

export default ChatBox;
