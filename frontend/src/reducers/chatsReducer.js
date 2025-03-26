import {
  ADD_USER_CHAT,
  ALL_CHATS_FAIL,
  ALL_CHATS_REQUEST,
  ALL_CHATS_SUCCESS,
  CLEAR_ERRORS,
  DELETE_USER_CHAT,
  NEW_CHAT_FAIL,
  NEW_CHAT_REQUEST,
  NEW_CHAT_RESET,
  NEW_CHAT_SUCCESS,
  UPDATE_NAME_CHAT,
} from "../constants/chatConstants";

export const allChatsReducer = (state = { chats: [] }, { type, payload }) => {
  switch (type) {
    case ALL_CHATS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case ALL_CHATS_SUCCESS:
      return {
        loading: false,
        chats: payload,
      };
    case ALL_CHATS_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };
    case UPDATE_NAME_CHAT:
      return {
        ...state,
        loading: false,
        chats: state.chats.map((chat) =>
          chat._id === payload.chatId
            ? { ...chat, name: payload.newName }
            : chat,
        ),
      };
    case DELETE_USER_CHAT:
      return {
        ...state,
        loading: false,
        chats: state.chats.map((chat) => {
          if (chat._id === payload.chatId) {
            return {
              ...chat,
              users: chat.users.filter(
                (user) => !payload.userIds.includes(user._id),
              ),
            };
          }
          return chat;
        }),
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const newChatReducer = (state = {}, { type, payload }) => {
  switch (type) {
    case NEW_CHAT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case NEW_CHAT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: payload.success,
        chat: payload.newChat,
      };
    case NEW_CHAT_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };
    case NEW_CHAT_RESET:
      return {
        ...state,
        success: false,
      };
    case UPDATE_NAME_CHAT:
      return {
        ...state,
        loading: false,
        chat:
          state.chat?._id === payload.chatId
            ? { ...state.chat, name: payload.newName }
            : state.chat,
      };
    case DELETE_USER_CHAT:
      return {
        ...state,
        loading: false,
        chat:
          state.chat?._id === payload.chatId
            ? {
                ...state.chat,
                users: state.chat.users.filter(
                  (user) => !payload.userIds.includes(user._id),
                ),
              }
            : state.chat,
      };
    case ADD_USER_CHAT:
      return {
        ...state,
        loading: false,
        chat:
          state.chat?._id === payload.chatId
            ? {
                ...state.chat,
                users: [...state.chat.users, ...payload.userIds],
              }
            : state.chat,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const updateChatName = (chatId, newName) => ({
  type: UPDATE_NAME_CHAT,
  payload: { chatId, newName },
});

export const deleteUsersFromChat = (chatId, userIds) => ({
  type: DELETE_USER_CHAT,
  payload: { chatId, userIds },
});

export const addUsersToChat = (chatId, userIds) => ({
  type: ADD_USER_CHAT,
  payload: { chatId, userIds },
});
