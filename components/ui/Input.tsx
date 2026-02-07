import { useTheme } from "@/constants/ThemeContext";
import React, { forwardRef } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from "react-native";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

const Input = forwardRef<TextInput, InputProps>(({ label, error, containerStyle, style, ...props }, ref) => {
    const { theme } = useTheme(); // получаем текущую тему

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
            <TextInput
                ref={ref}
                style={[
                    styles.input,
                    {
                        borderColor: error ? "#EF4444" : theme.icon + "40",
                        backgroundColor: theme.background,
                        color: theme.text,
                    },
                    style,
                ]}
                placeholderTextColor={theme.icon + "80"} // более прозрачный цвет для плейсхолдера
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
});

Input.displayName = "Input";

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontFamily: "Inter-Medium",
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: "Inter-Regular",
        minHeight: 48,
    },
    errorText: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#EF4444",
        marginTop: 4,
    },
});

export default Input;
