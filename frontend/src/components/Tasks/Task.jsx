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
import TextArea from "antd/es/input/TextArea";

const Task = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const inputRef = useRef(null);
  const [message, setMessage] = useState("");
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
      if (data?.senderId === userId) {
        dispatch({
          type: ALL_MESSAGES_ADD,
          payload: {
            sender: data.senderId,
            content: data.content,
            idReply: data.idReply,
            createdAt: Date.now(),
          },
        });
      }
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        handleSubmit(e, message);
        setMessage("");
      }
    }
  };

  return (
    <>
      {/* <MetaData title="Instagram • Chats" /> */}

      <div className="mt-14 sm:mt-[4.7rem] pb-4 rounded h-[90vh] xl:w-2/3 mx-auto sm:pr-14 sm:pl-8">
        <div className="flex border h-full rounded w-full bg-white">
          {/* sidebar */}
          <Sidebar openModal={openModal} />

        </div>

        <SearchModal open={showSearch} onClose={handleModalClose} />
      </div>
    </>
  );
};

export default Task;
