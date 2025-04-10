import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { useSelector } from "react-redux";

const CallNotification = ({ callerId, onReject }) => {
  const { socket } = useContext(AppContext);
  const { user: loggedInUser } = useSelector((state) => state.user);

  const currentUserId = loggedInUser._id; // Hoặc lấy từ context/redux

  const acceptCall = () => {
    // Gửi phản hồi chấp nhận cuộc gọi
    socket.current.emit("accept-call", {
      callerId,
      receiverId: currentUserId,
    });

    // Mở tab mới để tham gia cuộc gọi
    const callUrl = `/video-call?caller=${callerId}&receiver=${currentUserId}`;
    window.open(callUrl, "_blank");

    // Đóng thông báo
    onReject();
  };

  const rejectCall = () => {
    // Gửi phản hồi từ chối cuộc gọi
    socket.current.emit("reject-call", {
      callerId,
      receiverId: currentUserId,
    });

    // Đóng thông báo
    onReject();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 w-80">
      <h3 className="font-medium">Incoming Call</h3>
      <p className="text-sm text-gray-600 mb-4">
        User {callerId} is calling you
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={rejectCall}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Từ chối
        </button>
        <button
          onClick={acceptCall}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Trả lời
        </button>
      </div>
    </div>
  );
};

export default CallNotification;
