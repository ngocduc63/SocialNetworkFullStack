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

const initialState = {
  notifications: [],
  recentNotifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_NOTIFICATIONS_REQUEST:
    case GET_RECENT_NOTIFICATIONS_REQUEST:
    case GET_UNREAD_COUNT_REQUEST:
    case MARK_AS_READ_REQUEST:
    case MARK_ALL_AS_READ_REQUEST:
    case DELETE_NOTIFICATION_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case GET_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload.notifications,
        totalNotifications: action.payload.totalNotifications,
      };

    case GET_RECENT_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        recentNotifications: action.payload.notifications,
      };

    case GET_UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        loading: false,
        unreadCount: action.payload.unreadCount,
      };

    case MARK_AS_READ_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: state.notifications.map((notification) =>
          notification._id === action.payload.id
            ? { ...notification, isRead: true }
            : notification,
        ),
        recentNotifications: state.recentNotifications.map((notification) =>
          notification._id === action.payload.id
            ? { ...notification, isRead: true }
            : notification,
        ),
        unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
      };

    case MARK_ALL_AS_READ_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        recentNotifications: state.recentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };

    case DELETE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: state.notifications.filter(
          (notification) => notification._id !== action.payload.id,
        ),
        recentNotifications: state.recentNotifications.filter(
          (notification) => notification._id !== action.payload.id,
        ),
      };

    case NEW_NOTIFICATION_RECEIVED:
      // Kiểm tra xem thông báo đã tồn tại chưa
      const notificationExists = state.recentNotifications.some(
        (notification) => notification._id === action.payload._id,
      );

      if (notificationExists) {
        return state;
      }

      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        recentNotifications: [
          action.payload,
          ...state.recentNotifications.slice(0, 4),
        ],
        unreadCount: state.unreadCount + 1,
      };

    case GET_NOTIFICATIONS_FAIL:
    case GET_RECENT_NOTIFICATIONS_FAIL:
    case GET_UNREAD_COUNT_FAIL:
    case MARK_AS_READ_FAIL:
    case MARK_ALL_AS_READ_FAIL:
    case DELETE_NOTIFICATION_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_NOTIFICATION_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
