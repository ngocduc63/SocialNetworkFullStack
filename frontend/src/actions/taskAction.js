import axios from "axios";
import {
  TASK_CREATE_FAIL,
  TASK_CREATE_REQUEST,
  TASK_CREATE_SUCCESS,
  TASK_DELETE_FAIL,
  TASK_DELETE_REQUEST,
  TASK_DELETE_SUCCESS,
  TASK_LIST_FAIL,
  TASK_LIST_REQUEST,
  TASK_LIST_SUCCESS,
  TASK_UPDATE_FAIL,
  TASK_UPDATE_REQUEST,
  TASK_UPDATE_SUCCESS,
} from "../constants/taskConstants";
import { toast } from "react-toastify";

export const addTask = (taskData) => async (dispatch, getState) => {
  try {
    dispatch({ type: TASK_CREATE_REQUEST });
    const config = { header: { "Content-Type": "application/json" } };
    const { data } = await axios.post(`/api/v1/createTask`, taskData, config);

    dispatch({
      type: TASK_CREATE_SUCCESS,
      payload: data.task,
    });
  } catch (error) {
    dispatch({
      type: TASK_CREATE_FAIL,
      payload: error.response?.data.message || error.message,
    });
  }
};

export const getTasks = (userId) => async (dispatch, getState) => {
  try {
    dispatch({ type: TASK_LIST_REQUEST });

    const { data } = await axios.get(`/api/v1/getUserTasks/${userId}`);

    dispatch({
      type: TASK_LIST_SUCCESS,
      payload: data.tasks,
    });
  } catch (error) {
    dispatch({
      type: TASK_LIST_FAIL,
      payload: error.response?.data.message || error.message,
    });
  }
};

export const updateTask = (updatedTaskData) => async (dispatch, getState) => {
  try {
    dispatch({ type: TASK_UPDATE_REQUEST });

    const config = { header: { "Content-Type": "application/json" } };
    const { data } = await axios.put(
      `/api/v1/updateTask`,
      updatedTaskData,
      config,
    );

    dispatch({
      type: TASK_UPDATE_SUCCESS,
      payload: data.task,
    });
  } catch (error) {
    dispatch({
      type: TASK_UPDATE_FAIL,
      payload: error.response?.data.message || error.message,
    });
  }
};

export const updateTaskStatus =
  (taskId, done) => async (dispatch, getState) => {
    try {
      dispatch({ type: TASK_UPDATE_REQUEST });
      const config = { header: { "Content-Type": "application/json" } };
      const { data } = await axios.put(
        `/api/v1/updateTaskStatus`,
        { _id: taskId, done },
        config,
      );

      dispatch({
        type: TASK_UPDATE_SUCCESS,
        payload: data.task,
      });
    } catch (error) {
      dispatch({
        type: TASK_UPDATE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

export const deleteTask = (taskId) => async (dispatch, getState) => {
  try {
    dispatch({ type: TASK_DELETE_REQUEST });

    const { data } = await axios.delete(`/api/v1/deleteTask/${taskId}`);

    dispatch({
      type: TASK_DELETE_SUCCESS,
      payload: taskId,
    });

    toast.success("Xóa công việc thành công!");
  } catch (error) {
    dispatch({
      type: TASK_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    toast.error("Xóa công việc thất bại!");
  }
};
