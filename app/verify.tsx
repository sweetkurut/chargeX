import Button from "@/components/ui/Button";
import { useTheme } from "@/constants/ThemeContext";
import { RootState } from "@/store";
import { login, setLoading } from "@/store/slices/authSlice";
import { User } from "@/types";
import { secureStorage, storage } from "@/utils/storage";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function VerifyScreen() {
    const { theme } = useTheme();
    const [code, setCode] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(60);

    const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state: RootState) => state.auth);

    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        // Start countdown timer
        const timer = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);
        setError("");

        // Auto-focus next input
        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all digits are entered
        if (newCode.every((digit) => digit !== "")) {
            handleVerify(newCode.join(""));
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (verificationCode?: string) => {
        const fullCode = verificationCode || code.join("");

        if (fullCode.length !== 4) {
            setError("Введите 4-значный код");
            return;
        }

        try {
            dispatch(setLoading(true));

            // Mock verification - in real app, this would verify with backend
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock successful verification (any 4-digit code works)
            const user: User = {
                id: "1",
                phoneNumber: phoneNumber || "",
                name: "Пользователь",
            };

            // Save user data
            await storage.setItem("user", user);
            await secureStorage.setItem("authToken", "mock-jwt-token");

            dispatch(login(user));
            router.replace("/(tabs)/map");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setError("Неверный код. Попробуйте снова.");
            setCode(["", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleResendCode = () => {
        setResendTimer(60);
        setError("");
        // Mock resend logic
        console.log("Resending code to:", phoneNumber);
    };

    const formatPhoneNumber = (phone: string) => {
        return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "+$1 $2 $3 $4 $5");
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#374151" style={[{ color: theme.icon }]} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.titleSection}>
                    <Text style={[styles.title, { color: theme.text }]}>Введите код</Text>
                    <Text style={[styles.subtitle]}>
                        Мы отправили SMS-код на ваш номер{"\n"}
                        {/* <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber || "")}</Text> */}
                    </Text>
                </View>

                <View style={styles.codeInputContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            // ref={(ref) => (inputRefs.current[index] = ref)}
                            style={[
                                styles.codeInput,
                                error && styles.codeInputError,
                                digit && styles.codeInputFilled,
                                { borderColor: theme.background, color: theme.text },
                            ]}
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text.replace(/[^0-9]/g, ""), index)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                            keyboardType="numeric"
                            maxLength={1}
                            textAlign="center"
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Button
                    title="Подтвердить"
                    onPress={() => handleVerify()}
                    loading={isLoading}
                    disabled={code.some((digit) => !digit)}
                    style={styles.verifyButton}
                />

                <View style={styles.resendSection}>
                    {resendTimer > 0 ? (
                        <Text style={styles.timerText}>Отправить код повторно через {resendTimer} сек</Text>
                    ) : (
                        <TouchableOpacity onPress={handleResendCode}>
                            <Text style={styles.resendButton}>Отправить код повторно</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    titleSection: {
        alignItems: "center",
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
    },
    phoneNumber: {
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#111827",
    },
    codeInputContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
        marginBottom: 24,
    },
    codeInput: {
        width: 56,
        height: 56,
        borderWidth: 2,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        fontSize: 24,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#111827",
        backgroundColor: "#FFFFFF",
    },
    codeInputFilled: {
        borderColor: "#10B981",
        backgroundColor: "#F0FDF4",
    },
    codeInputError: {
        borderColor: "#EF4444",
        backgroundColor: "#FEF2F2",
    },
    errorText: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#EF4444",
        textAlign: "center",
        marginBottom: 24,
    },
    verifyButton: {
        marginBottom: 32,
    },
    resendSection: {
        alignItems: "center",
    },
    timerText: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
    },
    resendButton: {
        fontSize: 16,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#10B981",
    },
});
