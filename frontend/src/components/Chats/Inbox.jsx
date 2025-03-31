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
import Message from "./Message";
import { Picker } from "emoji-mart";
import SearchModal from "./SearchModal";
import SpinLoader from "../Layouts/SpinLoader";
import MetaData from "../Layouts/MetaData";
import { USER_DETAILS_RESET } from "../../constants/userConstants";
import { AppContext } from "../../context/AppContext";
import { IconAddImage, IconDetailChat, IconLike } from "./SvgIcon";
import { CloseOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import ChatDetailModal from "./ChatDetailModal";

const Inbox = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const inputRef = useRef(null);
  const [message, setMessage] = useState("");
  const scrollRef = useRef(null);
  const { socket } = useContext(AppContext);

  const [typing, setTyping] = useState(false);
  const [isReply, setIsReply] = useState(false);
  const [messReply, setMessReply] = useState({});
  const [isShowDetailChat, setIsShowDetailChat] = useState(false);

  const [isOnline, setIsOnline] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const [showSearch, setShowSearch] = useState(false);

  const chatId = params.chatId;
  const { user: loggedInUser } = useSelector((state) => state.user);
  const { user: friend } = useSelector((state) => state.userDetails);
  const chat = useSelector((state) =>
    state.allChats.chats.find((chat) => chat._id === chatId),
  );
  const roomName = chat?.name ?? null;
  const listUser = chat?.users ?? [];
  const { error, messages, loading } = useSelector(
    (state) => state.allMessages,
  );
  const { success, newMessage } = useSelector((state) => state.newMessage);

  const userId = params.userId;

  useEffect(() => {
    if (!socket || !loggedInUser || !chatId) return;
    socket.current.emit("joinRoom", `chat_${chatId}`);
    socket.current.on("receiveMessage", (data) => {
      dispatch({
        type: ALL_MESSAGES_ADD,
        payload: data,
      });
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
    (e, msg = message) => {
      e.preventDefault();

      socket?.current.emit("sendMessage", {
        chatId: chatId,
        sender: loggedInUser._id,
        receiver: userId,
        content: msg,
        idReply: messReply,
        createdAt: Date.now(),
      });

      const msgData = {
        chatId: params.chatId,
        content: msg,
        idReply: messReply,
      };

      dispatch(sendMessage(msgData)).then(() => setMessage(""));
      if (messReply) {
        handleSetReply();
      }
    },
    [messReply, message, chatId],
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      <MetaData title="Instagram • Chats" />

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
                <IconDetailChat showDetailChat={showDetailChat} />
              </div>

              {/* messages */}
              <div className="w-full flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden p-4 scrollbar">
                {loading ? (
                  <SpinLoader />
                ) : (
                  messages.map((mess, i) => (
                    <React.Fragment key={mess._id}>
                      <Message
                        ownMsg={mess.sender === loggedInUser._id}
                        friend={
                          roomName
                            ? chat.users.find(
                                (user) => user._id === mess.sender,
                              )
                            : friend
                        }
                        message={mess}
                        handleSetReply={handleSetReply}
                        handleDeleteMessage={handleDeleteMessage}
                      />
                      <div ref={scrollRef}></div>
                    </React.Fragment>
                  ))
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
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 justify-between border rounded-full py-2.5 px-4 mx-5 mb-5 relative"
              >
                <span
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="cursor-pointer hover:opacity-60"
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
                  placeholder="Message..."
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  onFocus={() => setShowEmojis(false)}
                />
                {isReply || message.trim().length > 0 ? (
                  <button className="text-primary-blue font-medium text-sm">
                    Send
                  </button>
                ) : (
                  <>
                    <IconAddImage />
                    <IconLike
                      className="cursor-pointer"
                      handleSubmit={handleSubmit}
                    />
                  </>
                )}
              </form>
            </div>
          )}
        </div>

        <SearchModal open={showSearch} onClose={handleModalClose} />
      </div>
    </>
  );
};

export default Inbox;
