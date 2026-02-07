import Card from "@/components/ui/Card";
import { useTheme } from "@/constants/ThemeContext";
import { ChargingSession } from "@/types";
import { Calendar, CreditCard, MapPin, Zap } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SessionCardProps {
    session: ChargingSession;
}

export default function SessionCard({ session }: SessionCardProps) {
    const { theme } = useTheme();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getDuration = () => {
        if (!session.endTime) return "В процессе";

        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;

        if (hours > 0) return `${hours}ч ${minutes}м`;
        return `${minutes}м`;
    };

    const getStatusColor = (status: ChargingSession["status"]) => {
        switch (status) {
            case "active":
                return "#10B981";
            case "completed":
                return "#6B7280";
            case "cancelled":
                return "#EF4444";
            default:
                return "#6B7280";
        }
    };

    const getStatusText = (status: ChargingSession["status"]) => {
        switch (status) {
            case "active":
                return "Активна";
            case "completed":
                return "Завершена";
            case "cancelled":
                return "Отменена";
            default:
                return "Неизвестно";
        }
    };

    return (
        <Card style={[styles.card, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.stationName, { color: theme.text }]}>{session.stationName}</Text>
                <View
                    style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) + "20" }]}
                >
                    <Text style={[styles.statusText, { color: getStatusColor(session.status) }]}>
                        {getStatusText(session.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.addressRow}>
                <MapPin size={16} color={theme.icon} />
                <Text style={[styles.address, { color: theme.icon }]}>{session.stationAddress}</Text>
            </View>

            <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                    <Calendar size={16} color={theme.icon} />
                    <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: theme.icon }]}>Дата и время</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {formatDate(session.startTime)} в {formatTime(session.startTime)}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoItem}>
                    <Zap size={16} color="#F59E0B" />
                    <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoLabel, { color: theme.icon }]}>Энергия</Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {session.energyConsumed.toFixed(1)} кВт⋅ч
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.footer, { borderTopColor: theme.icon + "40" }]}>
                <View style={styles.durationContainer}>
                    <Text style={[styles.duration, { color: theme.text }]}>
                        Длительность: {getDuration()}
                    </Text>
                </View>

                <View style={styles.costContainer}>
                    <CreditCard size={16} color={theme.tint} />
                    <Text style={[styles.cost]}>{session.cost.toFixed(0)} сом</Text>
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb4e",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    stationName: {
        fontSize: 18,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#111827",
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontFamily: "Inter-Medium",
        fontWeight: "600",
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    address: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        marginLeft: 4,
        flex: 1,
    },
    infoGrid: {
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    infoTextContainer: {
        marginLeft: 8,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: "Inter-Medium",
        fontWeight: "500",
        color: "#374151",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    durationContainer: {
        flex: 1,
    },
    duration: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
    },
    costContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    cost: {
        fontSize: 18,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#10B981",
        marginLeft: 4,
    },
});
