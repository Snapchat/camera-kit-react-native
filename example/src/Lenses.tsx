import { useEffect, useState } from 'react';
import { Button } from './Button';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { useCameraKit, type Lens } from '@snap/camera-kit-react-native';
import React from 'react';

const groupId = '5685839489138688';
const launchDataLensId = 'c9fdc9c1-8b9d-4a83-9f9f-c8d77ec2d90b';

const getLaunchData = (lensId: string) =>
    launchDataLensId === lensId
        ? {
              launchParams: { text: new Date().toLocaleString() },
          }
        : undefined;

export const Lenses = () => {
    const [lenses, setLenses] = useState<Lens[]>([]);
    const { loadLensGroup, applyLens, removeLens, isSessionReady } = useCameraKit();
    useEffect(() => {
        if (isSessionReady) {
            loadLensGroup(groupId).then(setLenses).catch(console.error);
        }
    }, [loadLensGroup, isSessionReady]);

    return (
        <View style={styles.container}>
            <Button
                title="remove lens"
                onPress={() => {
                    removeLens().catch(console.error);
                }}
            />
            <FlatList
                horizontal={true}
                data={lenses}
                renderItem={({ item: lens }) => (
                    <Pressable
                        onPress={() => {
                            applyLens(lens.id, getLaunchData(lens.id)).catch(console.error);
                        }}
                    >
                        <Image source={{ uri: lens.icons[0]?.imageUrl }} style={styles.lensIcon} />
                    </Pressable>
                )}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 45,
    },
    lensIcon: {
        marginRight: 10,
        width: 75,
        height: 75,
    },
});
