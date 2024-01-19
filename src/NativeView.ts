import { type ViewProps } from 'react-native';
import { getNativeViewManager } from './verifyNativeModule';

export interface CropConfig {
    aspectRatioNumerator: number;
    aspectRatioDenominator: number;
}

export interface CameraOptions {
    position: 'front' | 'back';
    ratio: 'RATIO_16_9' | 'RATIO_4_3';
    mirrorFramesHorizontally: boolean;
    mirrorFramesVertically: boolean;
    crop: CropConfig;
    cameraPosition: 'front' | 'back';
}

export type NativeCameraViewProps = ViewProps & Partial<CameraOptions>;

export const NativeView = getNativeViewManager<NativeCameraViewProps>('CameraPreview');
