import { useCameraKit } from './CameraKitContext';
import React, { type FC } from 'react';
import { NativeView, type NativeCameraViewProps } from './NativeView';
import { Text } from 'react-native';

export const CameraPreviewView: FC<NativeCameraViewProps> = (props) => {
    const { isSessionReady } = useCameraKit();

    if (!isSessionReady) {
        return <Text>Session is not ready...</Text>;
    }

    return <NativeView {...props} />;
};
