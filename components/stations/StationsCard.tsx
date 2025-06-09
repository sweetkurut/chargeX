import Card from "@/components/ui/Card";
import { toggleFavorite } from "@/store/slices/stationSlice";

import { ChargingStation } from "@/types";
import { Heart, MapPin, Zap } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";

interface StationCardProps {
  station: ChargingStation;
  onPress: () => void;
}

export default function StationCard({ station, onPress }: StationCardProps) {
  const dispatch = useDispatch();

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

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(station.id));
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={styles.header}>
          <Text style={styles.name}>{station.name}</Text>
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
            <Heart
              size={20}
              color={station.isFavorite ? "#EF4444" : "#9CA3AF"}
              fill={station.isFavorite ? "#EF4444" : "transparent"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.addressRow}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.address}>{station.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Zap size={16} color="#F59E0B" />
            <Text style={styles.infoText}>{station.power} кВт</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.connectorType}>{station.connectorType}</Text>
          </View>

          {station.distance && <Text style={styles.distance}>{station.distance.toFixed(1)} км</Text>}
        </View>

        <View style={styles.footer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(station.status) + "20" }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(station.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(station.status) }]}>{getStatusText(station.status)}</Text>
          </View>

          <Text style={styles.price}>{station.pricePerKwh} сом/кВт⋅ч</Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    marginLeft: 4,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#374151",
    marginLeft: 4,
  },
  connectorType: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    fontWeight: "600",
    color: "#3B82F6",
    backgroundColor: "#EBF4FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  distance: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    marginLeft: "auto",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    fontWeight: "600",
  },
  price: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#10B981",
  },
});
