import React, { useEffect, useState, type FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraPreviewView } from '../../src/CameraPreviewView';
import { Lenses } from './Lenses';
import { useCameraPermissions } from '../../src/useCameraPermissions';
import { useCameraKit } from '../../src/CameraKitContext';
import { Snapshot } from './capture-preview/ImagePreview';
import { VideoPreview } from './capture-preview/VideoPreview';
import { useCameraState, useCameraStateDispatch } from './CameraStateContext';
import { Button } from './Button';

interface PreviewProps {
    onStopRendering: () => void;
}

export const Preview: FC<PreviewProps> = ({ onStopRendering }) => {
    const { position, aspectRatio, mirrorHorizontally, mirrorVertically, crop, videoRecording } = useCameraState();
    const dispatch = useCameraStateDispatch();
    const { takeSnapshot, takeVideo } = useCameraKit();
    const [showCamera, setShowCamera] = useState(true);
    const { permissionStatus, request } = useCameraPermissions();

    useEffect(() => {
        request(['android.permission.CAMERA']);
    }, [request]);

    const onVideoRecording = () => {
        if (videoRecording) {
            videoRecording.stop().then(({ uri }) => {
                dispatch({ type: 'setVideo', videoUri: uri });
                dispatch({ type: 'setVideoRecording', videoRecording: undefined });
            });
        } else {
            dispatch({ type: 'setVideoRecording', videoRecording: takeVideo() });
        }
    };

    return (
        <View style={styles.box}>
            {showCamera ? (
                <CameraPreviewView
                    style={styles.box}
                    cameraPosition={position}
                    ratio={aspectRatio}
                    mirrorFramesVertically={mirrorVertically}
                    mirrorFramesHorizontally={mirrorHorizontally}
                    crop={crop}
                />
            ) : (
                <View style={styles.box}></View>
            )}
            <View style={styles.container}>
                <Text style={{ backgroundColor: 'gray' }}>
                    Camera permissions: {permissionStatus['android.permission.CAMERA']}
                </Text>
                <Button title="Stop render context" onPress={onStopRendering} />
                <Button title={`camera enabled ${showCamera}`} onPress={() => setShowCamera((val) => !val)} />
                <Button title={position} onPress={() => dispatch({ type: 'toggleCameraPosition' })} />
                <Button title={aspectRatio} onPress={() => dispatch({ type: 'toggleAspectRatio' })} />
                <Button
                    title={`mirror vert: ${mirrorVertically}`}
                    onPress={() => dispatch({ type: 'toggleMirrorVertically' })}
                />
                <Button
                    title={`mirror horiz: ${mirrorHorizontally}`}
                    onPress={() => dispatch({ type: 'toggleMirrorHorizontally' })}
                />
                <Button
                    title={`crop: ${!!crop}`}
                    onPress={() => {
                        dispatch({ type: 'toggleCrop' });
                    }}
                />
                <Button
                    title="capture image"
                    onPress={async () => {
                        const { uri } = await takeSnapshot('JPEG', 90);
                        dispatch({ type: 'setSnapshot', snapshotUri: uri });
                    }}
                />
                <Button title={videoRecording ? 'stop taking video' : 'take video'} onPress={onVideoRecording} />
            </View>
            <Lenses />
            <Snapshot />
            <VideoPreview />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        height: '45%',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    box: {
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
    },
});
