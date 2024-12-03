import axios from "axios";
import { LOGIN, LOGOUT } from "./type";

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


export {login, logout}