import { LOGIN, LOGOUT, UPDATE_USER } from "../Action/type";

const initialState = {
  isAuthenticated: false,
  user : null
};

const user = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return { ...state, isAuthenticated: true, user: action.payload };
    case LOGOUT:
      return { ...state, isAuthenticated: false, user: null };
    case UPDATE_USER:
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export default user;