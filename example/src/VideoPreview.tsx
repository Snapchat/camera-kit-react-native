import React from 'react';
import { View, Pressable } from 'react-native';
import Video from 'react-native-video';
import { globalStyles } from './globalStyles';
import { useCameraState, useCameraStateDispatch } from './CameraStateContext';

export const VideoPreview = () => {
    const { videoUri } = useCameraState();
    const dispatch = useCameraStateDispatch();

    if (!videoUri) {
        return null;
    }

    return (
        <View style={globalStyles.imageOrVideoPreviewContainer}>
            <Pressable
                onPress={() => {
                    dispatch({ type: 'setVideo', videoUri: undefined });
                }}
            >
                <Video style={{ width: '100%', height: '100%' }} source={{ uri: videoUri }} />
            </Pressable>
        </View>
    );
};
