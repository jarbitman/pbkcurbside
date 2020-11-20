import { SET_LOGIN_OBJECT } from '../actions/actions';
import { createAction, createReducer } from '@reduxjs/toolkit';

const initialState = {
  loggedIn: { accessToken: '', profile: [] },
};

const setLoginObject = createAction(SET_LOGIN_OBJECT);

const rootReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setLoginObject, (state, action) => {
      state.loggedIn = {
        accessToken: action.loggedIn.accessToken,
        profile: action.loggedIn.profile,
      };
    });
});

export default rootReducer;
