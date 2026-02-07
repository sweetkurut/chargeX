import { useTheme } from "@/constants/ThemeContext";
import { Tabs } from "expo-router";
import { Heart, History, List, MapPin, User } from "lucide-react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
    const { theme } = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: theme.tabIconSelected,
                    tabBarInactiveTintColor: theme.tabIconDefault,
                    tabBarStyle: {
                        backgroundColor: theme.background,
                        borderTopWidth: 1,
                        borderTopColor: theme.background === "#fff" ? "#E5E7EB" : "#2C2C2C",
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
