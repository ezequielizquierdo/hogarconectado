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
import LabeledDropdown from "@/components/forms/LabeledDropdown";
import EditableDropdown from "@/components/forms/EditableDropdown";
import ModeloDropdown from "@/components/forms/ModeloDropdown";
import AnimatedInput from "@/components/forms/AnimatedInput";
import AnimatedButton from "@/components/ui/AnimatedButton";
import FadeInView from "@/components/ui/FadeInView";
import { useCategorias } from "@/hooks/useCategorias";
import { useMarcasPorCategoria } from "@/hooks/useMarcasPorCategoria";
import { useProductosPorCategoriaYMarca } from "@/hooks/useProductosPorCategoriaYMarca";
import { COLORS, GRADIENTS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { Producto } from "@/services/types";

export default function ConsultaStockScreen() {
  const {
    categorias,
    loading: categoriasLoading,
    error: categoriasError,
  } = useCategorias();

  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [mensajeGenerado, setMensajeGenerado] = useState("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Hooks para cascada de datos
  const {
    marcas,
    loading: marcasLoading,
    error: marcasError,
  } = useMarcasPorCategoria(categoria);

  const {
    productos,
    loading: productosLoading,
    error: productosError,
  } = useProductosPorCategoriaYMarca(categoria, marca);

  // Funciones para manejar cascada de selección
  const handleCategoriaChange = (categoriaId: string) => {
    setCategoria(categoriaId);
    setMarca(""); // Reset marca cuando cambia categoría
    setModelo(""); // Reset modelo
    setProductoSeleccionado(null); // Reset producto
    setMensajeGenerado(""); // Reset mensaje
  };

  const handleMarcaChange = (marcaSeleccionada: string) => {
    setMarca(marcaSeleccionada);
    setModelo(""); // Reset modelo cuando cambia marca
    setProductoSeleccionado(null); // Reset producto
    setMensajeGenerado(""); // Reset mensaje
  };

  const handleModeloChange = (modelo: string, producto: Producto) => {
    setModelo(modelo);
    setProductoSeleccionado(producto); // Guardar producto completo
    setMensajeGenerado(""); // Reset mensaje
  };

  const generarConsulta = () => {
    if (
      !categoria.trim() ||
      !marca.trim() ||
      !modelo.trim() ||
      !productoSeleccionado
    ) {
      Alert.alert(
        "Atención",
        "Por favor completa todos los campos para generar la consulta"
      );
      return;
    }

    // Buscar el nombre de la categoría
    const categoriaNombre =
      categorias.find((cat) => cat._id === categoria)?.nombre || categoria;

    const mensaje = `Me confirmas si hay stock de:
🆔 ID: ${productoSeleccionado._id}
📦 Categoría: ${categoriaNombre}
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
            options={categorias.map((cat) => ({
              label: cat.nombre,
              value: cat._id,
            }))}
            selectedValue={categoria}
            onSelect={handleCategoriaChange}
            placeholder="Seleccionar categoría..."
            loading={categoriasLoading}
            error={categoriasError}
          />

          <EditableDropdown
            label="Marca"
            required
            options={marcas}
            selectedValue={marca}
            onSelect={handleMarcaChange}
            placeholder="Seleccionar o escribir marca..."
            loading={marcasLoading}
            error={marcasError}
            disabled={!categoria}
          />

          <ModeloDropdown
            label="Modelo"
            required
            productos={productos}
            selectedValue={modelo}
            onSelect={handleModeloChange}
            placeholder="Seleccionar modelo..."
            loading={productosLoading}
            error={productosError}
            disabled={!marca}
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
