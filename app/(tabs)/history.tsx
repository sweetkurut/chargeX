import SessionCard from "@/components/charging/SessionCard";
import { mockChargingHistory } from "@/services/mockData";
import { RootState } from "@/store";
import { setHistory } from "@/store/slices/chargingSlice";
import { ChargingSession } from "@/types";
import { History } from "lucide-react-native";
import React, { useEffect } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function HistoryScreen() {
  const dispatch = useDispatch();
  const { history, currentSession } = useSelector((state: RootState) => state.charging);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    dispatch(setHistory(mockChargingHistory));
  };

  const renderSessionCard = ({ item }: { item: ChargingSession }) => <SessionCard session={item} />;

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <History size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>История пуста</Text>
      <Text style={styles.emptySubtitle}>Ваши сессии зарядки будут отображаться здесь</Text>
    </View>
  );

  const getTotalSessions = () => {
    return history.length + (currentSession ? 1 : 0);
  };

  const getTotalEnergy = () => {
    const historyEnergy = history.reduce((sum, session) => sum + session.energyConsumed, 0);
    const currentEnergy = currentSession?.energyConsumed || 0;
    return historyEnergy + currentEnergy;
  };

  const getTotalCost = () => {
    const historyCost = history.reduce((sum, session) => sum + session.cost, 0);
    const currentCost = currentSession?.cost || 0;
    return historyCost + currentCost;
  };

  const allSessions = currentSession ? [currentSession, ...history] : history;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>История</Text>
        <Text style={styles.headerSubtitle}>{getTotalSessions()} сессий зарядки</Text>
      </View>

      {allSessions.length > 0 && (
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalEnergy().toFixed(1)}</Text>
            <Text style={styles.statLabel}>кВт⋅ч</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalCost().toFixed(0)}</Text>
            <Text style={styles.statLabel}>сом</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalSessions()}</Text>
            <Text style={styles.statLabel}>сессий</Text>
          </View>
        </View>
      )}

      <FlatList
        data={allSessions}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, allSessions.length === 0 && styles.emptyContainer]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    marginTop: 2,
  },
  stats: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    color: "#10B981",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
