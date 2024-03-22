import React, { type FC } from 'react';
import { Text, StyleSheet } from 'react-native';

export const Hint: FC<{ text: string }> = ({ text }) => {
    return <Text style={styles.hint}>{text}</Text>;
};

const styles = StyleSheet.create({
    hint: {
        bottom: 10,
        left: 10,
        color: 'white',
        position: 'absolute',
        textShadowColor: 'black',
        textShadowRadius: 5,
    },
});
