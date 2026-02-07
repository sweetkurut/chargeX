import { RootState } from "@/store";
import React, { useEffect } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
// import { setStations } from '@/store/slices/stationsSlice';
import StationCard from "@/components/stations/StationsCard";
import { useTheme } from "@/constants/ThemeContext";
import { mockStations } from "@/services/mockData";
import { setStations } from "@/store/slices/stationSlice";
import { ChargingStation } from "@/types";
import { router } from "expo-router";
import { Heart } from "lucide-react-native";

export default function FavoritesScreen() {
    const { theme } = useTheme();

    const dispatch = useDispatch();
    const { stations, favorites } = useSelector((state: RootState) => state.stations);

    useEffect(() => {
        loadStations();
    }, []);

    const loadStations = () => {
        dispatch(setStations(mockStations));
    };

    const favoriteStations = stations.filter(
        (station) => favorites.includes(station.id) || station.isFavorite,
    );

    const handleStationPress = (station: ChargingStation) => {
        router.push(`/station/${station.id}`);
    };

    const renderStationCard = ({ item }: { item: ChargingStation }) => (
        <StationCard station={item} onPress={() => handleStationPress(item)} />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Heart size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Нет избранных станций</Text>
            <Text style={styles.emptySubtitle}>Добавьте станции в избранное, нажав на иконку сердечка</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Избранное</Text>
                <Text style={[styles.headerSubtitle, { color: theme.text }]}>
                    {favoriteStations.length} избранных станций
                </Text>
            </View>

            <FlatList
                data={favoriteStations}
                renderItem={renderStationCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContainer,
                    favoriteStations.length === 0 && styles.emptyContainer,
                ]}
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
