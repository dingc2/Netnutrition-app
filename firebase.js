import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBFSBQBW5m97ZwwwKIaGIPWwd6ky38BDLA",
    authDomain: "netnutrition-75eea.firebaseapp.com",
    projectId: "netnutrition-75eea",
    storageBucket: "netnutrition-75eea.appspot.com",
    messagingSenderId: "801039545249",
    appId: "1:801039545249:web:b95de4fcd8bb166eb891e0",
    measurementId: "G-R2LM931P1Z"
  };

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
}); 