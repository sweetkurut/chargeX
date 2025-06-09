import { RootState } from "@/store";
import { storage } from "@/utils/storage";
import { Tabs, router } from "expo-router";
import { Heart, History, List, MapPin, User } from "lucide-react-native";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

export default function TabLayout() {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await storage.getItem("user");
            if (!user) {
                router.replace("/login");
            }
        } catch (error) {
            router.replace("/login");
        }
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
            }}
        >
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: "#10B981",
                    tabBarInactiveTintColor: "#6B7280",
                    tabBarStyle: {
                        backgroundColor: "#FFFFFF",
                        borderTopWidth: 1,
                        borderTopColor: "#E5E7EB",
                        paddingTop: 8,
                        paddingBottom: 8,
                        height: 60,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontFamily: "Inter-Medium",
                        fontWeight: "500",
                    },
                }}
            >
                <Tabs.Screen
                    name="map"
                    options={{
                        title: "Карта",
                        tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="stations"
                    options={{
                        title: "Станции",
                        tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="favorites"
                    options={{
                        title: "Избранное",
                        tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="history"
                    options={{
                        title: "История",
                        tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Профиль",
                        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
