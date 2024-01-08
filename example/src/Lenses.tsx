import { useEffect, useState } from 'react';
import { Button, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { useCameraKit, type Lens } from '@snap/camera-kit-react-native';
import React from 'react';

const groupId = '5685839489138688';

export const Lenses = () => {
    const [lenses, setLenses] = useState<Lens[]>([]);
    const { loadLensGroups, applyLens, removeLens } = useCameraKit();
    useEffect(() => {
        loadLensGroups([groupId]).then((data) => {
            setLenses(data);
        });
    }, [loadLensGroups]);

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
                            applyLens(lens.id);
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
