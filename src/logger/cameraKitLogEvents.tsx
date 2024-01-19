import { NativeEventEmitter, type NativeModule } from 'react-native';
import { getNativeModule } from '../verifyNativeModule';

export const cameraKitLogEvents = new NativeEventEmitter(getNativeModule<NativeModule>('CameraKitEventEmitter'));
