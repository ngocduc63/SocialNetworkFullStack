import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import { Dropdown, notification, Popconfirm } from "antd";
import {
  deleteNotification,
  getRecentNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "../../actions/notificationActions";
import { useDispatch, useSelector } from "react-redux";
import { likeFillBlack, likeOutline } from "./SvgIcons";
import { BASE_PROFILE_IMAGE_URL } from "../../utils/constants";
import moment from "moment";
import "moment/locale/vi";
import { AppContext } from "../../context/AppContext";

moment.locale("vi");

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { socket } = useContext(AppContext);
  const { recentNotifications, unreadCount, loading, error } = useSelector(
    (state) => state.notification,
  );
  const { user } = useSelector((state) => state.user);

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const [localNotifications, setLocalNotifications] = useState([]);

  // Khởi tạo API thông báo của Ant Design
  const [api, contextHolder] = notification.useNotification();

  // Cập nhật state local từ redux state
  useEffect(() => {
    if (recentNotifications?.length > 0) {
      setLocalNotifications(recentNotifications);
    }
  }, [recentNotifications]);

  useEffect(() => {
    setLocalUnreadCount(unreadCount);
  }, [unreadCount]);

  // Hàm hiển thị thông báo toast
  const showNotification = (type, message, description) => {
    api[type]({
      message,
      description,
      placement: "topRight",
      duration: 10, // Hiển thị trong 3 giây
    });
  };

  // Tải thông báo khi mở dropdown
  useEffect(() => {
    if (open) {
      dispatch(getRecentNotifications());
    }
  }, [open, dispatch]);

  // Tải số lượng thông báo chưa đọc khi component mount
  useEffect(() => {
    dispatch(getUnreadCount());

    // Cập nhật định kỳ số lượng thông báo chưa đọc
    const interval = setInterval(() => {
      dispatch(getUnreadCount());
    }, 60000); // Mỗi phút

    return () => clearInterval(interval);
  }, [dispatch]);

  // Lắng nghe thông báo mới từ socket
  useEffect(() => {
    if (socket && socket.current && socket.current.connected) {
      console.log("Đang lắng nghe sự kiện newNotification từ socket");

      socket.current.on("newNotification", (data) => {
        console.log("Nhận thông báo mới từ socket:", data);

        // Hiển thị toast khi có thông báo mới
        const senderName =
          data.sender?.username || data.sender?.name || "Ai đó";
        const notificationText =
          data.text || data.content || "đã tương tác với bạn";

        showNotification(
          "info",
          "Thông báo mới",
          `${senderName} ${notificationText}`,
        );

        // Cập nhật số lượng thông báo chưa đọc ngay lập tức
        setLocalUnreadCount((prev) => prev + 1);

        // Thêm thông báo mới vào danh sách local
        setLocalNotifications((prev) => [data, ...prev]);

        // Cập nhật redux state (vẫn quan trọng để lưu trữ lâu dài)
        dispatch(getUnreadCount());

        // Nếu dropdown đang mở, cập nhật danh sách thông báo
        if (open) {
          dispatch(getRecentNotifications());
        }
      });
    }

    return () => {
      if (socket && socket.current) {
        socket.current.off("newNotification");
      }
    };
  }, [socket, dispatch, open]);

  const getRedirectUrl = (notification) => {
    // Nếu đã có URL được định nghĩa trước, sử dụng nó
    if (notification.redirectUrl) {
      return notification.redirectUrl;
    }

    // Kiểm tra và chuyển đổi post ID nếu cần
    let postId = notification.post;
    if (postId && typeof postId === "object" && postId._id) {
      postId = postId._id;
    } else if (postId && typeof postId === "object") {
      postId = String(postId);
    }

    // Kiểm tra và xử lý theo type của thông báo
    if (notification.type === "like") {
      // Nếu thông báo like liên quan đến comment
      if (notification.comment) {
        // Chuyển đến bài đăng với focus đến comment được like
        return `/post/${postId}?comment=${notification.comment}`;
      }
      // Nếu thông báo like liên quan đến bài đăng
      else if (postId) {
        // Chuyển đến bài đăng được like
        return `/post/${postId}`;
      }
    }

    // Xử lý các loại thông báo khác
    if (postId) {
      return `/post/${postId}`;
    }

    if (notification.type === "follow") {
      return `/${notification.sender?.username || ""}`;
    }

    if (notification.comment && notification.post) {
      return `/post/${notification.post}?comment=${notification.comment}`;
    }

    // Trả về trang chủ nếu không có thông tin khác
    return "/";
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        // Cập nhật UI ngay lập tức
        setLocalUnreadCount((prev) => Math.max(0, prev - 1));
        setLocalNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id ? { ...item, read: true } : item,
          ),
        );

        // Cập nhật trên server
        dispatch(markAsRead(notification._id));

        // Thông báo qua socket nếu cần
        if (socket && socket.current && socket.current.connected) {
          socket.current.emit("markNotificationRead", {
            notificationId: notification._id,
            userId: user._id,
          });
        }
      }

      // Đóng dropdown thông báo
      setOpen(false);

      // Lấy URL đích cơ bản
      let redirectUrl = getRedirectUrl(notification);

      // Thêm tham số query cho thông báo like
      if (
        notification.type === "like" &&
        notification.post &&
        !notification.comment
      ) {
        // Nếu là like post thì thêm tham số action=like để highlight phần like
        redirectUrl = `${redirectUrl}?action=like`;
      }

      // Chuyển hướng đến URL
      navigate(redirectUrl);

      console.log("Chuyển hướng đến:", redirectUrl);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showNotification(
        "error",
        "Lỗi đánh dấu đã đọc",
        "Không thể đánh dấu thông báo là đã đọc. Vui lòng thử lại.",
      );
    }
  };
  const handleMarkAllAsRead = () => {
    // Cập nhật UI ngay lập tức
    setLocalUnreadCount(0);
    setLocalNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true })),
    );

    // Cập nhật trên server
    dispatch(markAllAsRead());

    // Thông báo qua socket nếu cần
    if (socket && socket.current && socket.current.connected) {
      socket.current.emit("markAllNotificationsRead", { userId: user._id });
    }

    showNotification(
      "success",
      "Đã đọc tất cả",
      "Tất cả thông báo đã được đánh dấu là đã đọc",
    );
  };
  // Thêm hàm xóa thông báo
  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài

    try {
      // Cập nhật UI ngay lập tức
      setLocalNotifications((prev) =>
        prev.filter((item) => item._id !== notificationId),
      );

      // Nếu thông báo chưa đọc, giảm số lượng chưa đọc
      const notif = localNotifications.find((n) => n._id === notificationId);
      if (notif && !notif.read) {
        setLocalUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Gọi API xóa thông báo
      await dispatch(deleteNotification(notificationId));

      showNotification(
        "success",
        "Đã xóa thông báo",
        "Thông báo đã được xóa thành công",
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
      showNotification(
        "error",
        "Lỗi xóa thông báo",
        "Không thể xóa thông báo. Vui lòng thử lại.",
      );
    }
  };

  const NotificationItem = ({ notification }) => (
    <div
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
        !notification.read ? "bg-gray-50" : ""
      }`}
    >
      <div
        className="flex-grow flex items-center"
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="mr-3">
          <img
            src={
              BASE_PROFILE_IMAGE_URL + notification.sender?.avatar ||
              "/default-avatar.png"
            }
            alt="Avatar"
            className="w-10 h-10 rounded-full border border-gray-200"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-start">
            <p className="text-sm">
              <span className="font-semibold">
                {notification.sender?.username ||
                  notification.sender?.name ||
                  "Người dùng"}
              </span>{" "}
              <span className="text-gray-600">
                {notification.type === "like"
                  ? notification.comment
                    ? "đã thích bình luận của bạn trong "
                    : "đã thích bài viết của bạn"
                  : notification.type === "comment"
                    ? "đã bình luận về bài viết của bạn"
                    : notification.type === "reply"
                      ? "đã trả lời bình luận của bạn"
                      : notification.type === "follow"
                        ? "đã theo dõi bạn"
                        : "đã tương tác với bạn"}
              </span>
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {moment(notification.createdAt).fromNow()}
          </p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
        )}
      </div>

      {/* Phần nút xóa thông báo đã được sửa */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <Popconfirm
          title="Xóa thông báo"
          description="Bạn có chắc muốn xóa thông báo này?"
          onConfirm={(e) => handleDeleteNotification(e, notification._id)}
          onCancel={(e) => e.stopPropagation()}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ style: { color: "black", borderColor: "black" } }}
          placement="leftTop"
          getPopupContainer={(trigger) => trigger.parentElement} // Đảm bảo popup hiển thị trong container đúng
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="ml-2 p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full"
          >
            <DeleteOutlined />
          </button>
        </Popconfirm>
      </div>
    </div>
  );
  const renderNotifications = () => {
    if (loading && localNotifications.length === 0) {
      return (
        <div className="flex justify-center items-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (error && localNotifications.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => dispatch(getRecentNotifications())}
            className="mt-2 text-blue-500 text-sm"
          >
            Thử lại
          </button>
        </div>
      );
    }

    if (!localNotifications || localNotifications.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <p className="text-gray-500">Không có thông báo nào</p>
        </div>
      );
    }

    const filteredNotifications =
      activeTab === "all"
        ? localNotifications
        : localNotifications.filter((n) => {
            const content = n.text || n.content || "";
            return content.includes("@");
          });

    return filteredNotifications.map((notification) => (
      <NotificationItem key={notification._id} notification={notification} />
    ));
  };

  const NotificationPopup = () => (
    <div className="fixed right-0 sm:absolute sm:right-0 top-2 w-full sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-screen overflow-hidden z-50">
      <div className="absolute right-5 -top-2 rotate-45 h-4 w-4 bg-white rounded-sm border-l border-t hidden sm:block"></div>

      {/* Header with tabs */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-3">
          <h3 className="font-semibold text-lg">Thông báo</h3>
          <button
            onClick={handleMarkAllAsRead}
            className="text-blue-500 text-sm font-medium"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Tabs - Instagram style */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "all"
                ? "text-black border-b-2 border-black"
                : "text-gray-500"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab("mentions")}
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "mentions"
                ? "text-black border-b-2 border-black"
                : "text-gray-500"
            }`}
          >
            Đề cập
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-h-[70vh] overflow-y-auto">
        {renderNotifications()}
      </div>
    </div>
  );

  return (
    <>
      {/* ContextHolder cho Ant Design Notification */}
      {contextHolder}

      <Dropdown
        open={open}
        onOpenChange={setOpen}
        dropdownRender={() => (
          <>
            <NotificationPopup />
          </>
        )}
        trigger={["click"]}
      >
        <div
          onClick={(e) => e.preventDefault()}
          className="relative cursor-pointer"
        >
          <div className="cursor-pointer sm:block rounded-full p-2 transition duration-300 hover:bg-gray-100">
            {open ? likeFillBlack : likeOutline}
          </div>
          {localUnreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {localUnreadCount > 9 ? "9+" : localUnreadCount}
            </div>
          )}
        </div>
      </Dropdown>
    </>
  );
};

export default Notifications;
