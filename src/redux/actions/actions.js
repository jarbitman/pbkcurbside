export const SET_LOGIN_OBJECT = 'SET_LOGIN_OBJECT';
export const SET_RESTAURANT_OBJECT = 'SET_RESTAURANT_OBJECT';

export const setLoginObject = (loggedIn) => {
  return { type: SET_LOGIN_OBJECT, loggedIn };
};

export const setRestaurantObject = (restaurant) => {
  return { type: SET_RESTAURANT_OBJECT, restaurant };
};