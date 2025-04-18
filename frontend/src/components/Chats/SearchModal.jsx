import Dialog from "@mui/material/Dialog";
import axios from "axios";
import { BASE_PROFILE_IMAGE_URL } from "../../utils/constants";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NEW_CHAT_RESET } from "../../constants/chatConstants";
import { toast } from "react-toastify";
import { addMembers, addNewChat, clearErrors } from "../../actions/chatAction";
import { Button, Checkbox, Skeleton } from "@mui/material";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const NewDialog = ({
  open,
  onClose,
  isAddMember = false,
  chatId = null,
  userIds = [],
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { user: self } = useSelector((state) => state.user);
  const { error, chat } = useSelector((state) => state.newChat);

  const fetchUsers = async (term) => {
    if (!term.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/users?keyword=${term}`);
      if (isAddMember) {
        setUsers(data.users.filter((u) => !userIds.includes(u._id)));
      } else {
        setUsers(data.users.filter((u) => u._id !== self._id));
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const createChat = () => {
    if (isAddMember) {
      dispatch(addMembers(chatId, selectedUsers));
      onClose();
    } else {
      if (selectedUsers.length === 1) {
        dispatch(addNewChat([selectedUsers[0]]));
      } else {
        dispatch(addNewChat(selectedUsers));
      }
    }
    setSearchTerm("");
    setSelectedUsers([]);
  };

  useEffect(() => {
    if (isAddMember) return;
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (chat) {
      const friendId = chat.users?.find((id) => id !== self._id);
      navigate(`/direct/t/${chat._id}/${friendId}`);
      dispatch({ type: NEW_CHAT_RESET });
      onClose();
    }
  }, [dispatch, error, chat, navigate, isAddMember]);

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex flex-col w-80 sm:w-96">
        <div className="flex justify-between items-center px-4 border-b py-2.5">
          <span className="font-medium mx-auto">
            {isAddMember ? "Thêm thành viên" : "Tạo đoạn chat"}
          </span>
          <svg
            onClick={onClose}
            className="cursor-pointer"
            aria-label="Close"
            color="#262626"
            fill="#262626"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <line
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              x1="21"
              x2="3"
              y1="3"
              y2="21"
            ></line>
            <line
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              x1="21"
              x2="3"
              y1="21"
              y2="3"
            ></line>
          </svg>
        </div>

        <div className="flex items-center gap-3 border-b p-3">
          <span className="font-medium">User:</span>
          <input
            className="outline-none w-full"
            type="text"
            placeholder="Tìm User.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col overflow-x-hidden h-96 w-full">
          {loading ? (
            Array(8)
              .fill("")
              .map((_, i) => (
                <div className="flex items-center gap-2 py-2 px-4" key={i}>
                  <Skeleton
                    animation="wave"
                    variant="circular"
                    width={60}
                    height={50}
                  />
                  <div className="flex flex-col gap-0 w-full">
                    <Skeleton height={23} width="45%" animation="wave" />
                    <Skeleton height={23} width="30%" animation="wave" />
                  </div>
                </div>
              ))
          ) : users.length > 0 ? (
            users.map((u) => (
              <div
                onClick={() => handleUserSelect(u._id)}
                className="flex items-center hover:bg-gray-50 py-2 px-4 cursor-pointer"
                key={u._id}
              >
                <Checkbox
                  checked={selectedUsers.includes(u._id)}
                  onChange={() => handleUserSelect(u._id)}
                  color="primary"
                />
                <div className="flex space-x-3 items-center">
                  <img
                    draggable="false"
                    className="w-11 h-11 rounded-full object-cover"
                    src={BASE_PROFILE_IMAGE_URL + u.avatar}
                    alt="avatar"
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-black text-sm font-semibold">
                      {u.username}
                    </span>
                    <span className="text-gray-400 text-sm">{u.name}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <span className="text-gray-400 text-sm p-2">
              No accounts found.
            </span>
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="border-t p-3 flex justify-end">
            <Button
              onClick={createChat}
              variant="contained"
              color="primary"
              disabled={selectedUsers.length === 0}
            >
              {isAddMember
                ? "Thêm"
                : selectedUsers.length === 1
                  ? "Tạo chat"
                  : "Tạo nhóm"}
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default NewDialog;
