import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

type DeviceStatus = "on" | "off" | "connecting";

interface SmartDeviceCardProps {
  deviceName: string;
  deviceType: string;
  status: DeviceStatus;
  onToggle: () => void;
}

export function SmartDeviceCard({
  deviceName,
  deviceType,
  status,
  onToggle,
}: SmartDeviceCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getStatusColor = () => {
    switch (status) {
      case "on":
        return "#4CAF50";
      case "off":
        return "#757575";
      case "connecting":
        return "#FF9800";
      default:
        return colors.text;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "on":
        return "Encendido";
      case "off":
        return "Apagado";
      case "connecting":
        return "Conectando...";
      default:
        return "Desconocido";
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background }]}
      onPress={onToggle}
      disabled={status === "connecting"}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.deviceName, { color: colors.text }]}>
          {deviceName}
        </Text>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
      </View>

      <Text style={[styles.deviceType, { color: colors.text }]}>
        {deviceType}
      </Text>

      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deviceType: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
