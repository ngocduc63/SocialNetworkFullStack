import {
    TASK_CREATE_REQUEST, TASK_CREATE_SUCCESS, TASK_CREATE_FAIL,
    TASK_UPDATE_REQUEST, TASK_UPDATE_SUCCESS, TASK_UPDATE_FAIL,
    TASK_DELETE_REQUEST, TASK_DELETE_SUCCESS, TASK_DELETE_FAIL,
    TASK_LIST_REQUEST, TASK_LIST_SUCCESS, TASK_LIST_FAIL,
    TASK_FILTER_REQUEST, TASK_FILTER_SUCCESS, TASK_FILTER_FAIL
} from '../constants/taskConstants';

const initialState = {
    tasks: [],
    loading: false,
    error: null,
};

const tasksReducer = (state = initialState, action) => {
    switch (action.type) {
        case TASK_LIST_REQUEST:
        case TASK_CREATE_REQUEST:
        case TASK_UPDATE_REQUEST:
        case TASK_DELETE_REQUEST:
        case TASK_FILTER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        
        case TASK_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                tasks: action.payload,
            };
        
        case TASK_CREATE_SUCCESS:
            return {
                ...state,
                loading: false,
                tasks: [...state.tasks, action.payload],
            };
        
        case TASK_UPDATE_SUCCESS:
            return {
                ...state,
                loading: false,
                tasks: state.tasks.map(task =>
                    task.id === action.payload.id ? action.payload : task
                ),
            };
        
        case TASK_DELETE_SUCCESS:
            return {
                ...state,
                loading: false,
                tasks: state.tasks.filter(task => task.id !== action.payload),
            };
        
        case TASK_FILTER_SUCCESS:
            return {
                ...state,
                loading: false,
                tasks: action.payload, // Kết quả lọc từ backend
            };
        
        case TASK_LIST_FAIL:
        case TASK_CREATE_FAIL:
        case TASK_UPDATE_FAIL:
        case TASK_DELETE_FAIL:
        case TASK_FILTER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        
        default:
            return state;
    }
};

export default tasksReducer;
