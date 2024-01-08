import React, { useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { CameraKitContext } from '@snap/camera-kit-react-native';
import { Preview } from './CameraPreview';
import { CameraContext } from './CameraStateContext';

const apiToken =
    'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjM4NDc0OTE0LCJzdWIiOiJiMjFjZmIyNy0wNGU5LTRiNzctYmQxYS0xNDM1NTIyZmI0NzF-U1RBR0lOR34zMzQxMmZkZC0zMDA3LTRiMTgtOGE5OC1hNjAzZTY4MzJhMmEifQ.BBVRgyVT4I_Z_qevzAqVwkWNXZGMHQ0s4tRJst9qfwE';

export default function App() {
    const [stopRendering, setStopRendering] = useState(false);

    if (stopRendering) {
        return (
            <View style={styles.container}>
                <Button title="Render context" onPress={() => setStopRendering(false)} />
            </View>
        );
    }

    return (
        <CameraContext>
            <CameraKitContext apiToken={apiToken}>
                <Preview onStopRendering={() => setStopRendering(true)} />
            </CameraKitContext>
        </CameraContext>
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
});
