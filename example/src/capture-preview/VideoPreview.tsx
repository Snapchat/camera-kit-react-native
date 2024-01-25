import React from 'react';
import { View, Pressable } from 'react-native';
import Video from 'react-native-video';
import { globalStyles } from '../globalStyles';
import { useCameraState, useCameraStateDispatch } from '../CameraStateContext';
import { Hint } from './Hint';

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
                <Video style={globalStyles.fillParent} source={{ uri: videoUri }} resizeMode="cover" />
            </Pressable>
            <Hint text="touch to close" />
        </View>
    );
};
