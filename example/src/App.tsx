import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import { CameraKitContext, CameraPreviewView, type CameraOptions, useCameraPermissions } from 'camera-kit-react-native';
import { Lenses } from './Lenses';
import type { CropConfig } from '../../src/NativeView';

const apiToken =
    'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjM4NDc0OTE0LCJzdWIiOiJiMjFjZmIyNy0wNGU5LTRiNzctYmQxYS0xNDM1NTIyZmI0NzF-U1RBR0lOR34zMzQxMmZkZC0zMDA3LTRiMTgtOGE5OC1hNjAzZTY4MzJhMmEifQ.BBVRgyVT4I_Z_qevzAqVwkWNXZGMHQ0s4tRJst9qfwE';
const cropConfig: CropConfig = { aspectRatioDenominator: 2, aspectRatioNumerator: 2 };

export default function App() {
    const [showCamera, setShowCamera] = useState(true);
    const [position, setPosition] = useState<CameraOptions['position']>('front');
    const [aspectRatio, setAspectRatio] = useState<CameraOptions['ratio']>('RATIO_16_9');
    const [stopRendering, setStopRendering] = useState(false);
    const { permissionStatus, request } = useCameraPermissions();
    const [mirrorVertically, setMirrorVertically] = useState(false);
    const [mirrorHorizontally, setMirrorHorizontally] = useState(false);
    const [crop, setCrop] = useState<CropConfig | undefined>(undefined);

    useEffect(() => {
        request(['android.permission.CAMERA']);
    }, [request]);

    if (stopRendering) {
        return (
            <View style={styles.container}>
                <Button title="Render context" onPress={() => setStopRendering(false)} />
            </View>
        );
    }

    return (
        <CameraKitContext apiToken={apiToken}>
            {showCamera && (
                <CameraPreviewView
                    style={styles.box}
                    position={position}
                    ratio={aspectRatio}
                    mirrorFramesVertically={mirrorVertically}
                    mirrorFramesHorizontally={mirrorHorizontally}
                    crop={crop}
                />
            )}
            <View style={styles.container}>
                <Text>Camera permissions: {permissionStatus['android.permission.CAMERA']}</Text>
                <Button title="Stop render context" onPress={() => setStopRendering(true)} />
                <Button title={`camera enabled ${showCamera}`} onPress={() => setShowCamera((val) => !val)} />
                <Button title={position} onPress={() => setPosition((val) => (val === 'front' ? 'back' : 'front'))} />
                <Button
                    title={aspectRatio}
                    onPress={() => setAspectRatio((val) => (val === 'RATIO_16_9' ? 'RATIO_4_3' : 'RATIO_16_9'))}
                />
                <Button title={`mirror vert: ${mirrorVertically}`} onPress={() => setMirrorVertically((val) => !val)} />
                <Button
                    title={`mirror horiz: ${mirrorHorizontally}`}
                    onPress={() => setMirrorHorizontally((val) => !val)}
                />
                <Button
                    title={`crop: ${!!crop}`}
                    onPress={() => {
                        setCrop((val) => (!val ? cropConfig : undefined));
                    }}
                ></Button>
            </View>
            <Lenses />
        </CameraKitContext>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        height: '30%',
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    box: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
});
