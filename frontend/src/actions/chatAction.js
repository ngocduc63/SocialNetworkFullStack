import axios from "axios";
import {
  ALL_CHATS_FAIL,
  ALL_CHATS_REQUEST,
  ALL_CHATS_SUCCESS,
  CLEAR_ERRORS,
  NEW_CHAT_FAIL,
  NEW_CHAT_REQUEST,
  NEW_CHAT_SUCCESS,
} from "../constants/chatConstants";
import {
  addUsersToChat,
  deleteUsersFromChat,
  updateAvatarChat,
  updateChatName,
} from "../reducers/chatsReducer";
import { toast } from "react-toastify";

// Get All Chats
export const getAllChats = () => async (dispatch) => {
  try {
    dispatch({ type: ALL_CHATS_REQUEST });

    const { data } = await axios.get("/api/v1/chats");

    dispatch({
      type: ALL_CHATS_SUCCESS,
      payload: data.chats,
    });
  } catch (error) {
    dispatch({
      type: ALL_CHATS_FAIL,
      payload: error.response.data.message,
    });
  }
};

// New Chat
export const addNewChat = (users) => async (dispatch) => {
  try {
    dispatch({ type: NEW_CHAT_REQUEST });
    const config = { header: { "Content-Type": "application/json" } };
    const { data } = await axios.post(
      "/api/v1/newChat",
      { users: users },
      config,
    );

    dispatch({
      type: NEW_CHAT_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: NEW_CHAT_FAIL,
      payload: error.response.data.message,
    });
  }
};

export const renameGroup = (chatId, newName) => async (dispatch) => {
  try {
    const config = { header: { "Content-Type": "application/json" } };
    const { data } = await axios.put(
      "/api/v1/renameGroup",
      { chatId, newName },
      config,
    );

    dispatch(updateChatName(chatId, newName));
    toast.success("Đổi tên nhóm thành công");
  } catch (error) {
    // dispatch({
    //   type: NEW_CHAT_FAIL,
    //   payload: error.response.data.message,
    // });
  }
};

export const updateAvatarGroup = (formData) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const { data } = await axios.put(
      "/api/v1/updateAvatarGroup",
      formData,
      config,
    );

    dispatch(updateAvatarChat(data.chat._id, data.chat.avatar));
    toast.success("Đổi ảnh nhóm thành công");
  } catch (error) {
    console.log(error);
    // dispatch({
    //   type: NEW_CHAT_FAIL,
    //   payload: error.response.data.message,
    // });
  }
};

export const removeMembers = (chatId, userIds) => async (dispatch) => {
  try {
    const config = { header: { "Content-Type": "application/json" } };
    const { data } = await axios.put(
      "/api/v1/removeMembers",
      { chatId, userIds },
      config,
    );

    dispatch(deleteUsersFromChat(chatId, userIds));
    toast.success(`Đã xóa ${userIds.length} thành viên thành công`);
  } catch (error) {
    // dispatch({
    //   type: NEW_CHAT_FAIL,
    //   payload: error.response.data.message,
    // });
  }
};

export const addMembers = (chatId, userIds) => async (dispatch) => {
  try {
    const config = { header: { "Content-Type": "application/json" } };
    const { data } = await axios.put(
      "/api/v1/addMembers",
      { chatId, userIds },
      config,
    );

    dispatch(addUsersToChat(chatId, data.chat.users));
    toast.success(`Thêm ${userIds.length} thành viên thành công`);
  } catch (error) {
    // dispatch({
    //   type: NEW_CHAT_FAIL,
    //   payload: error.response.data.message,
    // });
  }
};

// Clear All Errors
export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};
