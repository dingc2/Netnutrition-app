import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { F_API, F_AUTH, F_PROJECTID, F_STORAGEBUCKET, F_MESSAGINGID, F_APPID, F_MEASUREMENTID } from '@env';

const firebaseConfig = {
  apiKey: `${F_API}`,
  authDomain: `${F_AUTH}`,
  projectId: `${F_PROJECTID}`,
  storageBucket: `${F_STORAGEBUCKET}`,
  messagingSenderId: `${F_MESSAGINGID}`,
  appId: `${F_APPID}`,
  measurementId: `${F_MEASUREMENTID}`
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
}); 