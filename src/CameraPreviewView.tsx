import { useCameraKit } from './CameraKitContext';
import { type FC } from 'react';
import { NativeView, type NativeCameraViewProps } from './NativeView';
import { Text } from 'react-native';

/**
 * Renders the CameraPreviewView component based on the session readiness.
 *
 * @param {NativeCameraViewProps} props - the properties passed to the component
 * @return {ReactElement} the rendered component based on session readiness
 */
export const CameraPreviewView: FC<NativeCameraViewProps> = (props) => {
    const { isSessionReady } = useCameraKit();

    if (!isSessionReady) {
        //@ts-expect-error
        return <Text>Session is not ready...</Text>;
    }

    //@ts-expect-error
    return <NativeView {...props} />;
};
