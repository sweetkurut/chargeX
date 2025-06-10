import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { RootState } from "@/store";
import { startCharging, stopCharging } from "@/store/slices/chargingSlice";
import { addNotification } from "@/store/slices/notificationsSlice";
import { toggleFavorite, updateStationStatus } from "@/store/slices/stationSlice";
// import { toggleFavorite, updateStationStatus } from "@/store/slices/stationsSlice";
import { ChargingSession, Notification } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Clock, Heart, MapPin, Phone, Plus, Wallet, X, Zap } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function StationDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [selectedConnector, setSelectedConnector] = useState<number>(1);
    const [selectedAmount, setSelectedAmount] = useState<number>(0);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [balance, setBalance] = useState<number>(10000);

    const dispatch = useDispatch();
    const { stations } = useSelector((state: RootState) => state.stations);
    const { currentSession } = useSelector((state: RootState) => state.charging);

    const station = stations.find((s) => s.id === id);
    const isCurrentlyCharging = currentSession?.stationId === id;

    const presetAmounts = [1, 5, 10, 20, 50];

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isCurrentlyCharging && currentSession) {
            interval = setInterval(() => {
                const start = new Date(currentSession.startTime);
                const now = new Date();
                const diffMs = now.getTime() - start.getTime();
                setElapsedTime(Math.floor(diffMs / 1000));
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isCurrentlyCharging, currentSession]);

    if (!station) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Станция не найдена</Text>
            </SafeAreaView>
        );
    }

    const connectors = [
        { id: 1, type: "CCS2", status: "available" },
        { id: 2, type: "GBT", status: "occupied", occupancy: 84 },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "#10B981";
            case "occupied":
                return "#F59E0B";
            default:
                return "#6B7280";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "available":
                return "Свободен";
            case "occupied":
                return "Занят";
            default:
                return "Недоступен";
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const calculateCost = (amount: number) => {
        return amount * station.pricePerKwh;
    };

    const getCurrentAmount = () => {
        return selectedAmount || parseFloat(customAmount) || 0;
    };

    const handleAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount("");
    };

    const handleCustomAmountChange = (text: string) => {
        setCustomAmount(text);
        setSelectedAmount(0);
    };

    const clearCustomAmount = () => {
        setCustomAmount("");
        setSelectedAmount(0);
    };

    const handleTopUpBalance = () => {
        Alert.alert("Пополнить баланс", "Выберите способ пополнения баланса", [
            { text: "Отмена", style: "cancel" },
            { text: "Банковская карта", onPress: () => console.log("Card payment") },
            { text: "Мобильный платеж", onPress: () => console.log("Mobile payment") },
        ]);
    };

    const handleStartCharging = () => {
        const amount = getCurrentAmount();
        if (amount <= 0) {
            Alert.alert("Ошибка", "Выберите количество кВт для зарядки");
            return;
        }

        const cost = calculateCost(amount);
        if (cost > balance) {
            Alert.alert("Недостаточно средств", "Пополните баланс для начала зарядки");
            return;
        }

        const selectedConn = connectors.find((c) => c.id === selectedConnector);
        if (selectedConn?.status !== "available") {
            Alert.alert("Недоступно", "Выбранный разъем недоступен");
            return;
        }

        Alert.alert("Начать зарядку", `Зарядка: ${amount} кВт\nСтоимость: ${cost.toFixed(2)} KGS\nРазъем: ${selectedConn.type}`, [
            { text: "Отмена", style: "cancel" },
            {
                text: "Начать",
                onPress: () => {
                    const session: ChargingSession = {
                        id: Date.now().toString(),
                        stationId: station.id,
                        stationName: station.name,
                        stationAddress: station.address,
                        startTime: new Date().toISOString(),
                        energyConsumed: 0,
                        cost: 0,
                        status: "active",
                    };

                    dispatch(startCharging(session));
                    dispatch(updateStationStatus({ id: station.id, status: "occupied" }));
                    setBalance((prev) => prev - cost);

                    const notification: Notification = {
                        id: Date.now().toString(),
                        type: "charging_complete",
                        title: "Зарядка начата",
                        message: `Зарядка начата на станции ${station.name}`,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                    };
                    dispatch(addNotification(notification));
                },
            },
        ]);
    };

    const handleStopCharging = () => {
        if (!currentSession) return;

        Alert.alert("Остановить зарядку", "Вы уверены, что хотите остановить зарядку?", [
            { text: "Отмена", style: "cancel" },
            {
                text: "Остановить",
                style: "destructive",
                onPress: () => {
                    const completedSession: ChargingSession = {
                        ...currentSession,
                        endTime: new Date().toISOString(),
                        energyConsumed: elapsedTime * (station.power / 3600),
                        cost: calculateCost(elapsedTime * (station.power / 3600)),
                        status: "completed",
                    };

                    dispatch(stopCharging(completedSession));
                    dispatch(updateStationStatus({ id: station.id, status: "available" }));

                    const notification: Notification = {
                        id: Date.now().toString(),
                        type: "charging_complete",
                        title: "Зарядка завершена",
                        message: `Стоимость: ${completedSession.cost.toFixed(0)} сом`,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                    };
                    dispatch(addNotification(notification));
                },
            },
        ]);
    };

    const handleToggleFavorite = () => {
        dispatch(toggleFavorite(station.id));
    };

    const handleEmergencyCall = () => {
        Alert.alert("Вызов эвакуатора", "Вы хотите позвонить в службу эвакуации по номеру 102?", [
            { text: "Отмена", style: "cancel" },
            { text: "Позвонить", onPress: () => console.log("Calling 102") },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Зарядка</Text>

                <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
                    <Heart
                        size={24}
                        color={station.isFavorite ? "#EF4444" : "#9CA3AF"}
                        fill={station.isFavorite ? "#EF4444" : "transparent"}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Station Info */}
                <Card style={styles.stationCard}>
                    <View style={styles.stationHeader}>
                        <View style={styles.stationInfo}>
                            <Text style={styles.stationName}>{station.name}</Text>
                            <View style={styles.stationBadge}>
                                <Text style={styles.stationBadgeText}>#525</Text>
                            </View>
                        </View>
                        <View style={styles.brandLogo}>
                            <Text style={styles.brandText}>CHARGEX</Text>
                        </View>
                    </View>

                    <View style={styles.addressRow}>
                        <MapPin size={16} color="#6B7280" />
                        <Text style={styles.address}>г. Бишкек | 10-мкр 32/4</Text>
                    </View>
                </Card>

                {/* Connectors */}
                <Card style={styles.connectorsCard}>
                    {connectors.map((connector) => (
                        <TouchableOpacity
                            key={connector.id}
                            style={[
                                styles.connectorRow,
                                selectedConnector === connector.id && styles.connectorRowSelected,
                                connector.status !== "available" && styles.connectorRowDisabled,
                            ]}
                            onPress={() => connector.status === "available" && setSelectedConnector(connector.id)}
                            disabled={connector.status !== "available"}
                        >
                            <View style={styles.connectorLeft}>
                                <View style={styles.connectorIcon}>
                                    <Zap size={20} color="#6B7280" />
                                </View>
                                <Text style={styles.connectorText}>
                                    {connector.id} - {connector.type}
                                </Text>
                            </View>

                            <View style={styles.connectorRight}>
                                <View style={[styles.connectorStatus, { backgroundColor: getStatusColor(connector.status) }]}>
                                    <Text style={styles.connectorStatusText}>
                                        {connector.status === "occupied"
                                            ? `Занят ${connector.occupancy}%`
                                            : getStatusText(connector.status)}
                                    </Text>
                                </View>

                                <View style={[styles.radioButton, selectedConnector === connector.id && styles.radioButtonSelected]} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </Card>

                {/* Station Details */}
                <Card style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Время работы:</Text>
                        <Text style={styles.detailValue}>Круглосуточно</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Тариф:</Text>
                        <Text style={styles.detailValue}>{station.pricePerKwh} KGS/кВт</Text>
                    </View>

                    <View style={styles.powerInfo}>
                        <Zap size={24} color="#F59E0B" />
                        <View style={styles.powerText}>
                            <Text style={styles.powerValue}>{station.power} кВт/ч</Text>
                            <Text style={styles.powerLabel}>Мощность</Text>
                        </View>
                    </View>
                </Card>

                {/* Emergency Notice */}
                <Card style={styles.emergencyCard}>
                    <Text style={styles.emergencyText}>
                        Если место для электрозарядки занято автомобилем с ДВС, вы имеете право вызвать эвакуатор позвонив в МВД по
                        номеру 102.
                    </Text>

                    <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
                        <Phone size={16} color="#3B82F6" />
                        <Text style={styles.emergencyButtonText}>ПОЗВОНИТЬ</Text>
                    </TouchableOpacity>
                </Card>

                {/* Balance Section */}
                <Card style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <View style={styles.balanceInfo}>
                            <View style={styles.balanceIcon}>
                                <Wallet size={20} color="#FFFFFF" />
                            </View>
                            <View>
                                <Text style={styles.balanceAmount}>{balance.toFixed(2)} KGS</Text>
                                <Text style={styles.balanceLabel}>Баланс</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.topUpButton} onPress={handleTopUpBalance}>
                            <Plus size={16} color="#10B981" />
                            <Text style={styles.topUpButtonText}>Пополнить</Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Session Selection */}
                <Card style={styles.sessionCard}>
                    <Text style={styles.sessionTitle}>Выберите параметры зарядной сессии или просто нажмите «Начать зарядку»</Text>

                    <View style={styles.presetButtons}>
                        {presetAmounts.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[styles.presetButton, selectedAmount === amount && styles.presetButtonSelected]}
                                onPress={() => handleAmountSelect(amount)}
                            >
                                <Text style={[styles.presetButtonText, selectedAmount === amount && styles.presetButtonTextSelected]}>
                                    {amount} кВт
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.customAmountContainer}>
                        <TextInput
                            style={styles.customAmountInput}
                            value={customAmount}
                            onChangeText={handleCustomAmountChange}
                            placeholder="0.00 KGS"
                            keyboardType="numeric"
                        />
                        {customAmount.length > 0 && (
                            <TouchableOpacity style={styles.clearButton} onPress={clearCustomAmount}>
                                <X size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.chargingInfo}>кВт зарядки: {getCurrentAmount()} кВт</Text>

                    {getCurrentAmount() > 0 && (
                        <Text style={styles.costInfo}>Стоимость: {calculateCost(getCurrentAmount()).toFixed(2)} KGS</Text>
                    )}
                </Card>

                {/* Active Charging Session */}
                {isCurrentlyCharging && currentSession && (
                    <Card style={styles.chargingCard}>
                        <Text style={styles.chargingTitle}>Активная зарядка</Text>

                        <View style={styles.chargingInfo}>
                            <View style={styles.chargingRow}>
                                <Clock size={20} color="#10B981" />
                                <Text style={styles.chargingTime}>{formatTime(elapsedTime)}</Text>
                            </View>

                            <View style={styles.chargingStats}>
                                <View style={styles.chargingStat}>
                                    <Text style={styles.chargingStatValue}>{(elapsedTime * (station.power / 3600)).toFixed(1)}</Text>
                                    <Text style={styles.chargingStatLabel}>кВт⋅ч</Text>
                                </View>

                                <View style={styles.chargingStat}>
                                    <Text style={styles.chargingStatValue}>
                                        {calculateCost(elapsedTime * (station.power / 3600)).toFixed(0)}
                                    </Text>
                                    <Text style={styles.chargingStatLabel}>сом</Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                )}

                {/* Action Button */}
                <View style={styles.actionButtons}>
                    {isCurrentlyCharging ? (
                        <Button title="Остановить зарядку" variant="danger" onPress={handleStopCharging} style={styles.actionButton} />
                    ) : (
                        <Button
                            title="Начать зарядку"
                            onPress={handleStartCharging}
                            disabled={getCurrentAmount() <= 0}
                            style={styles.actionButton}
                        />
                    )}
                </View>
            </ScrollView>
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
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#111827",
        flex: 1,
        textAlign: "center",
        marginHorizontal: 16,
    },
    favoriteButton: {
        padding: 8,
        marginRight: -8,
    },
    scrollContent: {
        padding: 20,
    },
    stationCard: {
        marginBottom: 16,
    },
    stationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    stationInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    stationName: {
        fontSize: 20,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#111827",
        marginRight: 8,
    },
    stationBadge: {
        backgroundColor: "#9CA3AF",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    stationBadgeText: {
        fontSize: 12,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#FFFFFF",
    },
    brandLogo: {
        alignItems: "flex-end",
    },
    brandText: {
        fontSize: 12,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#3B82F6",
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    address: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        marginLeft: 6,
    },
    connectorsCard: {
        marginBottom: 16,
        padding: 0,
    },
    connectorRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    connectorRowSelected: {
        backgroundColor: "#F0FDF4",
        borderLeftWidth: 4,
        borderLeftColor: "#10B981",
    },
    connectorRowDisabled: {
        opacity: 0.6,
    },
    connectorLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    connectorIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    connectorText: {
        fontSize: 16,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#111827",
    },
    connectorRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    connectorStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    connectorStatusText: {
        fontSize: 12,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#FFFFFF",
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
    },
    radioButtonSelected: {
        borderColor: "#10B981",
        backgroundColor: "#10B981",
    },
    detailsCard: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
    },
    detailValue: {
        fontSize: 14,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#111827",
    },
    powerInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    powerText: {
        marginLeft: 12,
    },
    powerValue: {
        fontSize: 16,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#111827",
    },
    powerLabel: {
        fontSize: 12,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
    },
    emergencyCard: {
        marginBottom: 16,
        backgroundColor: "#FEF3F2",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    emergencyText: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        lineHeight: 20,
        marginBottom: 16,
    },
    emergencyButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EBF4FF",
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#3B82F6",
    },
    emergencyButtonText: {
        fontSize: 14,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#3B82F6",
        marginLeft: 6,
    },
    balanceCard: {
        marginBottom: 16,
    },
    balanceHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    balanceInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    balanceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    balanceAmount: {
        fontSize: 20,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#111827",
    },
    balanceLabel: {
        fontSize: 12,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
    },
    topUpButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0FDF4",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#10B981",
    },
    topUpButtonText: {
        fontSize: 14,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#10B981",
        marginLeft: 4,
    },
    sessionCard: {
        marginBottom: 16,
    },
    sessionTitle: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        lineHeight: 20,
        marginBottom: 16,
    },
    presetButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 16,
    },
    presetButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    presetButtonSelected: {
        backgroundColor: "#EBF4FF",
        borderColor: "#3B82F6",
    },
    presetButtonText: {
        fontSize: 14,
        fontFamily: "Inter-Medium",
        fontWeight: "500",
        color: "#6B7280",
    },
    presetButtonTextSelected: {
        color: "#3B82F6",
    },
    customAmountContainer: {
        position: "relative",
        marginBottom: 12,
    },
    customAmountInput: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: "Inter-Regular",
        backgroundColor: "#FFFFFF",
        paddingRight: 40,
    },
    clearButton: {
        position: "absolute",
        right: 12,
        top: 12,
        padding: 4,
    },
    chargingInfo: {
        fontSize: 14,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        marginBottom: 4,
    },
    costInfo: {
        fontSize: 16,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#10B981",
    },
    chargingCard: {
        backgroundColor: "#F0FDF4",
        borderWidth: 2,
        borderColor: "#10B981",
        marginBottom: 24,
    },
    chargingTitle: {
        fontSize: 18,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#10B981",
        marginBottom: 16,
        textAlign: "center",
    },
    chargingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    chargingTime: {
        fontSize: 32,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#10B981",
        marginLeft: 8,
    },
    chargingStats: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 32,
    },
    chargingStat: {
        alignItems: "center",
    },
    chargingStatValue: {
        fontSize: 20,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#111827",
    },
    chargingStatLabel: {
        fontSize: 12,
        fontFamily: "Inter-Medium",
        fontWeight: "500",
        color: "#6B7280",
        marginTop: 4,
    },
    actionButtons: {
        gap: 12,
    },
    actionButton: {
        // Additional styling if needed
    },
});
