export const SET_LOGIN_OBJECT = 'SET_LOGIN_OBJECT';

export const setLoginObject = (loggedIn) => {
  return { type: SET_LOGIN_OBJECT, loggedIn };
};