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
  getAllMessages,
  sendMessage,
} from "../../actions/messageAction";
import { getUserDetailsById } from "../../actions/userAction";
import {
  ALL_MESSAGES_ADD,
  NEW_MESSAGE_RESET,
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
import { IconAddImage, IconLike } from "./SvgIcon";
import { CloseOutlined } from "@ant-design/icons";

const Inbox = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const inputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef(null);
  const { socket } = useContext(AppContext);

  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingData, setTypingData] = useState({});
  const [isReply, setIsReply] = useState(false);
  const [messReply, setMessReply] = useState({});

  const [isOnline, setIsOnline] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const [showSearch, setShowSearch] = useState(false);

  const { user: loggedInUser } = useSelector((state) => state.user);
  const { user: friend } = useSelector((state) => state.userDetails);
  const { error, messages, loading } = useSelector(
    (state) => state.allMessages,
  );
  const { success, newMessage } = useSelector((state) => state.newMessage);

  const userId = params.userId;

  useEffect(() => {
    if (!socket) return;
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        content: data.content,
        idReply: data.idReply,
        createdAt: Date.now(),
      });
    });
    socket.current.on("typing", (senderId) => {
      setTypingData({ senderId, typing: true });
    });
    socket.current.on("typing stop", (senderId) => {
      setTypingData({ senderId, typing: false });
    });
  }, [socket]);

  useEffect(() => {
    typingData &&
      typingData.senderId === userId &&
      setIsTyping(typingData.typing);
  }, [typingData, userId]);

  useEffect(() => {
    arrivalMessage &&
      arrivalMessage.sender === userId &&
      dispatch({
        type: ALL_MESSAGES_ADD,
        payload: arrivalMessage,
      });
    // console.log(arrivalMessage);
  }, [arrivalMessage, userId]);

  useEffect(() => {
    socket.current.emit("addUser", loggedInUser._id);
    socket.current.on("getUsers", (users) => {
      // console.log(users);
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

  useEffect(() => {
    if (success) {
      dispatch({
        type: ALL_MESSAGES_ADD,
        payload: newMessage,
      });
      dispatch({ type: NEW_MESSAGE_RESET });
    }
  }, [dispatch, success]);

  const handleSubmit = useCallback(
    (e, msg = message) => {
      e.preventDefault();

      socket?.current.emit("sendMessage", {
        senderId: loggedInUser._id,
        receiverId: userId,
        content: msg,
        idReply: messReply,
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
    [messReply, message],
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

  return (
    <>
      <MetaData title="Instagram • Chats" />

      <div className="mt-14 sm:mt-[4.7rem] pb-4 rounded h-[90vh] xl:w-2/3 mx-auto sm:pr-14 sm:pl-8">
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
                    <img
                      draggable="false"
                      loading="lazy"
                      className="w-full h-full rounded-full object-cover"
                      src={BASE_PROFILE_IMAGE_URL + friend.avatar}
                      alt="avatar"
                    />
                    {isOnline && (
                      <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium cursor-pointer">
                    {friend.name}
                  </span>
                </div>
                <svg
                  className="cursor-pointer"
                  aria-label="View Thread Details"
                  color="#262626"
                  fill="#262626"
                  height="24"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <circle
                    cx="12.001"
                    cy="12.005"
                    fill="none"
                    r="10.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></circle>
                  <circle cx="11.819" cy="7.709" r="1.25"></circle>
                  <line
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    x1="10.569"
                    x2="13.432"
                    y1="16.777"
                    y2="16.777"
                  ></line>
                  <polyline
                    fill="none"
                    points="10.569 11.05 12 11.05 12 16.777"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></polyline>
                </svg>
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
                        friend={friend}
                        message={mess}
                        handleSetReply={handleSetReply}
                      />
                      <div ref={scrollRef}></div>
                    </React.Fragment>
                  ))
                )}
                {isTyping && (
                  <>
                    <div className="flex items-center gap-3 max-w-xs">
                      <img
                        draggable="false"
                        loading="lazy"
                        className="w-7 h-7 rounded-full object-cover"
                        src={BASE_PROFILE_IMAGE_URL + friend.avatar}
                        alt="avatar"
                      />
                      <span className="text-sm text-gray-500">typing...</span>
                    </div>
                    <div ref={scrollRef}></div>
                  </>
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
                  <span className="truncate max-w-xs">{messReply.content}</span>
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
                <input
                  ref={inputRef}
                  className="flex-1 outline-none text-sm"
                  type="text"
                  placeholder="Message..."
                  value={message}
                  onFocus={() => setShowEmojis(false)}
                  onChange={handleTyping}
                  required
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
