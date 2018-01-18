import axios from 'axios';
import { Actions } from 'react-native-router-flux';
import {
  EMAIL_CHANGED,
  PASSWORD_CHANGED,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGIN_USER,
  RECOVERY_PASSWORD,
  RECOVERY_PASSWORD_FAIL,
  RECOVERY_PASSWORD_SUCCESS
} from './types';

const configpost = {
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
};

export const emailChanged = (text) => {
  return {
    type: EMAIL_CHANGED,
    payload: text
  };
};

export const passwordChanged = (text) => {
  return {
    type: PASSWORD_CHANGED,
    payload: text
  };
};

export const loginUser = ({ email, password }) => {
  return (dispatch) => {
    dispatch({ type: LOGIN_USER });

    const url = 'https://almacenear.herokuapp.com/api/auth';
    var data = JSON.stringify(
      { "user": {"email": email.toLowerCase() , "password": password }}
    );
    axios.post(url, data , configpost)
      .then( response => loginUserSuccess(dispatch, response.data.jwt))
      .catch( error => loginUser(dispatch));
  };
};
const loginUserFail = (dispatch) => {
    dispatch({ type: LOGIN_USER_FAIL });
};

const loginUserSuccess = (dispatch, user) => {
  dispatch({
    type: LOGIN_USER_SUCCESS,
    payload: user
  });
  Actions.Map();
};

export const recoveryUser = ({ email }) => {
  return (dispatch) => {
    dispatch({ type: RECOVERY_PASSWORD });
  };
};

const recoveryUserSuccess = (dispatch) => {
  dispatch({ type: RECOVERY_PASSWORD_FAIL });
};
const recoveryUserFail = (dispatch) => {
  dispatch({ type: RECOVERY_PASSWORD_SUCCESS });
};
