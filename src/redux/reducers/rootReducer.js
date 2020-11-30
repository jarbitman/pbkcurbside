import { SET_LOGIN_OBJECT,SET_RESTAURANT_OBJECT } from '../actions/actions';
import { createAction, createReducer } from '@reduxjs/toolkit';

const initialState = {
  loggedIn: { id_token: '', profile: [], restaurants: [] },
  restaurant: {name: '', id: ''}
};

const setLoginObject = createAction(SET_LOGIN_OBJECT);
const setRestaurantObject = createAction(SET_RESTAURANT_OBJECT);

const rootReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setLoginObject, (state, action) => {
      state.loggedIn = {
        id_token: action.loggedIn.id_token,
        profile: action.loggedIn.profile,
        restaurants: action.loggedIn.restaurants,
      };
    })
    .addCase(setRestaurantObject, (state, action) => {
        state.restaurant = {
          name: action.restaurant.name,
          id: action.restaurant.id,
        };
    });
});

export default rootReducer;
