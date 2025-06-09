import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { RootState } from "@/store";
import { startCharging, stopCharging } from "@/store/slices/chargingSlice";
import { addNotification } from "@/store/slices/notificationsSlice";
import { toggleFavorite, updateStationStatus } from "@/store/slices/stationSlice";
import { ChargingSession, ChargingStation, Notification } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Clock, CreditCard, Heart, MapPin, Zap } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function StationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [elapsedTime, setElapsedTime] = useState(0);

  const dispatch = useDispatch();
  const { stations } = useSelector((state: RootState) => state.stations);
  const { currentSession } = useSelector((state: RootState) => state.charging);

  const station = stations.find((s) => s.id === id);
  const isCurrentlyCharging = currentSession?.stationId === id;

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

  const getStatusColor = (status: ChargingStation["status"]) => {
    switch (status) {
      case "available":
        return "#10B981";
      case "occupied":
        return "#F59E0B";
      case "offline":
        return "#6B7280";
      case "maintenance":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: ChargingStation["status"]) => {
    switch (status) {
      case "available":
        return "Доступно";
      case "occupied":
        return "Занято";
      case "offline":
        return "Не в сети";
      case "maintenance":
        return "Техобслуживание";
      default:
        return "Неизвестно";
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

  const calculateCost = () => {
    if (!isCurrentlyCharging || !currentSession) return 0;
    const energyUsed = elapsedTime * (station.power / 3600); // Rough calculation
    return energyUsed * station.pricePerKwh;
  };

  const handleStartCharging = () => {
    if (station.status !== "available") {
      Alert.alert("Недоступно", "Эта станция сейчас недоступна для зарядки");
      return;
    }

    Alert.alert(
      "Начать зарядку",
      `Вы хотите начать зарядку на станции "${station.name}"?\n\nТариф: ${station.pricePerKwh} сом/кВт⋅ч`,
      [
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

            // Add notification
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
      ]
    );
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
            cost: calculateCost(),
            status: "completed",
          };

          dispatch(stopCharging(completedSession));
          dispatch(updateStationStatus({ id: station.id, status: "available" }));

          // Add notification
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Детали станции</Text>

        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Heart size={24} color={station.isFavorite ? "#EF4444" : "#9CA3AF"} fill={station.isFavorite ? "#EF4444" : "transparent"} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.stationCard}>
          <Text style={styles.stationName}>{station.name}</Text>

          <View style={styles.addressRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.address}>{station.address}</Text>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(station.status) + "20" }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(station.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(station.status) }]}>{getStatusText(station.status)}</Text>
            </View>

            {station.distance && <Text style={styles.distance}>{station.distance.toFixed(1)} км</Text>}
          </View>
        </Card>

        <View style={styles.infoGrid}>
          <Card style={styles.infoCard}>
            <Zap size={24} color="#F59E0B" />
            <Text style={styles.infoValue}>{station.power} кВт</Text>
            <Text style={styles.infoLabel}>Мощность</Text>
          </Card>

          <Card style={styles.infoCard}>
            <View style={styles.connectorBadge}>
              <Text style={styles.connectorText}>{station.connectorType}</Text>
            </View>
            <Text style={styles.infoLabel}>Разъем</Text>
          </Card>

          <Card style={styles.infoCard}>
            <CreditCard size={24} color="#10B981" />
            <Text style={styles.infoValue}>{station.pricePerKwh} сом</Text>
            <Text style={styles.infoLabel}>за кВт⋅ч</Text>
          </Card>
        </View>

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
                  <Text style={styles.chargingStatValue}>{calculateCost().toFixed(0)}</Text>
                  <Text style={styles.chargingStatLabel}>сом</Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.actionButtons}>
          {isCurrentlyCharging ? (
            <Button title="Остановить зарядку" variant="danger" onPress={handleStopCharging} style={styles.actionButton} />
          ) : (
            <Button
              title="Начать зарядку"
              onPress={handleStartCharging}
              disabled={station.status !== "available"}
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
    marginBottom: 24,
  },
  stationName: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  address: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    marginLeft: 6,
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
  },
  distance: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  infoValue: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  connectorBadge: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  connectorText: {
    fontSize: 14,
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#FFFFFF",
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
  chargingInfo: {
    alignItems: "center",
  },
  chargingRow: {
    flexDirection: "row",
    alignItems: "center",
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
