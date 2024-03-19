import { useEffect, useState } from 'react';
import { Button } from './Button';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import { useCameraKit, type Lens } from '@snap/camera-kit-react-native';
import React from 'react';

const groupId = 'REPLACE-THIS-WITH-YOUR-LENSES-GROUP-ID';
const launchDataLensId = 'REPLACE-THIS-WITH-YOUR-LENSID-WITH-LAUNCH-DATA';

/**
 * A function that retrieves launch data based on a provided lens ID.
 *
 * @param {string} lensId - The ID of the lens to retrieve launch data for.
 * @return {object | undefined} Returns an object with launch parameters if the provided lens ID matches the stored data, otherwise returns undefined.
 */
const getLaunchData = (lensId: string) =>
    launchDataLensId === lensId
        ? {
              launchParams: { text: new Date().toLocaleString() },
          }
        : undefined;

/**
 * It defines a React component called Lenses that fetches a list of lenses based on a group ID, allows 
 * the user to apply or remove lenses, and displays them in a horizontal list using FlatList. It uses 
 * hooks like useState, useEffect, and custom hook useCameraKit for managing state and side effects. 
 * The applyLens and removeLens functions interact with a camera kit, and error handling 
 * is done using catch(console.error)
 * 
 * @return {JSX.Element} The JSX element representing the component.
 */
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
