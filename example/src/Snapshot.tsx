import type { FC } from 'react';
import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { globalStyles } from './globalStyles';
import { useCameraState, useCameraStateDispatch } from './CameraStateContext';

export const Snapshot: FC = () => {
    const { snapshotUri } = useCameraState();
    const dispatch = useCameraStateDispatch();

    if (!snapshotUri) {
        return null;
    }

    return (
        <View style={globalStyles.imageOrVideoPreviewContainer}>
            <Pressable
                onPress={() => {
                    dispatch({ type: 'setSnapshot', snapshotUri: undefined });
                }}
            >
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={{
                        uri: snapshotUri,
                    }}
                />
            </Pressable>
        </View>
    );
};
