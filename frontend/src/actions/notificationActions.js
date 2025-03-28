import axios from "axios";
import {
  CLEAR_NOTIFICATION_ERRORS,
  DELETE_NOTIFICATION_FAIL,
  DELETE_NOTIFICATION_REQUEST,
  DELETE_NOTIFICATION_SUCCESS,
  GET_NOTIFICATIONS_FAIL,
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_RECENT_NOTIFICATIONS_FAIL,
  GET_RECENT_NOTIFICATIONS_REQUEST,
  GET_RECENT_NOTIFICATIONS_SUCCESS,
  GET_UNREAD_COUNT_FAIL,
  GET_UNREAD_COUNT_REQUEST,
  GET_UNREAD_COUNT_SUCCESS,
  MARK_ALL_AS_READ_FAIL,
  MARK_ALL_AS_READ_REQUEST,
  MARK_ALL_AS_READ_SUCCESS,
  MARK_AS_READ_FAIL,
  MARK_AS_READ_REQUEST,
  MARK_AS_READ_SUCCESS,
  NEW_NOTIFICATION_RECEIVED,
} from "../constants/notificationConstants";

// Lấy tất cả thông báo
export const getNotifications =
  (page = 1) =>
  async (dispatch) => {
    try {
      dispatch({ type: GET_NOTIFICATIONS_REQUEST });

      const { data } = await axios.get(`/api/v1/notifications?page=${page}`);

      dispatch({
        type: GET_NOTIFICATIONS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: GET_NOTIFICATIONS_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

// Lấy các thông báo gần đây
export const getRecentNotifications = () => async (dispatch) => {
  try {
    dispatch({ type: GET_RECENT_NOTIFICATIONS_REQUEST });

    const { data } = await axios.get("/api/v1/notifications/recent");

    dispatch({
      type: GET_RECENT_NOTIFICATIONS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_RECENT_NOTIFICATIONS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadCount = () => async (dispatch) => {
  try {
    dispatch({ type: GET_UNREAD_COUNT_REQUEST });

    const { data } = await axios.get("/api/v1/notifications/unread/count");

    dispatch({
      type: GET_UNREAD_COUNT_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_UNREAD_COUNT_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Đánh dấu thông báo đã đọc
export const markAsRead = (id) => async (dispatch) => {
  try {
    dispatch({ type: MARK_AS_READ_REQUEST });

    const { data } = await axios.put(`/api/v1/notification/${id}/mark-read`);

    dispatch({
      type: MARK_AS_READ_SUCCESS,
      payload: { id, data },
    });
  } catch (error) {
    dispatch({
      type: MARK_AS_READ_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllAsRead = () => async (dispatch) => {
  try {
    dispatch({ type: MARK_ALL_AS_READ_REQUEST });

    const { data } = await axios.put("/api/v1/notifications/mark-all-read");

    dispatch({
      type: MARK_ALL_AS_READ_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: MARK_ALL_AS_READ_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Xóa thông báo
export const deleteNotification = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_NOTIFICATION_REQUEST });

    const { data } = await axios.delete(`/api/v1/notification/${id}`);

    dispatch({
      type: DELETE_NOTIFICATION_SUCCESS,
      payload: { id, data },
    });
  } catch (error) {
    dispatch({
      type: DELETE_NOTIFICATION_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Nhận thông báo mới từ Socket
export const newNotificationReceived = (notification) => ({
  type: NEW_NOTIFICATION_RECEIVED,
  payload: notification,
});

// Clear errors
export const clearNotificationErrors = () => ({
  type: CLEAR_NOTIFICATION_ERRORS,
});
