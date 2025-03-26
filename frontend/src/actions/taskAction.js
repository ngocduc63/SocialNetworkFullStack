// redux/actions/taskActions.js
import axios from 'axios';
import {
	TASK_CREATE_REQUEST,
	TASK_CREATE_SUCCESS,
	TASK_CREATE_FAIL,
	TASK_UPDATE_REQUEST,
	TASK_UPDATE_SUCCESS,
	TASK_UPDATE_FAIL,
	TASK_DELETE_REQUEST,
	TASK_DELETE_SUCCESS,
	TASK_DELETE_FAIL,
} from '../constants/taskConstants';
import {
	TASK_LIST_REQUEST,
	TASK_LIST_SUCCESS,
	TASK_LIST_FAIL,
} from '../constants/taskConstants';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export const addTask = (taskData) => async (dispatch, getState) => {
	try {
		dispatch({ type: TASK_CREATE_REQUEST });

		dispatch({
			type: TASK_CREATE_SUCCESS,
			payload: taskData,
		});
	} catch (error) {
		dispatch({
			type: TASK_CREATE_FAIL,
			payload: error.response?.data.message || error.message,
		});
	}
};

export const getTasks = () => async (dispatch, getState) => {
	try {
		dispatch({ type: TASK_LIST_REQUEST });

		// const { data } = await axios.get('/api/tasks');
		const { data } = useSelector((state) => state.tasks);

		dispatch({
			type: TASK_LIST_SUCCESS,
			// payload: data.tasks,
			payload: data,
		});
	} catch (error) {
		dispatch({
			type: TASK_LIST_FAIL,
			payload: error.response?.data.message || error.message,
		});
	}
};

export const updateTask = (taskId, updatedTaskData) => async (dispatch, getState) => {
	try {
		dispatch({ type: TASK_UPDATE_REQUEST });

		// const { data } = await axios.put(`/api/tasks/${taskId}`, updatedTaskData);

		const updatedTask = { id: taskId, ...updatedTaskData };

		dispatch({
			type: TASK_UPDATE_SUCCESS,
			payload: updatedTask,
		});
	} catch (error) {
		dispatch({
			type: TASK_UPDATE_FAIL,
			payload: error.response?.data.message || error.message,
		});
	}
};

export const updateTaskStatus = (taskId, done) => async (dispatch, getState) => {
	try {
		dispatch({ type: TASK_UPDATE_REQUEST });
		const { tasks } = getState().tasks; 
		const updatedTask = tasks.find(task => task.id === taskId);
		// const { data } = await axios.put(`/api/tasks/${taskId}`, { done });

		// Cập nhật Redux store
		dispatch({
			type: TASK_UPDATE_SUCCESS,
			payload: { ...updatedTask, done }, 
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
