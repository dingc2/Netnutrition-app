// __mocks__/firebase/app.js
export const initializeApp = jest.fn(() => ({
    name: '[DEFAULT]',
    options: {},
  }));