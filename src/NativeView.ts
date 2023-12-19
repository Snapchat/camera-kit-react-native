import { requireNativeComponent, type ViewProps } from 'react-native';

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
}

export type CameraPreviewViewProps = ViewProps & Partial<CameraOptions>;

export const NativeView = requireNativeComponent<CameraPreviewViewProps>('CameraPreviewManager');
