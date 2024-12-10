import { LOGIN, LOGOUT } from "../Action/type";

const initialState = {
  isAuthenticated: false,
  user : null
};

const user = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      console.log("로그인 상태 업데이트:", action.payload);
      return { ...state, isAuthenticated: true, user: action.payload };
    case LOGOUT:
      console.log("로그아웃 상태 업데이트");
      return { ...state, isAuthenticated: false, user: null };
    default:
      return state;
  }
};

export default user;