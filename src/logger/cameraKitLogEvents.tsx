import { NativeEventEmitter, NativeModules } from 'react-native';

export const cameraKitLogEvents = new NativeEventEmitter(NativeModules.CameraKitEventEmitter);
