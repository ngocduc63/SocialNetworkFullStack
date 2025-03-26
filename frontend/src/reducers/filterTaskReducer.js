import { SET_STATUS, SET_TYPE } from '../constants/taskConstants';

const initialState = {
	status: 'pending',
	type: 'assign',
};

const filterTaskReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_STATUS:
			return {
				...state,
				status: action.payload,
			};
		case SET_TYPE:
			return {
				...state,
				type: action.payload,
			};
		default:
			return state;
	}
};

export default filterTaskReducer;
