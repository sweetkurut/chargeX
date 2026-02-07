import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useTheme } from "@/constants/ThemeContext";
import { RootState } from "@/store";
import { setLoading } from "@/store/slices/authSlice";
import { formatKyrgyzPhone, isValidKyrgyzPhone } from "@/utils/phoneFormatter";
import { storage } from "@/utils/storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function LoginScreen() {
    const { theme } = useTheme();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");

    const dispatch = useDispatch();
    const { isLoading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // Check if user is already logged in
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const savedUser = await storage.getItem("user");
            if (savedUser) {
                router.replace("/(tabs)/map");
            }
        } catch (error) {
            console.log("Error checking auth status:", error);
        }
    };

    const handlePhoneChange = (text: string) => {
        const formatted = formatKyrgyzPhone(text);
        setPhoneNumber(formatted);
        setError("");
    };

    const handleSendCode = async () => {
        const cleanedPhone = phoneNumber.replace(/\D/g, "");

        if (!isValidKyrgyzPhone(cleanedPhone)) {
            setError("Введите корректный номер телефона Кыргызстана");
            return;
        }

        try {
            dispatch(setLoading(true));

            // Mock API call - in real app, this would send SMS
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Navigate to verification screen
            router.push({
                pathname: "/verify",
                params: { phoneNumber: cleanedPhone },
            });
        } catch (error) {
            setError("Ошибка отправки кода. Попробуйте снова.");
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoid}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.logo}>ChargeX⚡</Text>
                        <Text style={[styles.title, { color: theme.text }]}>Добро пожаловать</Text>
                        <Text style={styles.subtitle}>Введите номер телефона для входа в приложение</Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Номер телефона"
                            value={phoneNumber}
                            onChangeText={handlePhoneChange}
                            placeholder="+996 XXX XX XX XX"
                            keyboardType="phone-pad"
                            error={error}
                            maxLength={17}
                        />

                        <Button
                            title="Получить код"
                            onPress={handleSendCode}
                            loading={isLoading}
                            disabled={!isValidKyrgyzPhone(phoneNumber.replace(/\D/g, ""))}
                            style={styles.button}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Продолжая, вы соглашаетесь с{"\n"}
                            <Text style={styles.link}>Условиями использования</Text> и{" "}
                            <Text style={styles.link}>Политикой конфиденциальности</Text>
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    keyboardAvoid: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 48,
    },
    logo: {
        fontSize: 48,
        marginBottom: 10,
        textAlign: "center",
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#10B981",
    },
    title: {
        fontSize: 32,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
    },
    form: {
        marginBottom: 32,
    },
    button: {
        marginTop: 8,
    },
    footer: {
        alignItems: "center",
    },
    footerText: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
    },
    link: {
        color: "#10B981",
        fontFamily: "Inter-Medium",
        fontWeight: "500",
    },
});
