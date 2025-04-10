import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { VideoCameraOutlined } from "@ant-design/icons";
import { AppContext } from "../../context/AppContext";

const VideoCallButton = ({ receiverId, currentUserId }) => {
  const navigate = useNavigate();
  const { socket } = useContext(AppContext);

  const initiateCall = () => {
    // Gửi thông báo cuộc gọi tới server
    socket.current.emit("initiate-call", {
      callerId: currentUserId,
      receiverId: receiverId,
    });

    // Mở tab mới để bắt đầu cuộc gọi
    const callUrl = `/video-call?caller=${currentUserId}&receiver=${receiverId}`;
    window.open(callUrl, "_blank");
  };

  return (
    <button
      onClick={initiateCall}
      className="p-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
      aria-label="Video Call"
    >
      <VideoCameraOutlined size={20} />
    </button>
  );
};

export default VideoCallButton;
