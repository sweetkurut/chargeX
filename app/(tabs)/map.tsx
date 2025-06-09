import { mockStations } from "@/services/mockData";
import { RootState } from "@/store";
import { setSelectedStation, setStations } from "@/store/slices/stationSlice";
// import { setSelectedStation, setStations } from "@/store/slices/stationsSlice";
import { ChargingStation } from "@/types";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Bell, MapPin, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

// Conditional import for react-native-maps
let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== "web") {
    import("react-native-maps")
        .then((Maps) => {
            MapView = Maps.default;
            Marker = Maps.Marker;
        })
        .catch(() => {
            console.log("react-native-maps not available");
        });
}

interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export default function MapScreen() {
    const [region, setRegion] = useState<Region>({
        latitude: 42.8746,
        longitude: 74.5698,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

    const dispatch = useDispatch();
    const { stations } = useSelector((state: RootState) => state.stations);
    const { unreadCount } = useSelector((state: RootState) => state.notifications);

    useEffect(() => {
        requestLocationPermission();
        loadStations();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Разрешение на геолокацию", "Для лучшего опыта использования разрешите доступ к вашему местоположению");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);
            setRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        } catch (error) {
            console.log("Location permission error:", error);
        }
    };

    const loadStations = () => {
        // Mock API call - in real app, this would fetch from backend
        dispatch(setStations(mockStations));
    };

    const getMarkerColor = (status: ChargingStation["status"]) => {
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

    const handleMarkerPress = (station: ChargingStation) => {
        dispatch(setSelectedStation(station));
        router.push(`/station/${station.id}`);
    };

    const handleNotificationsPress = () => {
        router.push("/notidications");
    };

    const renderWebMap = () => (
        <View style={styles.webMapContainer}>
            <View style={styles.webMapPlaceholder}>
                <MapPin size={48} color="#10B981" />
                <Text style={styles.webMapText}>Карта доступна в мобильном приложении</Text>
                <Text style={styles.webMapSubtext}>Используйте список станций для просмотра доступных зарядных станций</Text>
                <TouchableOpacity style={styles.webMapButton} onPress={() => router.push("/(tabs)/stations")}>
                    <Text style={styles.webMapButtonText}>Перейти к списку станций</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderNativeMap = () => {
        if (!MapView || !Marker) {
            return renderWebMap();
        }

        return (
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {stations.map((station) => (
                    <Marker
                        key={station.id}
                        coordinate={{
                            latitude: station.latitude,
                            longitude: station.longitude,
                        }}
                        title={station.name}
                        description={`${station.power} кВт • ${station.pricePerKwh} сом/кВт⋅ч`}
                        pinColor={getMarkerColor(station.status)}
                        onPress={() => handleMarkerPress(station)}
                    />
                ))}
            </MapView>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>Карта</Text>
                    <Text style={styles.headerSubtitle}>{stations.length} станций найдено</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Search size={24} color="#374151" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={handleNotificationsPress}>
                        <Bell size={24} color="#374151" />
                        {unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {Platform.OS === "web" ? renderWebMap() : renderNativeMap()}

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                    <Text style={styles.legendText}>Доступно</Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
                    <Text style={styles.legendText}>Занято</Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
                    <Text style={styles.legendText}>Недоступно</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
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
    headerLeft: {
        flex: 1,
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
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconButton: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "#EF4444",
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeText: {
        fontSize: 10,
        fontFamily: "Inter-Bold",
        fontWeight: "700",
        color: "#FFFFFF",
    },
    map: {
        flex: 1,
    },
    webMapContainer: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    webMapPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    webMapText: {
        fontSize: 20,
        fontFamily: "Inter-SemiBold",
        fontWeight: "600",
        color: "#374151",
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    webMapSubtext: {
        fontSize: 16,
        fontFamily: "Inter-Regular",
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    webMapButton: {
        backgroundColor: "#10B981",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    webMapButtonText: {
        fontSize: 16,
        fontFamily: "Inter-Medium",
        fontWeight: "500",
        color: "#FFFFFF",
    },
    legend: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-around",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        fontFamily: "Inter-Medium",
        fontWeight: "500",
        color: "#374151",
    },
});
