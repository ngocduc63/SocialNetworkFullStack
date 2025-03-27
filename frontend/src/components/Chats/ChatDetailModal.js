import { Button, Input, List, Modal } from "antd";
import { Avatar, Box, Checkbox, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/PersonAdd";
import { BASE_PROFILE_IMAGE_URL } from "../../utils/constants";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeMembers,
  renameGroup,
  updateAvatarGroup,
} from "../../actions/chatAction";
import SearchModal from "./SearchModal";

const ChatDetailModal = ({ chat, open, onClose, users }) => {
  const { user: loggedInUser } = useSelector((state) => state.user);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState(chat.name);
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const [isShowAddMember, setIsShowAddMember] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarInput = useRef(null);

  const groupAdmin = users[0];
  const isGroupAdmin = groupAdmin?._id === loggedInUser._id;

  const handleAvatarChange = (e) => {
    const reader = new FileReader();
    setAvatar("");
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    setAvatar(e.target.files[0]);
  };

  const handleSelect = (userId) => {
    if (isGroupAdmin && userId !== groupAdmin._id && users.length > 2) {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId],
      );
    }
  };

  const handleClearSelection = () => {
    dispatch(removeMembers(chat._id, selectedUsers));
    setSelectedUsers([]);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setGroupName(name);
  };

  const toggleEdit = () => {
    if (isGroupAdmin) {
      setIsEditing(!isEditing);
    }
  };

  const handleSaveName = () => {
    if (isGroupAdmin && chat.name !== groupName) {
      dispatch(renameGroup(chat._id, groupName));
    }
    if (avatar) {
      const formData = new FormData();
      formData.set("avatar", avatar);
      formData.set("chatId", chat._id);
      dispatch(updateAvatarGroup(formData));
    }
    setAvatarPreview("");
    setIsEditing(false);
  };

  const onOpenAddMember = () => {
    setIsShowAddMember(true);
  };

  const onCloseAddMember = () => {
    setIsShowAddMember(false);
  };

  return (
    <Modal
      title={
        chat.name ? (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <div className="flex flex-col items-center gap-2 ">
              <div
                className="w-11 h-11 cursor-pointer"
                onClick={(e) => avatarInput.current.click()}
              >
                <img
                  draggable="false"
                  className="w-full h-full rounded-full border object-cover"
                  src={
                    avatarPreview
                      ? avatarPreview
                      : (BASE_PROFILE_IMAGE_URL + chat?.avatar ?? "hero.png")
                  }
                  alt="avatar"
                />
              </div>
              <div className="flex flex-col gap-0">
                <label
                  onClick={(e) => avatarInput.current.click()}
                  className="text-sm font-medium text-primary-blue cursor-pointer"
                >
                  Đổi ảnh
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="avatar"
                  ref={avatarInput}
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>
            {isEditing && isGroupAdmin ? (
              <>
                <Input
                  value={groupName}
                  onChange={handleNameChange}
                  onPressEnter={handleSaveName}
                  style={{ width: "70%" }}
                />
              </>
            ) : (
              <Box>
                <Typography variant="h6" className="font-bold">
                  {groupName}
                </Typography>
                {groupAdmin && (
                  <Typography variant="caption" color="text.secondary">
                    {groupAdmin._id === loggedInUser._id ? "Trưởng nhóm" : ""}
                  </Typography>
                )}
              </Box>
            )}
            <Box className="flex gap-1 items-center">
              {isGroupAdmin && (
                <>
                  {isEditing || avatarPreview ? (
                    <Button
                      type="primary"
                      onClick={handleSaveName}
                      className="text-black"
                    >
                      Lưu
                    </Button>
                  ) : (
                    <>
                      <Button onClick={toggleEdit}>Đổi tên</Button>
                      {selectedUsers.length > 0 && users.length > 2 && (
                        <Button
                          type="primary"
                          danger
                          size="normal"
                          icon={<DeleteIcon />}
                          onClick={handleClearSelection}
                          style={{ marginLeft: 8 }}
                        >
                          Xóa ({selectedUsers.length})
                        </Button>
                      )}
                      <Button
                        type="default"
                        icon={<AddIcon />}
                        onClick={onOpenAddMember}
                        style={{ marginLeft: 8 }}
                      ></Button>
                    </>
                  )}
                </>
              )}
            </Box>
          </Box>
        ) : null
      }
      open={open}
      onCancel={onClose}
      closable={false}
      footer={null}
    >
      <List
        dataSource={users}
        renderItem={(user) => {
          const isSelected = selectedUsers.includes(user._id);
          const isAdmin = user._id === groupAdmin._id;

          return (
            <>
              <List.Item
                onClick={() => handleSelect(user._id)}
                style={{
                  cursor:
                    isGroupAdmin && !isAdmin && users.length > 2
                      ? "pointer"
                      : "default",
                  opacity:
                    isGroupAdmin && !isAdmin && users.length > 2 ? 1 : 0.7,
                }}
              >
                {isGroupAdmin && !isAdmin && users.length > 2 && (
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleSelect(user._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={BASE_PROFILE_IMAGE_URL + user.avatar}
                      sx={{ width: 50, height: 50 }}
                    />
                  }
                  title={user.name}
                  description={isAdmin ? "Trưởng nhóm" : undefined}
                />
              </List.Item>
              <SearchModal
                onClose={onCloseAddMember}
                open={isShowAddMember}
                isAddMember
                chatId={chat._id}
                userIds={chat.users.map((user) => user._id)}
              />
            </>
          );
        }}
      />
    </Modal>
  );
};

export default ChatDetailModal;
