import { SET_LOGIN_OBJECT } from '../actions/actions';
import { createAction, createReducer } from '@reduxjs/toolkit';

const initialState = {
  loggedIn: { id_token: '', profile: [], restaurants: [] },
};

const setLoginObject = createAction(SET_LOGIN_OBJECT);

const rootReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setLoginObject, (state, action) => {
      state.loggedIn = {
        id_token: action.loggedIn.id_token,
        profile: action.loggedIn.profile,
        restaurants: action.loggedIn.restaurants,
      };
    });
});

export default rootReducer;
