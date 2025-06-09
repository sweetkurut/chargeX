import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { RootState } from "@/store";
import { logout, updateUser } from "@/store/slices/authSlice";
import { secureStorage, storage } from "@/utils/storage";
import { router } from "expo-router";
import { Bell, Car, ChevronRight, CreditCard, History, LogOut, Phone, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function ProfileScreen() {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [carNumber, setCarNumber] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { unreadCount } = useSelector((state: RootState) => state.notifications);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setCarNumber(user.carNumber || "");
        }
    }, [user]);

    const handleSaveProfile = async () => {
        try {
            const updatedUser = {
                ...user,
                name: name.trim(),
                carNumber: carNumber.trim(),
            };

            await storage.setItem("user", updatedUser);
            dispatch(updateUser({ name: name.trim(), carNumber: carNumber.trim() }));
            setIsEditing(false);
        } catch (error) {
            Alert.alert("Ошибка", "Не удалось сохранить профиль");
        }
    };

    const handleLogout = () => {
        Alert.alert("Выход", "Вы уверены, что хотите выйти из аккаунта?", [
            { text: "Отмена", style: "cancel" },
            {
                text: "Выйти",
                style: "destructive",
                onPress: async () => {
                    try {
                        await storage.removeItem("user");
                        await secureStorage.removeItem("authToken");
                        dispatch(logout());
                        router.replace("/login");
                    } catch (error) {
                        console.log("Logout error:", error);
                    }
                },
            },
        ]);
    };

    const formatPhoneNumber = (phone: string) => {
        return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "+$1 $2 $3 $4 $5");
    };

    const menuItems = [
        {
            icon: Bell,
            title: "Уведомления",
            badge: unreadCount > 0 ? unreadCount : undefined,
            onPress: () => router.push("/notidications"),
        },
        {
            icon: CreditCard,
            title: "Способы оплаты",
            onPress: () => {
                Alert.alert("В разработке", "Эта функция будет доступна в следующих версиях");
            },
        },
        {
            icon: History,
            title: "История",
            onPress: () => router.push("/(tabs)/history"),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Профиль</Text>
                </View>

                <Card style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <User size={32} color="#FFFFFF" />
                        </View>
                    </View>

                    {isEditing ? (
                        <View style={styles.editForm}>
                            <Input label="Имя" value={name} onChangeText={setName} placeholder="Введите ваше имя" />

                            <Input
                                label="Номер автомобиля"
                                value={carNumber}
                                onChangeText={setCarNumber}
                                placeholder="01KG123ABC"
                                autoCapitalize="characters"
                            />
                            <Input
                                label="Номер телефона"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="+996552220790"
                                // autoCapitalize=''
                            />

                            <View style={styles.editButtons}>
                                <Button
                                    title="Отмена"
                                    variant="secondary"
                                    onPress={() => {
                                        setIsEditing(false);
                                        setName(user?.name || "");
                                        setCarNumber(user?.carNumber || "");
                                    }}
                                    style={styles.cancelButton}
                                />

                                <Button title="Сохранить" onPress={handleSaveProfile} style={styles.saveButton} />
                            </View>
                        </View>
                    ) : (
                        <View style={styles.profileInfo}>
                            {/* <Text style={styles.userName}>{name || "Не указано"}</Text> */}
                            <Text style={styles.userName}>Айбек Уланов</Text>

                            <View style={styles.infoRow}>
                                <Phone size={16} color="#6B7280" />
                                {/* <Text style={styles.infoText}>{formatPhoneNumber(user?.phoneNumber || "")}</Text> */}
                                <Text style={styles.infoText}>+996 552 220 790</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Car size={16} color="#6B7280" />
                                {/* <Text style={styles.infoText}>{carNumber || "Не указан"}</Text> */}
                                <Text style={styles.infoText}>08KG463BIR</Text>
                            </View>

                            <Button title="Редактировать" onPress={() => setIsEditing(true)} style={styles.editButton} />
                            {/* <TouchableOpacity>
                <Text>Редактировать</Text>
              </TouchableOpacity> */}
                        </View>
                    )}
                </Card>

                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                            <View style={styles.menuItemLeft}>
                                <item.icon size={20} color="#374151" />
                                <Text style={styles.menuItemText}>{item.title}</Text>
                            </View>

                            <View style={styles.menuItemRight}>
                                {item.badge && (
                                    <View style={styles.menuBadge}>
                                        <Text style={styles.menuBadgeText}>{item.badge > 9 ? "9+" : item.badge}</Text>
                                    </View>
                                )}
                                <ChevronRight size={16} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Выйти из аккаунта</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#111827",
    },
    profileCard: {
        alignItems: "center",
        padding: 24,
        marginBottom: 24,
    },
    avatarContainer: {
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
    },
    profileInfo: {
        alignItems: "center",
        width: "100%",
    },
    userName: {
        fontSize: 24,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#111827",
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        width: "100%",
        justifyContent: "center",
    },
    infoText: {
        fontSize: 16,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        marginLeft: 8,
    },
    editButton: {
        marginTop: 16,
        alignSelf: "stretch",
    },
    editForm: {
        width: "100%",
    },
    editButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
    menuSection: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 24,
        overflow: "hidden",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: "Inter-Medium",
        fontWeight: "500",
        color: "#374151",
        marginLeft: 12,
    },
    menuItemRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuBadge: {
        backgroundColor: "#EF4444",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    menuBadgeText: {
        fontSize: 12,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#FFFFFF",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: "#FEE2E2",
    },
    logoutText: {
        fontSize: 16,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#EF4444",
        marginLeft: 8,
    },
});
