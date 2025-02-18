import { BASE_PROFILE_IMAGE_URL } from "../../utils/constants";
import { EllipsisOutlined } from "@ant-design/icons";
import { useState } from "react";
import { ReplyIcon } from "./SvgIcon";

const IconContainer = ({ children, onClick }) => {
  return (
    <div
      className="p-1 hover:bg-gray-200 rounded-full cursor-pointer"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const MessageContainer = ({ children, ownMsg, handleSetReply, message }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`relative flex w-full flex-col ${ownMsg ? "items-end" : "items-start"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {message?.idReply && message?.idReply?.content && (
        <div className="bg-gray-100 rounded-lg px-3 py-1 max-w-xs -mb-1 text-sm text-gray-700 cursor-pointer">
          <div className="flex items-center gap-0.5 font-medium text-gray-500">
            <ReplyIcon className="text-gray-400 w-4 h-4" />
            <span>{"Đã trả lời tin nhắn"}</span>
          </div>
          <div className="text-gray-600 whitespace-pre-wrap break-words">
            {message.idReply.content}
          </div>
        </div>
      )}

      {/* Tin nhắn chính */}
      <div
        className={`flex items-center gap-2 ${!ownMsg ? "flex-row-reverse" : "flex-row"}`}
      >
        {hover && (
          <>
            <IconContainer>
              <EllipsisOutlined className="text-gray-600" />
            </IconContainer>
            <IconContainer onClick={() => handleSetReply(message)}>
              <ReplyIcon />
            </IconContainer>
          </>
        )}
        <div
          className={`flex flex-col ${ownMsg ? "items-end" : "items-start"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const Message = ({ ownMsg, friend, message, handleSetReply }) => {
  return ownMsg ? (
    <div className="flex justify-end w-full mb-2">
      <MessageContainer
        ownMsg={ownMsg}
        handleSetReply={handleSetReply}
        message={message}
      >
        {message.content === "❤️" ? (
          <span className="text-4xl">{message.content}</span>
        ) : (
          <span className="text-sm text-white bg-violet-600 px-4 py-3 rounded-3xl max-w-xs whitespace-pre-wrap break-words">
            {message.content}
          </span>
        )}
      </MessageContainer>
    </div>
  ) : (
    <div className="flex justify-start items-end gap-2 w-full mb-2">
      <img
        draggable="false"
        className="w-7 h-7 rounded-full object-cover"
        src={BASE_PROFILE_IMAGE_URL + friend.avatar}
        alt="avatar"
      />
      <MessageContainer
        ownMsg={ownMsg}
        handleSetReply={handleSetReply}
        message={message}
      >
        {message.content === "❤️" ? (
          <span className="text-4xl">{message.content}</span>
        ) : (
          <span className="px-4 py-3 text-sm bg-gray-200 rounded-3xl max-w-xs  whitespace-pre-wrap break-words">
            {message.content}
          </span>
        )}
      </MessageContainer>
    </div>
  );
};

export default Message;
