import { useCameraKit } from './CameraKitContext';
import React, { type FC } from 'react';
import { NativeView, type CameraPreviewViewProps } from './NativeView';

export const CameraPreviewView: FC<CameraPreviewViewProps> = (props) => {
    const { isSessionReady } = useCameraKit();

    if (!isSessionReady) {
        return null;
    }

    return <NativeView {...props} />;
};
