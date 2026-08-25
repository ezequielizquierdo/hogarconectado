import { Image } from "expo-image";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  View,
  useWindowDimensions,
  SafeAreaView,
  Text,
  Linking,
} from "react-native";
import React, { useState, useRef } from "react";
import * as Clipboard from "expo-clipboard";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { HelloWave } from "@/components/HelloWave";
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
import { useCalculoPrecios } from "@/hooks/useCalculoPrecios";
import { COLORS, SPACING, RADIUS, SHADOWS } from "@/constants/theme";
import { Producto } from "@/services/types";
import { cotizacionesService } from "@/services";

interface CotizacionData {
  categoria: string;
  marca: string;
  modelo: string;
  detalle: string;
  valorReal: string;
  porcentajeAplicado: string;
  cantidad: string;
  modalidadPago: "contado" | "3-cuotas" | "6-cuotas";
  clienteNombre: string;
  clienteTelefono: string;
}

interface CalculosResultado {
  valorConGanancia: number;
  valorPorCuota3: number;
  valorPorCuota6: number;
  totalCuotas3: number;
  totalCuotas6: number;
  valorFacturado: number;
}

export default function HomeScreen() {
  // Constantes para layout responsivo
  const isWeb = Platform.OS === "web";
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isWideScreen = screenWidth >= 1024;

  const {
    categorias,
    loading: categoriasLoading,
    error: categoriasError,
    recargar: recargarCategorias,
  } = useCategorias();

  const [cotizacion, setCotizacion] = useState<CotizacionData>({
    categoria: "",
    marca: "",
    modelo: "",
    detalle: "",
    valorReal: "",
    porcentajeAplicado: "10",
    cantidad: "1",
    modalidadPago: "contado",
    clienteNombre: "",
    clienteTelefono: "",
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
  const [imagenGenerada, setImagenGenerada] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [guardandoCotizacion, setGuardandoCotizacion] = useState(false);
  const [cotizacionGuardadaId, setCotizacionGuardadaId] = useState<string | null>(null);

  // Referencia para capturar la vista de cotización
  const cotizacionViewRef = useRef<View>(null);

  const obtenerEntradasCalculo = () => {
    const valorLimpio = cotizacion.valorReal.replace(/[^\d]/g, "");
    const valorReal = parseFloat(valorLimpio);
    const porcentaje = parseFloat(cotizacion.porcentajeAplicado);
    return {
      valorReal: Number.isFinite(valorReal) ? valorReal : null,
      porcentaje: Number.isFinite(porcentaje) ? porcentaje : null,
    };
  };

  const entradasCalculo = obtenerEntradasCalculo();
  const {
    data: preciosCalculados,
    loading: calculandoPrecios,
    error: errorCalculo,
  } = useCalculoPrecios(entradasCalculo.valorReal, entradasCalculo.porcentaje);
  const calculos: CalculosResultado | null = preciosCalculados
    ? {
        valorConGanancia: preciosCalculados.efectivo,
        valorPorCuota3: preciosCalculados.tresCuotas.cuota,
        valorPorCuota6: preciosCalculados.seisCuotas.cuota,
        totalCuotas3: preciosCalculados.tresCuotas.total,
        totalCuotas6: preciosCalculados.seisCuotas.total,
        valorFacturado: preciosCalculados.factura.unPago,
      }
    : null;

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

  const categoriaNombre =
    categorias.find((categoria) => categoria._id === cotizacion.categoria)?.nombre || "";
  const cantidadSeleccionada = Math.max(1, Number.parseInt(cotizacion.cantidad, 10) || 1);
  const modalidadLabel = cotizacion.modalidadPago === "3-cuotas"
    ? "3 cuotas"
    : cotizacion.modalidadPago === "6-cuotas"
      ? "6 cuotas"
      : "Contado";
  const precioUnitarioSeleccionado = calculos
    ? cotizacion.modalidadPago === "3-cuotas"
      ? calculos.totalCuotas3
      : cotizacion.modalidadPago === "6-cuotas"
        ? calculos.totalCuotas6
        : calculos.valorConGanancia
    : 0;
  const totalSeleccionado = precioUnitarioSeleccionado * cantidadSeleccionada;
  const cuotaSeleccionada = calculos
    ? cotizacion.modalidadPago === "3-cuotas"
      ? calculos.valorPorCuota3 * cantidadSeleccionada
      : cotizacion.modalidadPago === "6-cuotas"
        ? calculos.valorPorCuota6 * cantidadSeleccionada
        : null
    : null;

  const resumenCondicionElegida = calculos
    ? cotizacion.modalidadPago === "3-cuotas"
      ? `3 cuotas de ${formatearPrecio(cuotaSeleccionada || 0)}\nTotal financiado: ${formatearPrecio(totalSeleccionado)}`
      : cotizacion.modalidadPago === "6-cuotas"
        ? `6 cuotas de ${formatearPrecio(cuotaSeleccionada || 0)}\nTotal financiado: ${formatearPrecio(totalSeleccionado)}`
        : `Precio contado: ${formatearPrecio(totalSeleccionado)}`
    : "";

  const generarMensajeFinal = () => {
    const cantidad = Number.parseInt(cotizacion.cantidad, 10);
    const errors: Record<string, string> = {};
    if (!cotizacion.categoria) errors.categoria = "Seleccioná una categoría.";
    if (!cotizacion.marca) errors.marca = "Seleccioná o escribí una marca.";
    if (!cotizacion.modelo) errors.modelo = "Seleccioná un modelo.";
    if (!cotizacion.valorReal) errors.valorReal = "Ingresá el valor inicial.";
    if (!Number.isInteger(cantidad) || cantidad < 1) errors.cantidad = "La cantidad debe ser al menos 1.";
    if (!cotizacion.clienteNombre.trim()) errors.clienteNombre = "Ingresá el nombre del cliente.";
    if (cotizacion.clienteTelefono.replace(/\D/g, "").length < 8) errors.clienteTelefono = "Ingresá un teléfono válido.";
    const porcentaje = Number(cotizacion.porcentajeAplicado.replace(",", "."));
    if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje > 100) errors.porcentajeAplicado = "Ingresá un porcentaje entre 0 y 100.";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!calculos) {
      Alert.alert(
        "No se pudo calcular",
        errorCalculo || "Completá los valores y esperá a que termine el cálculo."
      );
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

*Cotización para ${cotizacion.clienteNombre.trim()}*
📦 ${categoriaNombre.toUpperCase()}
🏷️ ${cotizacion.marca.toUpperCase()} - ${cotizacion.modelo.toUpperCase()}
🔢 Cantidad: ${cantidad}
✏️ ${cotizacion.detalle ? `${cotizacion.detalle.toUpperCase()}` : ""}

💰 *${resumenCondicionElegida.replace("\n", "*\n*")}*

📞 ¡Consultá por stock y disponibilidad!`;

    setMensajeFinal(mensaje);
    setCotizacionGuardadaId(null);

    // Generar imagen automáticamente
    setTimeout(async () => {
      try {
        if (cotizacionViewRef.current) {
          const uri = await captureRef(cotizacionViewRef.current, {
            format: "png",
            quality: 1.0,
            width: 1080,
            height: 1920,
          });
          setImagenGenerada(uri);
        }
      } catch (error) {
        console.error("Error al generar imagen automáticamente:", error);
      }
    }, 500); // Esperar un poco para que se renderice la vista

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

  const abrirWhatsApp = async () => {
    if (!mensajeFinal) return;
    const telefono = cotizacion.clienteTelefono.replace(/\D/g, "");
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeFinal)}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error abriendo WhatsApp:", error);
      Alert.alert("No pudimos abrir WhatsApp", "Podés copiar el texto y pegarlo manualmente.");
    }
  };

  const copiarImagen = async () => {
    if (imagenGenerada) {
      try {
        await Sharing.shareAsync(imagenGenerada, {
          mimeType: "image/png",
          dialogTitle: "Compartir imagen de cotización",
        });
      } catch (error) {
        console.error("Error al copiar imagen:", error);
        Alert.alert("Error", "No se pudo compartir la imagen");
      }
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setImagenGenerada(null); // Limpiar imagen al cerrar
  };

  const limpiarFormulario = () => {
    setCotizacion({
      categoria: "",
      marca: "",
      modelo: "",
      detalle: "",
      valorReal: "",
      porcentajeAplicado: "10",
      cantidad: "1",
      modalidadPago: "contado",
      clienteNombre: "",
      clienteTelefono: "",
    });
    setMostrarVistaPrevia(false);
    setProductoSeleccionado(null);
    setFormErrors({});
    setCotizacionGuardadaId(null);
  };

  const guardarCotizacion = async () => {
    if (!productoSeleccionado || cotizacionGuardadaId || guardandoCotizacion) return;
    setGuardandoCotizacion(true);
    try {
      const guardada = await cotizacionesService.crearCotizacion({
        datosContacto: {
          nombre: cotizacion.clienteNombre.trim(),
          telefono: cotizacion.clienteTelefono.trim(),
        },
        productos: [{
          producto: productoSeleccionado._id,
          cantidad: Number.parseInt(cotizacion.cantidad, 10),
          porcentajeAplicado: Number(cotizacion.porcentajeAplicado.replace(",", ".")),
        }],
        modalidadPago: cotizacion.modalidadPago,
        observaciones: cotizacion.detalle || undefined,
      });
      setCotizacionGuardadaId(guardada._id);
    } catch (error) {
      console.error("Error guardando cotización:", error);
      Alert.alert("No pudimos guardar", "La vista previa sigue disponible. Intentá nuevamente.");
    } finally {
      setGuardandoCotizacion(false);
    }
  };

  const invalidarVistaPrevia = () => {
    setMostrarVistaPrevia(false);
    setModalVisible(false);
    setMensajeFinal("");
    setImagenGenerada(null);
    setCotizacionGuardadaId(null);
  };

  const handleCategoriaChange = (categoria: string) => {
    invalidarVistaPrevia();
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
    invalidarVistaPrevia();
    setCotizacion({
      ...cotizacion,
      marca: marca,
      modelo: "", // Reset modelo cuando cambia marca
      detalle: "", // Reset detalle
      valorReal: "", // Reset valor
    });
  };

  const handleModeloChange = (modelo: string, producto: Producto) => {
    invalidarVistaPrevia();
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
    invalidarVistaPrevia();
    const valorFormateado = formatearPrecioInput(text);
    setCotizacion({ ...cotizacion, valorReal: valorFormateado });
    if (formErrors.valorReal) setFormErrors((current) => ({ ...current, valorReal: "" }));
  };

  const updateCotizacionField = <K extends keyof CotizacionData>(
    field: K,
    value: CotizacionData[K]
  ) => {
    invalidarVistaPrevia();
    setCotizacion((current) => ({ ...current, [field]: value }));
    if (formErrors[field]) setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const quoteDetailsFields = (
    <View style={styles.quoteDetailsSection}>
      <ThemedText style={styles.quoteDetailsTitle}>Datos de la cotización</ThemedText>
      <ThemedText style={styles.quoteDetailsHint}>
        Se guardarán junto con una instantánea de los precios utilizados.
      </ThemedText>
      <AnimatedInput
        label="Nombre del cliente"
        required
        value={cotizacion.clienteNombre}
        onChangeText={(value) => updateCotizacionField("clienteNombre", value)}
        placeholder="Nombre y apellido"
        error={formErrors.clienteNombre}
      />
      <AnimatedInput
        label="Teléfono"
        required
        value={cotizacion.clienteTelefono}
        onChangeText={(value) => updateCotizacionField("clienteTelefono", value)}
        placeholder="Ej: 11 2345 6789"
        keyboardType="phone-pad"
        error={formErrors.clienteTelefono}
      />
      <AnimatedInput
        label="Cantidad"
        required
        value={cotizacion.cantidad}
        onChangeText={(value) => updateCotizacionField("cantidad", value.replace(/\D/g, ""))}
        placeholder="1"
        keyboardType="numeric"
        error={formErrors.cantidad}
      />
      <LabeledDropdown
        label="Modalidad elegida"
        required
        options={[
          { label: "Contado", value: "contado" },
          { label: "3 cuotas", value: "3-cuotas" },
          { label: "6 cuotas", value: "6-cuotas" },
        ]}
        selectedValue={cotizacion.modalidadPago}
        onSelect={(value) => {
          if (value === "contado" || value === "3-cuotas" || value === "6-cuotas") {
            updateCotizacionField("modalidadPago", value);
          }
        }}
      />
    </View>
  );

  return (
    <>
      {isWeb && isWideScreen ? (
        // Layout para web con vista previa
        <SafeAreaView style={[styles.webLayoutFullHeight, { height: screenHeight }]}>
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
                      error={formErrors.categoria || categoriasError}
                      onRetry={recargarCategorias}
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
                      error={formErrors.marca || marcasError}
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
                      error={formErrors.modelo || productosError}
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
                      error={formErrors.valorReal}
                    />

                    {/* Porcentaje */}
                    <AnimatedInput
                      label="Porcentaje Aplicado (0-100)"
                      required
                      value={cotizacion.porcentajeAplicado}
                      onChangeText={(text) => updateCotizacionField("porcentajeAplicado", text)}
                      placeholder="Ej: 10"
                      keyboardType="numeric"
                      error={formErrors.porcentajeAplicado}
                    />

                    {quoteDetailsFields}

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
                          !cotizacion.porcentajeAplicado ||
                          calculandoPrecios ||
                          !calculos
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
                  <ScrollView
                    style={[
                      styles.webPreviewContainer,
                      { maxHeight: Math.max(420, screenHeight - 210) },
                    ]}
                    contentContainerStyle={styles.webPreviewContent}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled
                  >
                    <ThemedView style={styles.webPreviewHeader}>
                      <ThemedText type="subtitle">Vista Previa</ThemedText>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Cerrar vista previa de la cotización"
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

                    {/* Condición comercial elegida */}
                    <ThemedView style={styles.webPriceContainer}>
                      <ThemedText type="subtitle" style={styles.webPriceTitle}>
                        💰 Precio cotizado
                      </ThemedText>

                      <ThemedView style={styles.selectedConditionCard}>
                        <ThemedText style={styles.selectedConditionLabel}>
                          {modalidadLabel} · {cantidadSeleccionada} unidad{cantidadSeleccionada === 1 ? "" : "es"}
                        </ThemedText>
                        {cuotaSeleccionada && (
                          <ThemedText style={styles.selectedInstallmentValue}>
                            {cotizacion.modalidadPago === "3-cuotas" ? "3" : "6"} cuotas de {formatearPrecio(cuotaSeleccionada)}
                          </ThemedText>
                        )}
                        <ThemedText style={styles.selectedConditionTotal}>
                          {formatearPrecio(totalSeleccionado)}
                        </ThemedText>
                        <ThemedText style={styles.selectedConditionCaption}>
                          {cuotaSeleccionada ? "Total financiado" : "Total contado"}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.whatsAppPreviewCard}>
                      <ThemedText type="defaultSemiBold" style={styles.whatsAppPreviewTitle}>
                        Vista previa para WhatsApp
                      </ThemedText>
                      <ThemedText style={styles.whatsAppPreviewText}>
                        {mensajeFinal}
                      </ThemedText>
                      <ThemedView style={styles.whatsAppActions}>
                        <AnimatedButton
                          title="Copiar texto"
                          icon="📋"
                          onPress={copiarAlPortapapeles}
                          variant="accent"
                          size="medium"
                        />
                        <AnimatedButton
                          title={isWeb ? "Abrir WhatsApp Web" : "Abrir WhatsApp"}
                          icon="💬"
                          onPress={abrirWhatsApp}
                          variant="secondary"
                          size="medium"
                        />
                      </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.webPreviewActions}>
                      <AnimatedButton
                        title={cotizacionGuardadaId ? "Cotización guardada" : "Guardar cotización"}
                        icon={cotizacionGuardadaId ? "✓" : "💾"}
                        onPress={guardarCotizacion}
                        variant="primary"
                        size="medium"
                        loading={guardandoCotizacion}
                        disabled={Boolean(cotizacionGuardadaId)}
                      />
                      {cotizacionGuardadaId && (
                        <ThemedText accessibilityLiveRegion="polite" style={styles.savedQuoteMessage}>
                          Guardada correctamente · referencia {cotizacionGuardadaId.slice(-6).toUpperCase()}
                        </ThemedText>
                      )}
                    </ThemedView>
                  </ScrollView>
                </FadeInView>
              ) : (
                <ThemedView style={styles.webPreviewPlaceholder}>
                  <Image
                    source={require("@/assets/images/logo-transparent.png")}
                    style={styles.webPreviewLogo}
                    contentFit="contain"
                  />
                  <ThemedText style={styles.webPreviewPlaceholderText}>
                    📋 Completa el formulario y haz clic en &quot;Generar Cotización&quot;
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
                  error={formErrors.categoria || categoriasError}
                  onRetry={recargarCategorias}
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
                  error={formErrors.marca || marcasError}
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
                  error={formErrors.modelo || productosError}
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
                  error={formErrors.valorReal}
                />

                {/* Porcentaje */}
                <AnimatedInput
                  label="Porcentaje Aplicado (0-100)"
                  required
                  value={cotizacion.porcentajeAplicado}
                  onChangeText={(text) => updateCotizacionField("porcentajeAplicado", text)}
                  placeholder="Ej: 10"
                  keyboardType="numeric"
                  error={formErrors.porcentajeAplicado}
                />

                {quoteDetailsFields}

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
                      !cotizacion.porcentajeAplicado ||
                      calculandoPrecios ||
                      !calculos
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
                      accessibilityRole="button"
                      accessibilityLabel="Cerrar cotización generada"
                      style={styles.closeButton}
                      onPress={cerrarModal}
                    >
                      <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>

                  {/* Sección de Cotización de Texto */}
                  <ThemedView style={styles.modalSection}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.sectionTitle}
                    >
                      📋 Cotización de Texto
                    </ThemedText>
                    <ThemedView style={styles.modalMessageContainer}>
                      <ThemedText style={styles.modalMessageText}>
                        {mensajeFinal}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.modalButtonContainer}>
                      <AnimatedButton
                        title="Copiar Texto"
                        icon="📋"
                        onPress={copiarAlPortapapeles}
                        variant="accent"
                        size="medium"
                      />
                      <AnimatedButton
                        title="Abrir WhatsApp"
                        icon="💬"
                        onPress={abrirWhatsApp}
                        variant="secondary"
                        size="medium"
                        style={{ marginTop: SPACING.sm }}
                      />
                    </ThemedView>
                    <ThemedView style={styles.modalButtonContainer}>
                      <AnimatedButton
                        title={cotizacionGuardadaId ? "Cotización guardada" : "Guardar cotización"}
                        icon={cotizacionGuardadaId ? "✓" : "💾"}
                        onPress={guardarCotizacion}
                        variant="primary"
                        size="medium"
                        loading={guardandoCotizacion}
                        disabled={Boolean(cotizacionGuardadaId)}
                      />
                      {cotizacionGuardadaId && (
                        <ThemedText accessibilityLiveRegion="polite" style={styles.savedQuoteMessage}>
                          Guardada correctamente · referencia {cotizacionGuardadaId.slice(-6).toUpperCase()}
                        </ThemedText>
                      )}
                    </ThemedView>
                  </ThemedView>

                  {/* Sección de Imagen */}
                  <ThemedView style={styles.modalSection}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.sectionTitle}
                    >
                      🖼️ Imagen de Cotización
                    </ThemedText>
                    {imagenGenerada ? (
                      <ThemedView style={styles.imagePreviewContainer}>
                        <Image
                          source={{ uri: imagenGenerada }}
                          style={styles.imagePreview}
                          contentFit="contain"
                        />
                        <ThemedView style={styles.modalButtonContainer}>
                          <AnimatedButton
                            title="Compartir Imagen"
                            icon="📤"
                            onPress={copiarImagen}
                            variant="primary"
                            size="medium"
                          />
                        </ThemedView>
                      </ThemedView>
                    ) : (
                      <ThemedView style={styles.imageLoadingContainer}>
                        <ThemedText style={styles.imageLoadingText}>
                          Generando imagen...
                        </ThemedText>
                      </ThemedView>
                    )}
                  </ThemedView>
                </ScrollView>
              </ThemedView>
            </ThemedView>
          </Modal>

          {/* Vista invisible para capturar imagen */}
          <View ref={cotizacionViewRef} style={styles.captureView}>
            <View style={styles.captureContainer}>
              {/* Header de la imagen */}
              <View style={styles.captureHeader}>
                <Text style={styles.captureBrand}>🏠 HOGAR CONECTADO</Text>
                <Text style={styles.captureTitle}>COTIZACIÓN</Text>
              </View>

              {/* Contenido de la cotización */}
              <View style={styles.captureContent}>
                {productoSeleccionado?.imagenes?.[0] && (
                  <View style={styles.captureImageFrame}>
                    <Image
                      source={{ uri: productoSeleccionado.imagenes[0] }}
                      style={styles.captureProductImage}
                      contentFit="contain"
                    />
                  </View>
                )}
                <Text style={styles.captureCustomer}>
                  PREPARADA PARA {cotizacion.clienteNombre.trim().toUpperCase()}
                </Text>
                <Text style={styles.captureCategory}>
                  📦 {categoriaNombre.toUpperCase()}
                </Text>
                <Text style={styles.captureProduct}>
                  🏷️ {cotizacion.marca.toUpperCase()} -{" "}
                  {cotizacion.modelo.toUpperCase()}
                </Text>
                <Text style={styles.captureMeta}>
                  CANTIDAD: {cantidadSeleccionada}
                </Text>
                {cotizacion.detalle && (
                  <Text style={styles.captureDetail}>
                    ✏️ {cotizacion.detalle.toUpperCase()}
                  </Text>
                )}

                <View style={styles.capturePrices}>
                  <Text style={styles.capturePricesTitle}>💰 PRECIO COTIZADO:</Text>
                  {(() => {
                    if (calculos) {
                      return (
                        <>
                          {cuotaSeleccionada && (
                            <Text style={styles.capturePrice}>
                              {cotizacion.modalidadPago === "3-cuotas" ? "3" : "6"} CUOTAS DE {formatearPrecio(cuotaSeleccionada)}
                            </Text>
                          )}
                          <Text style={styles.captureSelectedTotal}>
                            ✅ {modalidadLabel.toUpperCase()} · {cantidadSeleccionada} UNIDAD{cantidadSeleccionada === 1 ? "" : "ES"}
                            {"\n"}{formatearPrecio(totalSeleccionado)}
                          </Text>
                        </>
                      );
                    }
                    return null;
                  })()}
                </View>

                <Text style={styles.captureContact}>
                  📞 ¡Consultá por stock y disponibilidad!
                </Text>
              </View>
            </View>
          </View>
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
  quoteDetailsSection: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quoteDetailsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  quoteDetailsHint: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
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
    minHeight: 0,
  },
  webPreviewContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  webPreviewContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
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
  selectedConditionCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: SPACING.xs,
  },
  selectedConditionLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  selectedConditionTotal: {
    color: COLORS.primaryDark,
    fontSize: 20,
    fontWeight: "700",
  },
  selectedInstallmentValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  selectedConditionCaption: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  whatsAppPreviewCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.secondaryDark,
    backgroundColor: "#f4fff8",
    gap: SPACING.sm,
  },
  whatsAppPreviewTitle: {
    color: COLORS.text,
    fontSize: 15,
  },
  whatsAppPreviewText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  whatsAppActions: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  savedQuoteMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: SPACING.xs,
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
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
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
  modalSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
  },
  imagePreviewContainer: {
    padding: SPACING.lg,
    alignItems: "center",
  },
  imagePreview: {
    width: 200,
    height: 280,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardBackground,
    marginBottom: SPACING.md,
  },
  imageLoadingContainer: {
    padding: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
    height: 150,
  },
  imageLoadingText: {
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  // Estilos para captura de imagen
  captureView: {
    position: "absolute",
    left: -9999, // Ocultar fuera de la pantalla
    top: -9999,
    width: 1080,
    height: 1920,
  },
  captureContainer: {
    width: 1080,
    height: 1920,
    backgroundColor: "#ffffff",
    padding: 60,
    justifyContent: "center",
  },
  captureHeader: {
    alignItems: "center",
    marginBottom: 80,
  },
  captureBrand: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4a5568",
    marginBottom: 20,
  },
  captureTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#a8b5ff",
  },
  captureContent: {
    gap: 40,
  },
  captureImageFrame: {
    width: "100%",
    height: 520,
    padding: 30,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  captureProductImage: {
    width: "100%",
    height: "100%",
  },
  captureCustomer: {
    fontSize: 22,
    fontWeight: "600",
    color: "#718096",
    letterSpacing: 1,
  },
  captureCategory: {
    fontSize: 32,
    fontWeight: "600",
    color: "#4a5568",
  },
  captureProduct: {
    fontSize: 28,
    fontWeight: "600",
    color: "#4a5568",
  },
  captureMeta: {
    fontSize: 22,
    fontWeight: "600",
    color: "#718096",
  },
  captureDetail: {
    fontSize: 24,
    color: "#718096",
  },
  capturePrices: {
    gap: 20,
    backgroundColor: "#f8faff",
    padding: 40,
    borderRadius: 20,
  },
  capturePricesTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4a5568",
    marginBottom: 20,
  },
  capturePrice: {
    fontSize: 28,
    fontWeight: "600",
    color: "#4a5568",
  },
  captureSelectedTotal: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#8b99e8",
    marginTop: 20,
  },
  captureContact: {
    fontSize: 24,
    fontWeight: "600",
    color: "#a8b5ff",
    textAlign: "center",
  },
});
