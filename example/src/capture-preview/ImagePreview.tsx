import type { FC } from 'react';
import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { globalStyles } from '../globalStyles';
import { useCameraState, useCameraStateDispatch } from '../CameraStateContext';
import { Hint } from './Hint';

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
                    style={globalStyles.fillParent}
                    source={{
                        uri: snapshotUri,
                    }}
                />
                <Hint text="touch to close" />
            </Pressable>
        </View>
    );
};
