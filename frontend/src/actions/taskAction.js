// redux/actions/taskActions.js
import axios from 'axios';
import {
	TASK_CREATE_REQUEST,
	TASK_CREATE_SUCCESS,
	TASK_CREATE_FAIL,
	TASK_UPDATE_REQUEST,
	TASK_UPDATE_SUCCESS,
	TASK_UPDATE_FAIL,
} from '../constants/taskConstants';
import {
	TASK_LIST_REQUEST,
	TASK_LIST_SUCCESS,
	TASK_LIST_FAIL,
} from '../constants/taskConstants';
import { useSelector } from 'react-redux';

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
		dispatch({ type: TASK_UPDATE_REQUEST});

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