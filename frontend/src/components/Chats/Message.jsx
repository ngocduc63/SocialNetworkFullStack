import {
  BASE_POST_IMAGE_URL,
  BASE_PROFILE_IMAGE_URL,
} from "../../utils/constants";
import { DeleteOutlined, EllipsisOutlined } from "@ant-design/icons";
import { useState } from "react";
import { ReplyIcon } from "./SvgIcon";
import { Modal, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";

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

const MessageContainer = ({
  children,
  ownMsg,
  handleSetReply,
  message,
  handleDeleteMessage,
  checkIsDelete,
  isPostShare,
  handlePostClick,
}) => {
  const [hover, setHover] = useState(false);
  const showDeleteConfirm = () => {
    Modal.confirm({
      title: "Xác nhận xóa tin nhắn",
      content: "Bạn có chắc chắn muốn xóa tin nhắn này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => handleDeleteMessage(message._id, message.sender),
    });
  };

  // Kiểm tra xem có phải là tin nhắn chia sẻ bài viết không
  if (isPostShare) {
    return (
      <div
        className={`relative flex w-full flex-col ${
          ownMsg ? "items-end" : "items-start"
        }`}
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

        <div
          className={`flex items-center gap-2 ${
            !ownMsg ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {hover && !checkIsDelete && (
            <>
              {ownMsg && (
                <IconContainer onClick={showDeleteConfirm}>
                  <DeleteOutlined className="text-red-500" />
                </IconContainer>
              )}
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
            onClick={handlePostClick}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex w-full flex-col ${
        ownMsg ? "items-end" : "items-start"
      }`}
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

      <div
        className={`flex items-center gap-2 ${
          !ownMsg ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {hover && !checkIsDelete && (
          <>
            {ownMsg && (
              <IconContainer onClick={showDeleteConfirm}>
                <DeleteOutlined className="text-red-500" />
              </IconContainer>
            )}
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

const Message = ({
  ownMsg,
  friend,
  message,
  handleSetReply,
  handleDeleteMessage,
}) => {
  const navigate = useNavigate();
  const checkIsDelete = message.content === "Tin nhắn đã bị xóa";
  // const isPostShare = message.isPostShare && message.sharedPost;
  const isPostShare =
    !checkIsDelete && message.isPostShare && message.sharedPost;
  // Xử lý khi click vào tin nhắn chia sẻ bài viết
  const handlePostClick = () => {
    if (isPostShare) {
      // Lấy ID của bài viết
      const postId =
        typeof message.sharedPost === "object"
          ? message.sharedPost._id
          : message.sharedPost;

      // Chuyển hướng đến trang bài viết
      navigate(`/post/${postId}`);
    }
  };

  // Render tin nhắn chia sẻ bài viết
  const renderPostShareMessage = () => {
    return (
      <div
        className="post-share-message cursor-pointer border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-all max-w-xs"
        onClick={handlePostClick}
      >
        <div className="text-sm">{message.content}</div>

        {message.sharedPost && (
          <div className="mt-2 border-t pt-2">
            <div className="flex items-center">
              {message.sharedPost.image && (
                <img
                  src={BASE_POST_IMAGE_URL + message.sharedPost.image}
                  alt="Ảnh bài viết"
                  className="w-12 h-12 object-cover rounded-md"
                />
              )}
              <div className="ml-2">
                {message.sharedPost.postedBy && (
                  <div className="text-sm font-semibold">
                    {typeof message.sharedPost.postedBy === "object"
                      ? message.sharedPost.postedBy.username
                      : "Bài viết"}
                  </div>
                )}
                {message.sharedPost.caption && (
                  <div className="text-xs text-gray-500 truncate max-w-[150px]">
                    {message.sharedPost.caption}
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-blue-500 mt-1">
              Bấm để xem bài viết
            </div>
          </div>
        )}
      </div>
    );
  };

  return ownMsg ? (
    <div className="flex justify-end w-full mb-2">
      <MessageContainer
        ownMsg={ownMsg}
        handleSetReply={handleSetReply}
        message={message}
        handleDeleteMessage={handleDeleteMessage}
        checkIsDelete={checkIsDelete}
        isPostShare={isPostShare}
        handlePostClick={handlePostClick}
      >
        {checkIsDelete ? (
          <span className="text-sm text-red-400 bg-gray-100 px-4 py-3 rounded-3xl max-w-xs whitespace-pre-wrap break-words">
            Tin nhắn đã bị xóa
          </span>
        ) : isPostShare ? (
          renderPostShareMessage()
        ) : message.content === "❤️" ? (
          <span className="text-4xl">{message.content}</span>
        ) : (
          <span
            className={`text-sm px-4 py-3 rounded-3xl max-w-xs whitespace-pre-wrap break-words ${
              ownMsg ? "text-white bg-violet-600" : "bg-gray-200"
            }`}
          >
            {message.content}
          </span>
        )}
      </MessageContainer>
    </div>
  ) : (
    <div className="flex justify-start items-end gap-2 w-full mb-2">
      <Tooltip title={friend.name}>
        <img
          draggable="false"
          className="w-7 h-7 rounded-full object-cover"
          src={BASE_PROFILE_IMAGE_URL + friend.avatar}
          alt="avatar"
        />
      </Tooltip>
      <MessageContainer
        ownMsg={ownMsg}
        handleSetReply={handleSetReply}
        message={message}
        handleDeleteMessage={handleDeleteMessage}
        checkIsDelete={checkIsDelete}
        isPostShare={isPostShare}
        handlePostClick={handlePostClick}
      >
        {checkIsDelete ? (
          <span className="text-sm text-red-400 bg-gray-100 px-4 py-3 rounded-3xl max-w-xs whitespace-pre-wrap break-words">
            Tin nhắn đã bị xóa
          </span>
        ) : isPostShare ? (
          renderPostShareMessage()
        ) : message.content === "❤️" ? (
          <span className="text-4xl">{message.content}</span>
        ) : (
          <span
            className={`text-sm px-4 py-3 rounded-3xl max-w-xs whitespace-pre-wrap break-words ${
              ownMsg ? "text-white bg-violet-600" : "bg-gray-200"
            }`}
          >
            {message.content}
          </span>
        )}
      </MessageContainer>
    </div>
  );
};

export default Message;
