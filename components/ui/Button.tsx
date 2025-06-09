import React from "react";
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "outline" | "danger";
    size?: "small" | "medium" | "large";
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    title,
    onPress,
    variant = "primary",
    size = "medium",
    disabled = false,
    loading = false,
    style,
    textStyle,
}: ButtonProps) {
    const buttonStyle = [styles.base, styles[variant], styles[`${size}Size`], disabled && styles.disabled, style];

    const textStyles = [styles.text, styles[`${variant}Text`], styles[`${size}Text`], disabled && styles.disabledText, textStyle];

    return (
        <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
            {loading ? (
                <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#10B981"} size="small" />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    primary: {
        backgroundColor: "#10B981",
    },
    secondary: {
        backgroundColor: "#F3F4F6",
    },
    outline: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "#10B981",
    },
    danger: {
        backgroundColor: "#EF4444",
    },
    disabled: {
        backgroundColor: "#D1D5DB",
        shadowOpacity: 0,
        elevation: 0,
    },
    smallSize: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 36,
    },
    mediumSize: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        minHeight: 48,
    },
    largeSize: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        minHeight: 56,
    },
    text: {
        fontFamily: "Inter-Medium",
        fontWeight: "600",
    },
    primaryText: {
        color: "#FFFFFF",
    },
    secondaryText: {
        color: "#374151",
    },
    outlineText: {
        color: "#10B981",
    },
    dangerText: {
        color: "#FFFFFF",
    },
    disabledText: {
        color: "#9CA3AF",
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },
});
