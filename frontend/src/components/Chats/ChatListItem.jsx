import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { BASE_PROFILE_IMAGE_URL } from "../../utils/constants";
import { AppContext } from "../../context/AppContext";

const ChatListItem = ({
  _id,
  users,
  latestMessage,
  avatar = null,
  name = "",
}) => {
  const dispatch = useDispatch();
  const params = useParams();
  const [friend, setFriend] = useState({});

  const { socket } = useContext(AppContext);
  const [isOnline, setIsOnline] = useState(false);

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const friendDetails = users.find((u) => u._id !== user._id);
    setFriend(friendDetails);
  }, [users]);

  useEffect(() => {
    if (!socket) return;
    socket.current.on("getUsers", (users) => {
      // console.log(users);
      setIsOnline(users.some((u) => u.userId === friend._id));
    });
  }, [friend._id, socket]);

  return (
    <Link
      to={`/direct/t/${_id}/${friend._id}`}
      className={`${params.chatId === _id && "bg-gray-100"} flex gap-3 items-center py-2 px-4 cursor-pointer hover:bg-gray-100`}
    >
      <div className="w-14 h-14 relative">
        {name ? (
          <img
            draggable="false"
            className="w-full h-full rounded-full object-cover"
            src={BASE_PROFILE_IMAGE_URL + avatar ?? "hero.png"}
            alt="avatar"
          />
        ) : (
          <img
            draggable="false"
            className="w-full h-full rounded-full object-cover"
            src={BASE_PROFILE_IMAGE_URL + friend.avatar}
            alt="avatar"
          />
        )}
        {isOnline && (
          <div className="absolute right-0 bottom-0.5 h-3 w-3 bg-green-500 rounded-full"></div>
        )}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm">{name ? name : friend.name}</span>
        <span className="text-sm truncate w-36 text-gray-400">
          {latestMessage?.content}
        </span>
      </div>
    </Link>
  );
};

export default ChatListItem;
