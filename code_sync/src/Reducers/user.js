import { LOGIN, LOGOUT } from "../Action/type";

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
    default:
      return state;
  }
}

export default user;