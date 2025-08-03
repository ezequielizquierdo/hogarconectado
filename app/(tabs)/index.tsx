import { Image } from "expo-image";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  View,
  Dimensions,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import * as Clipboard from "expo-clipboard";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import MobileHeader from "@/components/MobileHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Header from "@/components/layout/Header";
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

// Componente de imagen que maneja conversión automática para web con manejo de errores mejorado
const SmartImage: React.FC<{
  source: { uri: string };
  style: any;
  onError?: (error: any) => void;
  onLoad?: () => void;
}> = ({ source, style, onError, onLoad }) => {
  const [imageUri, setImageUri] = useState(source.uri);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(false);

      try {
        // Para web, usar la URL directamente
        if (Platform.OS === "web") {
          setImageUri(source.uri);
        } else {
          setImageUri(source.uri);
        }
      } catch (error) {
        console.error("Error al procesar imagen:", error);
        setError(true);
        setImageUri(source.uri); // Fallback
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [source.uri]);

  const handleImageError = (errorEvent: any) => {
    console.error("Error al cargar imagen:", errorEvent);
    setError(true);
    if (onError) {
      onError(errorEvent);
    }
  };

  const handleImageLoad = () => {
    setError(false);
    if (onLoad) {
      onLoad();
    }
  };

  if (loading) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: COLORS.surface,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: RADIUS.md,
          },
        ]}
      >
        <ThemedText style={{ fontSize: 28, color: COLORS.textSecondary }}>
          📷
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: COLORS.surface,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.border,
          },
        ]}
      >
        <ThemedText style={{ fontSize: 20, color: COLORS.textSecondary }}>
          ❌
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 10,
            color: COLORS.textSecondary,
            textAlign: "center",
          }}
        >
          Error cargando imagen
        </ThemedText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={style}
      onError={handleImageError}
      onLoad={handleImageLoad}
      contentFit="contain"
    />
  );
};

