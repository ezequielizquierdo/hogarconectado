import React, { useState } from "react";
import {
  StyleSheet,
  Alert,
  Platform,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
  Dimensions,
  SafeAreaView,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { HelloWave } from "@/components/HelloWave";
import Header from "@/components/layout/Header";
import MobileHeader from "@/components/MobileHeader";
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
  // Constantes para layout responsivo
  const isWeb = Platform.OS === "web";
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const isWideScreen = screenWidth >= 1024;

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
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
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
    setMostrarVistaPrevia(false); // Reset vista previa
  };

  const handleMarcaChange = (marcaSeleccionada: string) => {
    setMarca(marcaSeleccionada);
    setModelo(""); // Reset modelo cuando cambia marca
    setProductoSeleccionado(null); // Reset producto
    setMensajeGenerado(""); // Reset mensaje
    setMostrarVistaPrevia(false); // Reset vista previa
  };

  const handleModeloChange = (modelo: string, producto: Producto) => {
    setModelo(modelo);
    setProductoSeleccionado(producto); // Guardar producto completo
    setMensajeGenerado(""); // Reset mensaje
    setMostrarVistaPrevia(false); // Reset vista previa
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

    // Mostrar vista previa en diseño web
    if (isWeb && isWideScreen) {
      setMostrarVistaPrevia(true);
    } else {
      // En móvil mostrar modal
      setModalVisible(true);
    }
  };

  const copiarConsulta = async () => {
    if (mensajeGenerado) {
      try {
        await Clipboard.setStringAsync(mensajeGenerado);
        Alert.alert("¡Copiado!", "Consulta copiada al portapapeles");
        if (!isWeb || !isWideScreen) {
          setModalVisible(false);
        }
      } catch (error) {
        Alert.alert("Error", "No se pudo copiar la consulta");
      }
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
  };

  const limpiarFormulario = () => {
    setCategoria("");
    setMarca("");
    setModelo("");
    setProductoSeleccionado(null);
    setMensajeGenerado("");
    setMostrarVistaPrevia(false);
  };

  return (
    <>
      {isWeb && isWideScreen ? (
        // Layout para web con vista previa
        <SafeAreaView style={styles.webLayoutFullHeight}>
          {/* Header reutilizable */}
          <Header
            sectionTitle="Consulta Stock"
            sectionSubtitle="Verificar disponibilidad de productos"
          />

          {/* Contenido principal con 2 columnas */}
          <View style={styles.webMainContent}>
            {/* Columna izquierda: Formulario (3/4) */}
            <View style={styles.webFormColumn}>
              <ScrollView
                style={styles.webFormScroll}
                contentContainerStyle={styles.webFormScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <FadeInView delay={0}>
                  <ThemedView style={styles.webFormContainer}>
                    {/* Título del formulario */}
                    <ThemedView style={styles.webFormTitle}>
                      <ThemedText type="subtitle">
                        Datos del Producto
                      </ThemedText>
                    </ThemedView>

                    {/* Categoría */}
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

                    {/* Marca */}
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

                    {/* Modelo */}
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

                    {/* Botones */}
                    <ThemedView style={styles.webButtonContainer}>
                      <AnimatedButton
                        title="Generar Mensaje"
                        icon="✨"
                        onPress={generarConsulta}
                        variant="primary"
                        size="medium"
                        disabled={!categoria || !marca || !modelo}
                      />

                      <AnimatedButton
                        title="Limpiar"
                        icon="🧹"
                        onPress={limpiarFormulario}
                        variant="secondary"
                        size="medium"
                      />
                    </ThemedView>
                  </ThemedView>
                </FadeInView>
              </ScrollView>
            </View>

            {/* Columna derecha: Vista previa (1/4) */}
            <View style={styles.webPreviewColumn}>
              {mostrarVistaPrevia && mensajeGenerado ? (
                <FadeInView delay={300}>
                  <ThemedView style={styles.webPreviewContainer}>
                    <ThemedView style={styles.webPreviewHeader}>
                      <ThemedText type="subtitle">Vista Previa</ThemedText>
                      <TouchableOpacity
                        onPress={() => setMostrarVistaPrevia(false)}
                        style={styles.webPreviewClose}
                      >
                        <ThemedText style={styles.closeButtonText}>
                          ✕
                        </ThemedText>
                      </TouchableOpacity>
                    </ThemedView>

                    {/* Producto seleccionado */}
                    {productoSeleccionado && (
                      <ThemedView style={styles.webProductCard}>
                        {productoSeleccionado.imagenes &&
                        productoSeleccionado.imagenes.length > 0 ? (
                          <View
                            style={{
                              backgroundColor: "#FFFFFF",
                              borderRadius: RADIUS.sm,
                              padding: SPACING.xs,
                              ...SHADOWS.sm,
                            }}
                          >
                            <Image
                              source={{ uri: productoSeleccionado.imagenes[0] }}
                              style={styles.webProductImage}
                              contentFit="contain"
                              onError={(error) => {
                                console.log("Error cargando imagen:", error);
                              }}
                            />
                          </View>
                        ) : (
                          <View
                            style={{
                              width: "100%",
                              height: 100,
                              borderRadius: RADIUS.sm,
                              backgroundColor: "#FFFFFF",
                              justifyContent: "center",
                              alignItems: "center",
                              borderWidth: 1,
                              borderColor: COLORS.border,
                              borderStyle: "dashed",
                              padding: SPACING.xs,
                              ...SHADOWS.sm,
                            }}
                          >
                            <ThemedText
                              style={{
                                fontSize: 24,
                                color: COLORS.textSecondary,
                              }}
                            >
                              📷
                            </ThemedText>
                          </View>
                        )}
                        <ThemedView style={styles.webProductInfo}>
                          <ThemedText style={styles.webProductId}>
                            🆔 ID: {productoSeleccionado._id}
                          </ThemedText>
                          <ThemedText style={styles.webProductBrand}>
                            {productoSeleccionado.marca}
                          </ThemedText>
                          <ThemedText style={styles.webProductModel}>
                            {productoSeleccionado.modelo}
                          </ThemedText>
                          {productoSeleccionado.descripcion && (
                            <ThemedText style={styles.webProductDesc}>
                              {productoSeleccionado.descripcion}
                            </ThemedText>
                          )}
                        </ThemedView>
                      </ThemedView>
                    )}

                    {/* Mensaje generado */}
                    <ThemedView style={styles.webMessageContainer}>
                      <ThemedText
                        type="subtitle"
                        style={styles.webMessageTitle}
                      >
                        📋 Mensaje Generado
                      </ThemedText>
                      <ThemedView style={styles.webMessageContent}>
                        <ThemedText style={styles.webMessageText}>
                          {mensajeGenerado}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>

                    {/* Botón para copiar */}
                    <ThemedView style={styles.webPreviewActions}>
                      <AnimatedButton
                        title="Copiar al Portapapeles"
                        icon="📋"
                        onPress={copiarConsulta}
                        variant="accent"
                        size="medium"
                      />
                    </ThemedView>
                  </ThemedView>
                </FadeInView>
              ) : (
                <ThemedView style={styles.webPreviewPlaceholder}>
                  <Image
                    source={require("@/assets/images/logo-transparent.png")}
                    style={styles.webPreviewLogo}
                    contentFit="contain"
                  />
                  <ThemedText style={styles.webPreviewPlaceholderText}>
                    📦 Completa el formulario y haz clic en "Generar Mensaje"
                    para ver la vista previa de la consulta de stock.
                  </ThemedText>
                </ThemedView>
              )}
            </View>
          </View>
        </SafeAreaView>
      ) : (
        // Layout móvil con MobileHeader como en productos
        <View style={styles.mobileLayout}>
          {/* Header móvil reutilizable */}
          <MobileHeader
            title="Consulta Stock"
            subtitle="Verificar disponibilidad de productos"
          />

          <ScrollView style={styles.mobileContent}>
            <View style={styles.mobileContentWithBackground}>
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
                    size="large"
                    disabled={!categoria || !marca || !modelo}
                  />
                </ThemedView>
              </FadeInView>

              {/* Modal para móvil */}
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
                          📦 Consulta Generada
                        </ThemedText>
                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={cerrarModal}
                        >
                          <ThemedText style={styles.closeButtonText}>
                            ✕
                          </ThemedText>
                        </TouchableOpacity>
                      </ThemedView>

                      <ThemedView style={styles.modalMessageContainer}>
                        <ThemedText style={styles.modalMessageText}>
                          {mensajeGenerado}
                        </ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.modalButtonContainer}>
                        <AnimatedButton
                          title="📋 Copiar Consulta"
                          onPress={copiarConsulta}
                          variant="accent"
                          size="large"
                        />
                      </ThemedView>
                    </ScrollView>
                  </ThemedView>
                </ThemedView>
              </Modal>
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Estilos para layout web
  webLayoutFullHeight: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  webMainContent: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
  },
  webFormColumn: {
    flex: 3,
    backgroundColor: COLORS.background,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  webFormScroll: {
    flex: 1,
  },
  webFormScrollContent: {
    padding: SPACING.md,
    minHeight: "100%",
  },
  webFormContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
    gap: SPACING.sm,
  },
  webFormTitle: {
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  webButtonContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  webPreviewColumn: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
  },
  webPreviewContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    maxHeight: 600,
    overflow: "hidden",
  },
  webPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  webPreviewClose: {
    padding: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cardBackground,
  },
  webProductCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  webProductImage: {
    width: "100%",
    height: 100,
    borderRadius: RADIUS.sm,
  },
  webProductInfo: {
    gap: SPACING.xs,
  },
  webProductId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: "monospace",
  },
  webProductBrand: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  webProductModel: {
    fontSize: 13,
    fontWeight: "600",
  },
  webProductDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  webMessageContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  webMessageTitle: {
    marginBottom: SPACING.sm,
  },
  webMessageContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  webMessageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "monospace",
    color: COLORS.text,
  },
  webPreviewActions: {
    gap: SPACING.sm,
  },
  webPreviewPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
    gap: SPACING.lg,
  },
  webPreviewLogo: {
    width: 60,
    height: 60,
    opacity: 0.3,
  },
  webPreviewPlaceholderText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  // Estilos existentes para móvil
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
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
    padding: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cardBackground,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textSecondary,
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
  // Estilos para layout móvil
  mobileLayout: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mobileContent: {
    flex: 1,
    padding: SPACING.md,
  },
  mobileContentWithBackground: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
});
