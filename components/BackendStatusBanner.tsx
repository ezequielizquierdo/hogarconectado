import React from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useBackendStatus } from "@/hooks/useBackendStatus";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";

interface BackendStatusBannerProps {
  style?: any;
}

export default function BackendStatusBanner({
  style,
}: BackendStatusBannerProps) {
  const { isWarmedUp, isWarming, forceWarmup } = useBackendStatus();

  const showDiagnostic = async () => {
    try {
      // Importar la instancia singleton directamente
      const warmupService = (await import("@/services/warmupService")).default;

      Alert.alert("🔍 Diagnóstico iniciado", "Probando conexiones...", [
        { text: "OK" },
      ]);

      await warmupService.warmupBackend();
      const workingUrl = warmupService.getWorkingUrl();

      if (workingUrl) {
        Alert.alert(
          "✅ Diagnóstico de red",
          `Backend funcionando en:\n${workingUrl}\n\nPuedes continuar usando la app normalmente.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "❌ Problema de conexión",
          "No se pudo conectar con el backend.\n\nPasos para solucionar:\n1. Verificar que el backend esté corriendo en el puerto 3000\n2. Verificar la IP en el terminal con: ifconfig\n3. Actualizar la IP en services/apiClient.ts",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        "⚠️ Error de diagnóstico",
        `Error: ${
          error.message || "Error desconocido"
        }\n\nVerifica que el backend esté corriendo y que la IP sea correcta.`,
        [{ text: "OK" }]
      );
    }
  };

  // No mostrar nada si ya está caliente
  if (isWarmedUp) return null;

  return (
    <ThemedView style={[styles.container, style]}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.icon}>{isWarming ? "🔄" : "🔥"}</ThemedText>
        <ThemedView style={styles.textContainer}>
          <ThemedText style={styles.title}>
            {isWarming ? "Despertando servidor..." : "Servidor en reposo"}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isWarming
              ? "Esto puede tomar hasta 30 segundos"
              : "Toca para despertar o diagnosticar"}
          </ThemedText>
        </ThemedView>
        {!isWarming && (
          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={forceWarmup}>
              <ThemedText style={styles.buttonText}>Despertar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.diagnosticButton]}
              onPress={showDiagnostic}
            >
              <ThemedText style={styles.buttonText}>🔍</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warning + "20",
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    margin: SPACING.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  button: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  diagnosticButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
