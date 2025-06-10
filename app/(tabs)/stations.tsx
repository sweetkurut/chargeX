// import StationCard from "@/components/stations/StationCard";
import StationCard from "@/components/stations/StationsCard";
import { mockStations } from "@/services/mockData";
// import { setStations } from "@/store/slices/stationsSlice";
import { ChargingStation } from "@/types";
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SortOption = "distance" | "price" | "power" | "name";
type FilterOption = "all" | "available" | "occupied" | "maintenance";

export default function StationsScreen() {
    const [stations, setStations] = useState<ChargingStation[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>("distance");
    const [filterBy, setFilterBy] = useState<FilterOption>("all");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadStations();
    }, []);

    const loadStations = () => {
        setIsLoading(true);
        // клонируем чтобы избежать мутации
        const clonedStations = mockStations.map((station) => ({ ...station }));
        setStations(clonedStations);
        setIsLoading(false);
    };

    const getFilteredAndSortedStations = () => {
        let filtered = stations;

        if (filterBy !== "all") {
            filtered = filtered.filter((station) => station.status === filterBy);
        }

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "distance":
                    return (a.distance || 0) - (b.distance || 0);
                case "price":
                    return a.pricePerKwh - b.pricePerKwh;
                case "power":
                    return b.power - a.power;
                case "name":
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    };

    const handleStationPress = (station: ChargingStation) => {
        // Пока роутер не используется — можно закомментировать
        router.push(`/station/${station.id}`);
        console.log("Выбрана станция:", station.name);
    };

    const renderStationCard = ({ item }: { item: ChargingStation }) => (
        <StationCard station={item} onPress={() => handleStationPress(item)} />
    );

    const renderSortButton = (option: SortOption, label: string) => (
        <TouchableOpacity
            key={option}
            style={[styles.sortButton, sortBy === option && styles.sortButtonActive]}
            onPress={() => setSortBy(option)}
        >
            <Text style={[styles.sortButtonText, sortBy === option && styles.sortButtonTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderFilterButton = (option: FilterOption, label: string) => (
        <TouchableOpacity
            key={option}
            style={[styles.filterButton, filterBy === option && styles.filterButtonActive]}
            onPress={() => setFilterBy(option)}
        >
            <Text style={[styles.filterButtonText, filterBy === option && styles.filterButtonTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    const filteredStations = getFilteredAndSortedStations();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Станции</Text>
                    <Text style={styles.headerSubtitle}>
                        {filteredStations.length} из {stations.length} станций
                    </Text>
                </View>

                <TouchableOpacity style={styles.mapButton} onPress={() => console.log("Переход на карту")}>
                    <MapPin size={20} color="#10B981" />
                    <Text style={styles.mapButtonText}>Карта</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.controls}>
                <View style={styles.sortContainer}>
                    <Text style={styles.controlLabel}>Сортировка:</Text>
                    <View style={styles.sortButtons}>
                        {renderSortButton("distance", "Расстояние")}
                        {renderSortButton("price", "Цена")}
                        {renderSortButton("power", "Мощность")}
                        {renderSortButton("name", "Название")}
                    </View>
                </View>

                <View style={styles.filterContainer}>
                    <Text style={styles.controlLabel}>Фильтр:</Text>
                    <View style={styles.filterButtons}>
                        {renderFilterButton("all", "Все")}
                        {renderFilterButton("available", "Доступно")}
                        {renderFilterButton("occupied", "Занято")}
                        {renderFilterButton("maintenance", "Недоступно")}
                    </View>
                </View>
            </View>

            <FlatList
                data={filteredStations}
                renderItem={renderStationCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                onRefresh={loadStations}
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
        justifyContent: "space-between",
        alignItems: "center",
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
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0FDF4",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#10B981",
    },
    mapButtonText: {
        fontSize: 14,
        fontFamily: "Inter-Medium",
        fontWeight: "500",
        color: "#10B981",
        marginLeft: 4,
    },
    controls: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    sortContainer: {
        marginBottom: 16,
    },
    filterContainer: {},
    controlLabel: {
        fontSize: 14,
        fontFamily: "Inter-Medium",
        fontWeight: "500",
        color: "#374151",
        marginBottom: 8,
    },
    sortButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    filterButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    sortButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    sortButtonActive: {
        backgroundColor: "#10B981",
        borderColor: "#10B981",
    },
    sortButtonText: {
        fontSize: 12,
        fontFamily: "Inter-Medium",
        fontWeight: "500",
        color: "#6B7280",
    },
    sortButtonTextActive: {
        color: "#FFFFFF",
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    filterButtonActive: {
        backgroundColor: "#3B82F6",
        borderColor: "#3B82F6",
    },
    filterButtonText: {
        fontSize: 12,
        fontFamily: "Inter-Medium",
        fontWeight: "500",
        color: "#6B7280",
    },
    filterButtonTextActive: {
        color: "#FFFFFF",
    },
    listContainer: {
        padding: 20,
    },
});
