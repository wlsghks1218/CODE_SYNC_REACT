import { LOGIN, LOGOUT, UPDATE_USER } from "./type";

function login(user){
  return {
    type : LOGIN,
    payload : user
  }
}

function logout() {
  return {
    type: LOGOUT,
  };
}

function updateUser(updatedUser) {
  return{
    type: UPDATE_USER,
    payload : updatedUser
  };
}


export {login, logout, updateUser}