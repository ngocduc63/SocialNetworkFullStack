import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  clearErrors,
  deleteMessage,
  getAllMessages,
  sendMessage,
} from "../../actions/messageAction";
import { getUserDetailsById } from "../../actions/userAction";
import {
  ALL_MESSAGES_ADD,
  ALL_MESSAGES_DELETE,
} from "../../constants/messageConstants";
import { BASE_PROFILE_IMAGE_URL } from "../../utils/constants";
import Sidebar from "./Sidebar";
import SearchModal from "./SearchModal";
import SpinLoader from "../Layouts/SpinLoader";
import MetaData from "../Layouts/MetaData";
import { USER_DETAILS_RESET } from "../../constants/userConstants";
import { AppContext } from "../../context/AppContext";
import { IconDetailChat } from "./SvgIcon";
import { CloseOutlined } from "@ant-design/icons";
import ChatDetailModal from "./ChatDetailModal";
import ChatForm from "./ChatForm";
import ChatBox from "./ChatBox";
import { updateLastMess } from "../../reducers/chatsReducer";
import VideoCallButton from "../VideoCall/VideoCallButton";

const Inbox = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const inputRef = useRef(null);
  const [message, setMessage] = useState("");
  const { socket } = useContext(AppContext);

  const [typing, setTyping] = useState(false);
  const [isReply, setIsReply] = useState(false);
  const [messReply, setMessReply] = useState({});
  const [isShowDetailChat, setIsShowDetailChat] = useState(false);

  const [isOnline, setIsOnline] = useState(false);

  const [showSearch, setShowSearch] = useState(false);

  const chatId = params.chatId;
  const { user: loggedInUser } = useSelector((state) => state.user);
  const { user: friend } = useSelector((state) => state.userDetails);
  const chat = useSelector((state) =>
    state.allChats.chats.find((chat) => chat._id === chatId),
  );
  const roomName = chat?.name ?? null;
  const listUser = chat?.users ?? [];
  const { error, loading } = useSelector((state) => state.allMessages);

  const userId = params.userId;

  useEffect(() => {
    if (!socket || !loggedInUser || !chatId) return;
    socket.current.emit("joinRoom", `chat_${chatId}`);
    socket.current.on("receiveMessage", (data) => {
      dispatch({
        type: ALL_MESSAGES_ADD,
        payload: data,
      });
      dispatch(updateLastMess(chatId, data));
    });
    socket.current.on("receiveDeleteMessage", (data) => {
      const { senderId, messId } = data;
      if (senderId !== loggedInUser._id) {
        dispatch({
          type: ALL_MESSAGES_DELETE,
          payload: {
            messId,
          },
        });
      }
    });
    return () => {
      socket.current.emit("leaveRoom", chatId);
    };
  }, [socket, chatId, loggedInUser]);

  useEffect(() => {
    socket.current.emit("addUser", loggedInUser._id);
    socket.current.on("getUsers", (users) => {
      setIsOnline(users.some((u) => u.userId === userId));
    });
  }, [loggedInUser._id, userId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (params.chatId && userId) {
      dispatch(getAllMessages(params.chatId));
      dispatch(getUserDetailsById(userId));
    }

    return () => {
      dispatch({ type: USER_DETAILS_RESET });
    };
  }, [dispatch, error, params.chatId, userId]);

  const handleSubmit = useCallback(
    ({ mess = message, fileList = [] }) => {
      const formData = new FormData();
      formData.append("chatId", params.chatId);
      formData.append("content", fileList?.length > 0 ? "Đã gửi ảnh" : mess);
      if (messReply) formData.append("idReply", JSON.stringify(messReply));

      fileList?.forEach((file, index) => {
        formData.append(`images`, file.originFileObj);
      });

      dispatch(sendMessage(formData)).then((data) => {
        socket?.current.emit("sendMessage", {
          _id: data.newMessage?._id,
          chatId: chatId,
          sender: loggedInUser._id,
          receiver: userId,
          content: fileList?.length > 0 ? "Đã gửi ảnh" : mess,
          idReply: messReply,
          images: data.newMessage.images,
          type: fileList?.length > 0 ? "image" : mess,
          createdAt: Date.now(),
        });
        setMessage("");
      });
      if (messReply) {
        handleSetReply();
      }
    },
    [messReply, message, chatId],
  );

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!typing) {
      setTyping(true);
      socket?.current.emit("typing", {
        senderId: loggedInUser._id,
        receiverId: userId,
      });
    }

    setTimeout(() => {
      socket?.current.emit("typing stop", {
        senderId: loggedInUser._id,
        receiverId: userId,
      });
      setTyping(false);
    }, 2000);
  };

  const handleModalClose = () => {
    setShowSearch(false);
  };

  const openModal = () => {
    setShowSearch(true);
  };

  const handleSetReply = useCallback((mess = null) => {
    if (mess && inputRef.current) {
      setIsReply(true);
      inputRef.current.focus();
    } else {
      setIsReply(false);
    }
    setMessReply(mess);
  }, []);

  const handleDeleteMessage = useCallback(
    (messId, senderId) => {
      if (messId && dispatch && socket && senderId) {
        dispatch(deleteMessage(messId));
        socket?.current.emit("deleteMessage", {
          chatId: chatId,
          messId,
          senderId,
          isDelete: true,
        });
      }
    },
    [dispatch, socket],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        handleSubmit(e, message);
        setMessage("");
      }
    }
  };

  const showDetailChat = () => {
    setIsShowDetailChat(true);
  };

  const hiddenDetailChat = () => {
    setIsShowDetailChat(false);
  };

  return (
    <>
      {isShowDetailChat && (
        <ChatDetailModal
          chat={chat}
          open={showDetailChat}
          onClose={hiddenDetailChat}
          users={listUser}
        />
      )}
      <MetaData title="Pollux • Chats" />

      <div className="mt-14 sm:mt-[4.7rem] pb-4 rounded h-[90vh] xl:w-4/5 mx-auto sm:pr-14 sm:pl-8">
        <div className="flex border h-full rounded w-full bg-white">
          {/* sidebar */}
          <Sidebar openModal={openModal} />

          {!userId ? (
            <div className="flex flex-col items-center justify-center w-full sm:w-4/6 gap-2">
              <div className="w-24 h-24 flex items-center p-2 justify-center border-2 border-black rounded-full">
                <img
                  draggable="false"
                  loading="lazy"
                  className="w-full h-full rotate-12 object-contain"
                  src="https://static.thenounproject.com/png/172101-200.png"
                  alt="message"
                />
              </div>
              <h2 className="text-2xl font-thin">Your Messages</h2>
              <p className="text-gray-400 text-sm">
                Send private photos and messages to a friend or group.
              </p>
              <button
                onClick={openModal}
                className="bg-primary-blue rounded px-2.5 mt-2 py-1.5 text-white text-sm font-medium hover:drop-shadow-lg"
              >
                Send Message
              </button>
            </div>
          ) : (
            <div className="flex flex-col justify-between w-full sm:w-4/6">
              {/* header */}
              <div className="flex py-3 px-6 border-b items-center justify-between">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 relative">
                    {roomName ? (
                      <img
                        draggable="false"
                        loading="lazy"
                        className="w-full h-full rounded-full object-cover"
                        src={
                          BASE_PROFILE_IMAGE_URL + chat?.avatar ?? "hero.png"
                        }
                        alt="avatar"
                      />
                    ) : (
                      <img
                        draggable="false"
                        loading="lazy"
                        className="w-full h-full rounded-full object-cover"
                        src={BASE_PROFILE_IMAGE_URL + friend.avatar}
                        alt="avatar"
                      />
                    )}

                    {isOnline && (
                      <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium cursor-pointer">
                    {roomName ?? friend.name}
                  </span>
                </div>
                <div className={"flex gap-2 items-center"}>
                  {!roomName && (
                    <VideoCallButton
                      receiverId={friend._id}
                      currentUserId={loggedInUser._id}
                    />
                  )}
                  <IconDetailChat showDetailChat={showDetailChat} />
                </div>
              </div>

              {/* messages */}
              <div className="w-full flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden p-4 scrollbar">
                {loading ? (
                  <SpinLoader />
                ) : (
                  <ChatBox
                    loggedInUser={loggedInUser}
                    chat={chat}
                    roomName={roomName}
                    friend={friend}
                    handleSetReply={handleSetReply}
                    handleDeleteMessage={handleDeleteMessage}
                  />
                )}
              </div>

              {/*message reply*/}
              {isReply && (
                <div className="flex flex-col gap-1 p-2 bg-gray-100 rounded-lg border-l-4 border-violet-600 text-sm text-gray-700 mx-5 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-violet-600">
                      Đang trả lời{" "}
                      <span className="font-bold">
                        {messReply.sender === loggedInUser._id
                          ? "Chính mình"
                          : friend.name}
                      </span>
                    </span>
                    <button
                      className="p-1 hover:bg-gray-200 rounded-full"
                      onClick={() => handleSetReply()}
                    >
                      <CloseOutlined className="text-gray-600" />
                    </button>
                  </div>
                  <span className="truncate">{messReply.content}</span>
                </div>
              )}

              {/* message input */}
              <ChatForm
                handleSubmit={handleSubmit}
                handleKeyDown={handleKeyDown}
                inputRef={inputRef}
              />
            </div>
          )}
        </div>

        <SearchModal open={showSearch} onClose={handleModalClose} />
      </div>
    </>
  );
};

export default Inbox;
