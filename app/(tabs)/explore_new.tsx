import React, { useState } from "react";
import {
  StyleSheet,
  Alert,
  Platform,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { HelloWave } from "@/components/HelloWave";
import LabeledDropdown from "@/components/LabeledDropdown";
import AnimatedInput from "@/components/AnimatedInput";
import AnimatedButton from "@/components/AnimatedButton";
import FadeInView from "@/components/FadeInView";
import { CATEGORIAS } from "@/constants/categorias";
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

export default function ConsultaStockScreen() {
  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [mensajeGenerado, setMensajeGenerado] = useState("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Limpiar mensaje cuando se editen los campos
  const handleCategoriaChange = (text: string) => {
    setCategoria(text);
    setMensajeGenerado("");
  };

  const handleMarcaChange = (text: string) => {
    setMarca(text);
    setMensajeGenerado("");
  };

  const handleModeloChange = (text: string) => {
    setModelo(text);
    setMensajeGenerado("");
  };

  const generarConsulta = () => {
    if (!categoria.trim() || !marca.trim() || !modelo.trim()) {
      Alert.alert(
        "Atención",
        "Por favor completa todos los campos para generar la consulta"
      );
      return;
    }

    const mensaje = `Me confirmas si hay stock de:
📦 Categoría: ${categoria}
🏷️ Marca: ${marca}
📱 Modelo: ${modelo}`;

    setMensajeGenerado(mensaje);
    setModalVisible(true);
  };

  const copiarConsulta = async () => {
    if (mensajeGenerado) {
      try {
        await Clipboard.setStringAsync(mensajeGenerado);
        Alert.alert("¡Copiado!", "Consulta copiada al portapapeles");
        setModalVisible(false);
      } catch (error) {
        Alert.alert("Error", "No se pudo copiar la consulta");
      }
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
  };

  return (
    <ParallaxScrollView
      headerBackgroundImage={require("@/assets/images/background-hogar.jpeg")}
      headerImage={
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={require("@/assets/images/logo-transparent.png")}
              style={styles.logoHeader}
              contentFit="contain"
            />
          </View>
        </View>
      }
    >
      <FadeInView delay={0}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">📦 Consulta de Stock</ThemedText>
          <HelloWave />
        </ThemedView>
      </FadeInView>

      <FadeInView delay={200}>
        <ThemedView style={styles.formContainer}>
          <LabeledDropdown
            label="Categoría"
            required
            options={CATEGORIAS}
            selectedValue={categoria}
            onSelect={handleCategoriaChange}
            placeholder="Seleccionar categoría..."
          />

          <AnimatedInput
            label="Marca"
            icon="🏷️"
            required
            value={marca}
            onChangeText={handleMarcaChange}
            placeholder="Ej: Samsung, Apple, Xiaomi..."
          />

          <AnimatedInput
            label="Modelo"
            icon="📱"
            required
            value={modelo}
            onChangeText={handleModeloChange}
            placeholder="Ej: Galaxy S24, iPhone 15, Redmi Note 13..."
          />
        </ThemedView>
      </FadeInView>

      <FadeInView delay={400}>
        <ThemedView style={styles.buttonContainer}>
          <AnimatedButton
            title="✨ Generar Mensaje"
            onPress={generarConsulta}
            variant="primary"
            style={styles.generateButton}
          />
        </ThemedView>
      </FadeInView>

      {/* Modal para mostrar la consulta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cerrarModal}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedView style={styles.modalHeader}>
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  ✨ Consulta Generada
                </ThemedText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={cerrarModal}
                >
                  <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
              </ThemedView>

              <ThemedView style={styles.modalMessageContainer}>
                <ThemedText style={styles.modalMessageText}>
                  {mensajeGenerado}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.modalButtonContainer}>
                <AnimatedButton
                  title="📋 Copiar al Portapapeles"
                  onPress={copiarConsulta}
                  variant="secondary"
                  style={styles.copyButton}
                />
              </ThemedView>
            </ScrollView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  formContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  buttonContainer: {
    marginVertical: SPACING.md,
  },
  generateButton: {
    marginTop: SPACING.sm,
  },
  copyButton: {
    marginTop: SPACING.sm,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.lg,
  },
  logoHeader: {
    width: 60,
    height: 38,
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContainer: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 0,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  closeButton: {
    width: 35,
    height: 35,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  closeButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: "600",
  },
  modalMessageContainer: {
    backgroundColor: COLORS.cardBackground,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalMessageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: COLORS.text,
  },
  modalButtonContainer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
});
