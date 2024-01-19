import React, { useRef, type FC } from 'react';
import { Text, StyleSheet, Pressable, Animated } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
}

export const Button: FC<ButtonProps> = ({ title, onPress }) => {
    const animatedButtonScaleRef = useRef<Animated.Value>();

    if (animatedButtonScaleRef.current == undefined) {
        animatedButtonScaleRef.current = new Animated.Value(1);
    }

    const onPressIn = () => {
        Animated.spring(animatedButtonScaleRef.current!, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(animatedButtonScaleRef.current!, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const animatedScaleStyle = {
        transform: [{ scale: animatedButtonScaleRef.current }],
    };

    return (
        <Animated.View style={animatedScaleStyle}>
            <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={styles.button} onPress={onPress}>
                <Text style={styles.text}>{title}</Text>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 6,
        backgroundColor: '#FFFF00',
    },
    text: {
        fontSize: 15,
        lineHeight: 21,
        color: '#660099',
        textTransform: 'uppercase',
    },
});
