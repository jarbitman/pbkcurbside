import React from 'react';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const pbkStyle = {
  blue: '#0E2244',
  orange: '#F36C21',
  green: '#B2D235',
  teal: '#00BDD0',
};


export const displayDate = (d) => {
  if (d.toLowerCase() === 'present') {
    return d;
  }

  const [m, y] = d.split('/');

  return months[parseInt(m, 10) - 1] + ', ' + y;
};

export const ApiRequest = (API_ENDPOINT) => {
  return fetch(API_ENDPOINT).then((response) => {
    if (response.ok) {
      return response.json();
    }

    throw new Error('Something went wrong ...');
  });
};

export const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
};

export const decodeFormData = (data) => {
  if (!data) {
    return {};
  }

  return JSON.parse(
    '{"' + data.replace(/&/g, '","').replace(/[=]/g, '":"') + '"}',
    (key, value) => {
      return key === '' ? value : decodeURIComponent(value);
    }
  );
};

export const sortByPropertyCaseInsensitive = (a, b, prop) => {
  if (('' + a[prop]).toLowerCase() === ('' + b[prop]).toLowerCase()) {
    return 0;
  }

  return (('' + a[prop]).toLowerCase() > ('' + b[prop]).toLowerCase()) ? 1 : -1;
};

export const sortByProperty = (a, b, prop) => {
  if (a[prop] === b[prop]) {
    return 0;
  }

  return (a[prop] > b[prop]) ? 1 : -1;
};

export const ApiPostRequest = async(API_ENDPOINT, data = {}) => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return response.json();
  }

  // eslint-disable-next-line no-console
  console.log('AJAX Response: ');
  console.log(response);
  throw new Error('Something went wrong ...');
};