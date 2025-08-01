import { Image } from "expo-image";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  View,
} from "react-native";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import LabeledDropdown from "@/components/forms/LabeledDropdown";
import EditableDropdown from "@/components/forms/EditableDropdown";
import ModeloDropdown from "@/components/forms/ModeloDropdown";
import ReadOnlyField from "@/components/forms/ReadOnlyField";
import AnimatedInput from "@/components/forms/AnimatedInput";
import AnimatedButton from "@/components/ui/AnimatedButton";
import FadeInView from "@/components/ui/FadeInView";
import { useCategorias } from "@/hooks/useCategorias";
import { useMarcasPorCategoria } from "@/hooks/useMarcasPorCategoria";
import { useProductosPorCategoriaYMarca } from "@/hooks/useProductosPorCategoriaYMarca";
import { COLORS, SPACING, RADIUS, SHADOWS } from "@/constants/theme";
import { Producto } from "@/services/types";

interface CotizacionData {
  categoria: string;
  marca: string;
  modelo: string;
  detalle: string;
  valorReal: string;
  porcentajeAplicado: string;
}

interface CalculosResultado {
  valorConGanancia: number;
  valorPorCuota3: number;
  valorPorCuota6: number;
}

export default function HomeScreen() {
  const {
    categorias,
    loading: categoriasLoading,
    error: categoriasError,
    recargar,
  } = useCategorias();

  const [cotizacion, setCotizacion] = useState<CotizacionData>({
    categoria: "",
    marca: "",
    modelo: "",
    detalle: "",
    valorReal: "",
    porcentajeAplicado: "10",
  });

  // Hooks para cascada de datos
  const {
    marcas,
    loading: marcasLoading,
    error: marcasError,
  } = useMarcasPorCategoria(cotizacion.categoria);

  const {
    productos,
    loading: productosLoading,
    error: productosError,
  } = useProductosPorCategoriaYMarca(cotizacion.categoria, cotizacion.marca);

  const [mensajeFinal, setMensajeFinal] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Factores de recargo basados en el análisis del Excel
  const FACTOR_3_CUOTAS = 1.1298;
  const FACTOR_6_CUOTAS = 1.2138;

  const calcularCotizacion = (): CalculosResultado | null => {
    const valorReal = parseFloat(cotizacion.valorReal);
    const porcentaje = parseFloat(cotizacion.porcentajeAplicado);

    if (isNaN(valorReal) || isNaN(porcentaje)) {
      return null;
    }

    const valorConGanancia = valorReal * (1 + porcentaje / 100);
    const valorPorCuota3 = (valorConGanancia * FACTOR_3_CUOTAS) / 3;
    const valorPorCuota6 = (valorConGanancia * FACTOR_6_CUOTAS) / 6;

    return {
      valorConGanancia,
      valorPorCuota3,
      valorPorCuota6,
    };
  };

  const formatearPrecio = (precio: number): string => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const generarMensajeFinal = () => {
    const calculos = calcularCotizacion();
    if (!calculos) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos");
      return;
    }

    // Crear el mensaje con formato para WhatsApp/Instagram
    const mensaje = `🏠 *Hogar Conectado* 

*Cotización*
📦 ${cotizacion.categoria.toUpperCase()}
🏷️ ${cotizacion.marca.toUpperCase()} - ${cotizacion.modelo.toUpperCase()}
✏️ ${cotizacion.detalle ? `${cotizacion.detalle.toUpperCase()}` : ""}

💰 *Precios:*
💵 Contado: *${formatearPrecio(calculos.valorConGanancia)}*
🗓️ 3 Cuotas: *${formatearPrecio(calculos.valorPorCuota3)}* c/u
🗓️ 6 Cuotas: *${formatearPrecio(calculos.valorPorCuota6)}* c/u

📞 ¡Consultá por stock y disponibilidad!`;

    setMensajeFinal(mensaje);
    setModalVisible(true);
  };

  const copiarAlPortapapeles = async () => {
    if (mensajeFinal) {
      await Clipboard.setStringAsync(mensajeFinal);
      Alert.alert(
        "✅ Copiado",
        "La cotización ha sido copiada al portapapeles"
      );
    }
  };

  const limpiarFormulario = () => {
    setCotizacion({
      categoria: "",
      marca: "",
      modelo: "",
      detalle: "",
      valorReal: "",
      porcentajeAplicado: "10",
    });
    setMensajeFinal("");
    setModalVisible(false);
  };

  // Funciones para manejar cascada de selección
  const handleCategoriaChange = (categoriaId: string) => {
    setCotizacion({
      ...cotizacion,
      categoria: categoriaId,
      marca: "", // Reset marca cuando cambia categoría
      modelo: "", // Reset modelo
      detalle: "", // Reset detalle
      valorReal: "", // Reset valor
    });
  };

  const handleMarcaChange = (marca: string) => {
    setCotizacion({
      ...cotizacion,
      marca: marca,
      modelo: "", // Reset modelo cuando cambia marca
      detalle: "", // Reset detalle
      valorReal: "", // Reset valor
    });
  };

  const handleModeloChange = (modelo: string, producto: Producto) => {
    setCotizacion({
      ...cotizacion,
      modelo: modelo,
      detalle: producto.descripcion || "",
      valorReal: producto.precioBase?.toString() || "",
    });
  };

  const cerrarModal = () => {
    setModalVisible(false);
  };

  const calculos = calcularCotizacion();

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
          <ThemedText type="title">Calculadora de Cotizaciones</ThemedText>
          <HelloWave />
        </ThemedView>
      </FadeInView>

      <FadeInView delay={200}>
        <ThemedView style={styles.formContainer}>
          {/* Categoría */}
          <LabeledDropdown
            label="Categoría"
            required
            options={categorias.map((cat) => ({
              label: cat.nombre,
              value: cat._id,
            }))}
            selectedValue={cotizacion.categoria}
            onSelect={handleCategoriaChange}
            placeholder="Seleccionar categoría..."
            loading={categoriasLoading}
            error={categoriasError}
          />

          {/* Marca */}
          <EditableDropdown
            label="Marca"
            required
            options={marcas}
            selectedValue={cotizacion.marca}
            onSelect={handleMarcaChange}
            placeholder="Seleccionar o escribir marca..."
            loading={marcasLoading}
            error={marcasError}
            disabled={!cotizacion.categoria}
          />

          {/* Modelo */}
          <ModeloDropdown
            label="Modelo"
            required
            productos={productos}
            selectedValue={cotizacion.modelo}
            onSelect={handleModeloChange}
            placeholder="Seleccionar modelo..."
            loading={productosLoading}
            error={productosError}
            disabled={!cotizacion.marca}
          />

          {/* Detalle */}
          <ReadOnlyField
            label="Detalle del Producto"
            icon="📝"
            value={cotizacion.detalle}
            placeholder="Selecciona un modelo para ver los detalles"
          />

          {/* Valor Real */}
          <AnimatedInput
            label="Valor Inicial"
            icon="💰"
            required
            value={cotizacion.valorReal}
            onChangeText={(text) =>
              setCotizacion({ ...cotizacion, valorReal: text })
            }
            placeholder="Se autocompletará al seleccionar modelo"
            keyboardType="numeric"
          />

          {/* Porcentaje */}
          <AnimatedInput
            label="Porcentaje Aplicado (0-100)"
            icon="📊"
            required
            value={cotizacion.porcentajeAplicado}
            onChangeText={(text) =>
              setCotizacion({ ...cotizacion, porcentajeAplicado: text })
            }
            placeholder="Ej: 10"
            keyboardType="numeric"
          />

          {/* Botones */}
          <ThemedView style={styles.buttonContainer}>
            <AnimatedButton
              title="Generar Cotización"
              icon="✨"
              onPress={generarMensajeFinal}
              variant="primary"
              size="large"
            />

            <AnimatedButton
              title="Limpiar"
              icon="🗑️"
              onPress={limpiarFormulario}
              variant="secondary"
              size="medium"
              style={{ marginTop: SPACING.sm }}
            />
          </ThemedView>
        </ThemedView>
      </FadeInView>

      {/* Modal para mostrar la cotización */}
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
                  ✨ Cotización Generada
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
                  {mensajeFinal}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.modalButtonContainer}>
                <AnimatedButton
                  title="Copiar al Portapapeles"
                  icon="📋"
                  onPress={copiarAlPortapapeles}
                  variant="accent"
                  size="large"
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
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  inputGroup: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    ...SHADOWS.sm,
  },
  buttonContainer: {
    gap: SPACING.md,
    marginTop: SPACING.md,
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