export default function HomeScreen() {
  // Constantes para layout responsivo
  const isWeb = Platform.OS === "web";
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const isWideScreen = screenWidth >= 1024;

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
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Factores de recargo basados en el análisis del Excel
  const FACTOR_3_CUOTAS = 1.1298;
  const FACTOR_6_CUOTAS = 1.2138;

  const calcularCotizacion = (): CalculosResultado | null => {
    const valorLimpio = limpiarValorMoneda(cotizacion.valorReal);
    const valorReal = parseFloat(valorLimpio);
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

  const formatearPrecioInput = (valor: string): string => {
    // Remover todo excepto números
    const numeroLimpio = valor.replace(/[^\d]/g, "");
    if (!numeroLimpio) return "";

    // Convertir a número y formatear
    const numero = parseInt(numeroLimpio);
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numero);
  };

  const limpiarValorMoneda = (valorFormateado: string): string => {
    // Remover símbolo de moneda y espacios, mantener solo números
    return valorFormateado.replace(/[^\d]/g, "");
  };

  const generarMensajeFinal = () => {
    const calculos = calcularCotizacion();
    if (!calculos) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos");
      return;
    }

    // Buscar el producto que coincida con la cotización
    const producto = productos.find(
      (p) =>
        p.marca.toLowerCase() === cotizacion.marca.toLowerCase() &&
        p.modelo.toLowerCase() === cotizacion.modelo.toLowerCase()
    );

    if (producto) {
      setProductoSeleccionado(producto);
    }

    // Mostrar vista previa en diseño web
    if (isWeb && isWideScreen) {
      setMostrarVistaPrevia(true);
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

    // En móvil mostrar modal, en web ya se muestra la vista previa
    if (!isWeb || !isWideScreen) {
      setModalVisible(true);
    }
  };

  const copiarAlPortapapeles = async () => {
    if (mensajeFinal) {
      await Clipboard.setStringAsync(mensajeFinal);
      Alert.alert("Copiado", "La cotización ha sido copiada al portapapeles");
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
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
    setMostrarVistaPrevia(false);
    setProductoSeleccionado(null);
  };

  const handleCategoriaChange = (categoria: string) => {
    setCotizacion({
      ...cotizacion,
      categoria: categoria,
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
    const precioFormateado = producto.precioBase
      ? formatearPrecioInput(producto.precioBase.toString())
      : "";

    setCotizacion({
      ...cotizacion,
      modelo: modelo,
      detalle: producto.descripcion || "",
      valorReal: precioFormateado,
    });
  };

  const handleValorRealChange = (text: string) => {
    const valorFormateado = formatearPrecioInput(text);
    setCotizacion({ ...cotizacion, valorReal: valorFormateado });
  };

  const calculos = calcularCotizacion();

  return (
    <>
      {isWeb && isWideScreen ? (
        // Layout para web con vista previa
        <SafeAreaView style={styles.webLayoutFullHeight}>
          {/* Header reutilizable */}
          <Header
            sectionTitle="Cotizaciones"
            sectionSubtitle="Calculadora de precios"
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
                      value={cotizacion.detalle}
                      placeholder="Selecciona un modelo para ver los detalles"
                    />

                    {/* Valor Real */}
                    <AnimatedInput
                      label="Valor Inicial"
                      required
                      value={cotizacion.valorReal}
                      onChangeText={handleValorRealChange}
                      placeholder="Se autocompletará al seleccionar modelo"
                      keyboardType="numeric"
                    />

                    {/* Porcentaje */}
                    <AnimatedInput
                      label="Porcentaje Aplicado (0-100)"
                      required
                      value={cotizacion.porcentajeAplicado}
                      onChangeText={(text) =>
                        setCotizacion({
                          ...cotizacion,
                          porcentajeAplicado: text,
                        })
                      }
                      placeholder="Ej: 10"
                      keyboardType="numeric"
                    />

                    {/* Botones */}
                    <ThemedView style={styles.webButtonContainer}>
                      <AnimatedButton
                        title="Generar Cotización"
                        icon="✨"
                        onPress={generarMensajeFinal}
                        variant="primary"
                        size="medium"
                        disabled={
                          !cotizacion.categoria ||
                          !cotizacion.marca ||
                          !cotizacion.modelo ||
                          !cotizacion.valorReal ||
                          !cotizacion.porcentajeAplicado
                        }
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
              {mostrarVistaPrevia && calculos ? (
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
                      <ThemedView
                        style={{
                          backgroundColor: COLORS.cardBackground,
                          borderRadius: RADIUS.md,
                          padding: SPACING.sm,
                          marginBottom: SPACING.md,
                          gap: SPACING.sm,
                        }}
                      >
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
                              style={{
                                width: "100%",
                                height: 100,
                                borderRadius: RADIUS.sm,
                              }}
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
                        <ThemedView style={{ gap: SPACING.xs }}>
                          <ThemedText
                            type="defaultSemiBold"
                            style={{
                              color: COLORS.primary,
                              fontSize: 14,
                            }}
                          >
                            {productoSeleccionado.marca}
                          </ThemedText>
                          <ThemedText
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                            }}
                          >
                            {productoSeleccionado.modelo}
                          </ThemedText>
                          {productoSeleccionado.descripcion && (
                            <ThemedText
                              style={{
                                fontSize: 11,
                                color: COLORS.textSecondary,
                                lineHeight: 14,
                              }}
                            >
                              {productoSeleccionado.descripcion}
                            </ThemedText>
                          )}
                        </ThemedView>
                      </ThemedView>
                    )}

                    {/* Precios calculados */}
                    <ThemedView style={styles.webPriceContainer}>
                      <ThemedText type="subtitle" style={styles.webPriceTitle}>
                        💰 Precios Calculados
                      </ThemedText>

                      <ThemedView style={styles.webPriceItem}>
                        <ThemedText style={styles.webPriceLabel}>
                          💵 Contado:
                        </ThemedText>
                        <ThemedText style={styles.webPriceValue}>
                          {formatearPrecio(calculos.valorConGanancia)}
                        </ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.webPriceItem}>
                        <ThemedText style={styles.webPriceLabel}>
                          🗓️ 3 Cuotas:
                        </ThemedText>
                        <ThemedText style={styles.webPriceValue}>
                          {formatearPrecio(calculos.valorPorCuota3)} c/u
                        </ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.webPriceItem}>
                        <ThemedText style={styles.webPriceLabel}>
                          🗓️ 6 Cuotas:
                        </ThemedText>
                        <ThemedText style={styles.webPriceValue}>
                          {formatearPrecio(calculos.valorPorCuota6)} c/u
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>

                    {/* Botón para copiar */}
                    <ThemedView style={styles.webPreviewActions}>
                      <AnimatedButton
                        title="Copiar al Portapapeles"
                        icon="📋"
                        onPress={copiarAlPortapapeles}
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
                    📋 Completa el formulario y haz clic en "Generar Cotización"
                    para ver la vista previa del producto y precios calculados.
                  </ThemedText>
                </ThemedView>
              )}
            </View>
          </View>
        </SafeAreaView>
      ) : (
        // Layout móvil con nuevo header reutilizable
        <View style={styles.mobileLayout}>
          <MobileHeader
            title="Calculadora"
            subtitle="Cotizaciones de productos"
          />

          <ScrollView style={styles.mobileContent}>
            <FadeInView delay={0}>
              <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">
                  Calculadora de Cotizaciones
                </ThemedText>
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
                  value={cotizacion.detalle}
                  placeholder="Selecciona un modelo para ver los detalles"
                />

                {/* Valor Real */}
                <AnimatedInput
                  label="Valor Inicial"
                  required
                  value={cotizacion.valorReal}
                  onChangeText={handleValorRealChange}
                  placeholder="Se autocompletará al seleccionar modelo"
                  keyboardType="numeric"
                />

                {/* Porcentaje */}
                <AnimatedInput
                  label="Porcentaje Aplicado (0-100)"
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
                    disabled={
                      !cotizacion.categoria ||
                      !cotizacion.marca ||
                      !cotizacion.modelo ||
                      !cotizacion.valorReal ||
                      !cotizacion.porcentajeAplicado
                    }
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
          </ScrollView>

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
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Estilos para layout móvil
  mobileLayout: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mobileContent: {
    flex: 1,
    padding: SPACING.md,
  },
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
    maxHeight: 600, // Reemplazar calc() con valor fijo
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
  webProductBrand: {
    color: COLORS.primary,
    fontSize: 14,
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
  webProductImagePlaceholder: {
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  webProductImageIcon: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  webPriceContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  webPriceTitle: {
    marginBottom: SPACING.sm,
  },
  webPriceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.sm,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.sm,
  },
  webPriceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  webPriceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
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
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    elevation: 8,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  buttonContainer: {
    gap: SPACING.xs,
  },
  logoContainer: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  logoCircle: {
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  logoHeader: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  consultationBox: {
    flex: 1,
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: "#f8f4ff",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: "#e0d4ff",
  },
  consultationTitle: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
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
    flex: 1,
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
    padding: SPACING.lg,
  },
  modalMessageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "monospace",
  },
  modalButtonContainer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
});
