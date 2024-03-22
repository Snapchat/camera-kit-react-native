import { type ViewProps } from 'react-native';
import { getNativeViewManager } from './verifyNativeModule';
import type { Rect } from './CameraKitContextModule';

export interface CameraOptions {
    position: 'front' | 'back';
    mirrorFramesHorizontally: boolean;
    cameraPosition: 'front' | 'back';
    safeRenderArea: Rect;
}

export type NativeCameraViewProps = ViewProps & Partial<CameraOptions>;

export const NativeView = getNativeViewManager<NativeCameraViewProps>('CameraPreview');
