import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { mockNotifications } from "@/services/mockData";
import { RootState } from "@/store";
import { markAllAsRead, markAsRead, setNotifications } from "@/store/slices/notificationsSlice";
import { Notification } from "@/types";
import { router } from "expo-router";
import { AlertTriangle, Bell, CheckCheck, ChevronLeft, CreditCard, Zap } from "lucide-react-native";
import React, { useEffect } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function NotificationsScreen() {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    dispatch(setNotifications(mockNotifications));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "charging_complete":
        return Zap;
      case "charging_error":
        return AlertTriangle;
      case "station_available":
        return Bell;
      case "payment_complete":
        return CreditCard;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "charging_complete":
        return "#10B981";
      case "charging_error":
        return "#EF4444";
      case "station_available":
        return "#3B82F6";
      case "payment_complete":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return "Только что";
    } else if (diffMins < 60) {
      return `${diffMins} мин назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`;
    } else if (diffDays < 7) {
      return `${diffDays} дн назад`;
    } else {
      return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const IconComponent = getNotificationIcon(item.type);
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)} activeOpacity={0.8}>
        <Card style={[styles.notificationCard, !item.isRead && styles.unreadCard]}>
          <View style={styles.notificationContent}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
              <IconComponent size={20} color={iconColor} />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>{item.title}</Text>

              <Text style={styles.notificationMessage}>{item.message}</Text>

              <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
            </View>

            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Bell size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Нет уведомлений</Text>
      <Text style={styles.emptySubtitle}>Здесь будут отображаться уведомления о зарядке и других событиях</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Уведомления</Text>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <CheckCheck size={20} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>

      {notifications.length > 0 && unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>{unreadCount} непрочитанных уведомлений</Text>
          <Button title="Отметить все как прочитанные" variant="outline" size="small" onPress={handleMarkAllAsRead} />
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, notifications.length === 0 && styles.emptyContainer]}
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
  markAllButton: {
    padding: 8,
    marginRight: -8,
  },
  unreadBanner: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unreadText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    color: "#10B981",
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCard: {
    marginBottom: 12,
    padding: 16,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  unreadTitle: {
    color: "#111827",
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#9CA3AF",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginLeft: 8,
    marginTop: 4,
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
