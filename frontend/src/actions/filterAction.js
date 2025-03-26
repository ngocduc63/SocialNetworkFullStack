import { SET_STATUS, SET_TYPE } from "../constants/taskConstants";

export const setStatus = (status) => ({
	type: SET_STATUS,
	payload: status,
});
export const setType = (type)=>({
	type: SET_TYPE,
	payload: type
})