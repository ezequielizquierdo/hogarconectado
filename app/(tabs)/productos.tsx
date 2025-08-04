import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
  SafeAreaView,
  Image as RNImage,
  Text,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Header from "@/components/layout/Header";
import MobileHeader from "@/components/MobileHeader";
import LabeledDropdown from "@/components/forms/LabeledDropdown";
import EditableDropdown from "@/components/forms/EditableDropdown";
import AnimatedInput from "@/components/forms/AnimatedInput";
import AnimatedButton from "@/components/ui/AnimatedButton";
import FadeInView from "@/components/ui/FadeInView";
import ProductCard from "@/components/product/ProductCard";
import { SidebarFilters } from "@/components/filters";
import { useCategorias } from "@/hooks/useCategorias";
import { useProductos } from "@/hooks/useProductos";
import { useMarcas } from "@/hooks/useMarcas";
import useDebounce from "@/hooks/useDebounce";
import { productosService } from "@/services";
import { Producto, ProductoConPrecios } from "@/services/types";
import { COLORS, SPACING, RADIUS, SHADOWS } from "@/constants/theme";

// Funciones de utilidad
const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0,00";

  return numPrice.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parsePrice = (formattedPrice: string): number => {
  // Convierte de formato local (1.234,56) a formato numérico (1234.56)
  const numericString = formattedPrice.replace(/\./g, "").replace(",", ".");
  return parseFloat(numericString);
};

const formatModeloToUpperCase = (modelo: string): string => {
  return modelo.toUpperCase().trim();
};

interface ProductoForm {
  marca: string;
  modelo: string;
  descripcion: string;
  categoria: string;
  precioBase: string;
  stockCantidad: string;
  stockDisponible: string;
  imagen: string;
}

const initialForm: ProductoForm = {
  marca: "",
  modelo: "",
  descripcion: "",
  categoria: "",
  precioBase: "",
  stockCantidad: "",
  stockDisponible: "true",
  imagen: "",
};

export default function ProductosScreen() {
  const { categorias, loading: categoriasLoading } = useCategorias();
  const { productos, loading: productosLoading, recargar } = useProductos();
  const {
    marcas,
    loading: marcasLoading,
    recargar: recargarMarcas,
  } = useMarcas();

  const [modalVisible, setModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [instagramModalVisible, setInstagramModalVisible] = useState(false);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [selectedProductForInstagram, setSelectedProductForInstagram] =
    useState<Producto | null>(null);
  const [instagramStoryOptions, setInstagramStoryOptions] = useState({
    showMarca: true,
    showModelo: true,
    showCategoria: true,
    showPrecio: true,
    showStock: false,
    showDescripcion: false,
    showConsultaPrecio: false,
  });
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [form, setForm] = useState<ProductoForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modeloError, setModeloError] = useState<string>("");

  // Referencia para capturar la vista de Instagram Story
  const instagramViewRef = useRef<View>(null);
  const instagramViewRefMobile = useRef<View>(null);

  // Estados para búsqueda y filtros
  const [searchText, setSearchText] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroStock, setFiltroStock] = useState(""); // "disponible", "agotado", ""
  const [vistaDetallada, setVistaDetallada] = useState(false);

  // Debounce search text para evitar búsquedas excesivas
  const debouncedSearchText = useDebounce(searchText, 300);

  // Rate limiting: agregar delay entre operaciones
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Agregar delay entre recarga de datos para evitar rate limiting
      await recargar();
      await delay(500); // 500ms de delay
      await recargarMarcas();
    } catch (error) {
      console.error("Error al refrescar datos:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Función para filtrar productos
  const productosFiltrados = productos.filter((producto) => {
    // Filtro por texto de búsqueda (usando debounced text)
    const categoriaNombre =
      typeof producto.categoria === "string"
        ? producto.categoria
        : producto.categoria.nombre;

    const matchesSearch =
      debouncedSearchText === "" ||
      producto.marca
        .toLowerCase()
        .includes(debouncedSearchText.toLowerCase()) ||
      producto.modelo
        .toLowerCase()
        .includes(debouncedSearchText.toLowerCase()) ||
      (producto.descripcion &&
        producto.descripcion
          .toLowerCase()
          .includes(debouncedSearchText.toLowerCase())) ||
      (categoriaNombre &&
        categoriaNombre
          .toLowerCase()
          .includes(debouncedSearchText.toLowerCase()));

    // Si hay texto de búsqueda, solo aplicar filtro de búsqueda
    if (debouncedSearchText !== "") {
      return matchesSearch;
    }

    // Si no hay texto de búsqueda, aplicar los demás filtros
    // Filtro por categoría
    const categoriaId =
      typeof producto.categoria === "string"
        ? producto.categoria
        : producto.categoria._id;
    const matchesCategoria =
      filtroCategoria === "" || categoriaId === filtroCategoria;

    // Filtro por marca
    const matchesMarca = filtroMarca === "" || producto.marca === filtroMarca;

    // Filtro por stock
    const matchesStock =
      filtroStock === "" ||
      (filtroStock === "disponible" &&
        producto.stock.disponible &&
        producto.stock.cantidad > 0) ||
      (filtroStock === "agotado" &&
        (!producto.stock.disponible || producto.stock.cantidad === 0));

    return matchesCategoria && matchesMarca && matchesStock;
  });

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setSearchText("");
    setFiltroCategoria("");
    setFiltroMarca("");
    setFiltroStock("");
  };

  // Estadísticas del inventario
  const estadisticas = {
    total: productos.length,
    disponibles: productos.filter(
      (p) => p.stock.disponible && p.stock.cantidad > 0
    ).length,
    agotados: productos.filter(
      (p) => !p.stock.disponible || p.stock.cantidad === 0
    ).length,
    valorTotal: productos.reduce(
      (sum, p) => sum + p.precioBase * p.stock.cantidad,
      0
    ),
  };

  const openModal = (producto?: Producto) => {
    if (producto) {
      setEditingProduct(producto);
      const categoriaId =
        typeof producto.categoria === "string"
          ? producto.categoria
          : producto.categoria._id;

      setForm({
        marca: producto.marca,
        modelo: producto.modelo,
        descripcion: producto.descripcion || "",
        categoria: categoriaId,
        precioBase: producto.precioBase.toString(),
        stockCantidad: producto.stock.cantidad.toString(),
        stockDisponible: producto.stock.disponible.toString(),
        imagen:
          producto.imagenes && producto.imagenes.length > 0
            ? producto.imagenes[0]
            : "",
      });
    } else {
      setEditingProduct(null);
      setForm(initialForm);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    setForm(initialForm);
    setModeloError("");
  };

  const validateModelo = async (modelo: string) => {
    if (!modelo.trim()) {
      setModeloError("");
      return true;
    }

    const modeloUpperCase = formatModeloToUpperCase(modelo);

    // Verificar si ya existe un producto con ese modelo (excepto el que estamos editando)
    const existingProduct = productos.find(
      (p) =>
        formatModeloToUpperCase(p.modelo) === modeloUpperCase &&
        p._id !== editingProduct?._id
    );

    if (existingProduct) {
      setModeloError(`El modelo "${modeloUpperCase}" ya existe`);
      return false;
    } else {
      setModeloError("");
      return true;
    }
  };

  // Función para formatear precio en formato local (punto para miles, coma para decimales)
  const formatPrecioLocal = (precio: number): string => {
    return precio.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Función para acortar nombres de categorías largas
  const getShortCategoryName = (categoryName: string): string => {
    // Casos específicos primero
    if (
      categoryName.toLowerCase().includes("electrodomésticos de cocina") ||
      categoryName.toLowerCase().includes("electrodomesticos de cocina")
    ) {
      return "Electrodomésticos";
    }

    // Si la categoría es muy larga, tomar solo las primeras dos palabras
    const words = categoryName.split(" ");
    if (words.length > 2) {
      return words.slice(0, 2).join(" ");
    }
    return categoryName;
  };

  const openInstagramModal = (producto: Producto) => {
    setSelectedProductForInstagram(producto);
    setInstagramModalVisible(true);
  };

  const closeInstagramModal = () => {
    setInstagramModalVisible(false);
    setSelectedProductForInstagram(null);
  };

  const shareToInstagram = async () => {
    try {
      // Usar la referencia correcta según la plataforma
      const viewRef =
        Platform.OS === "web" ? instagramViewRef : instagramViewRefMobile;

      if (!viewRef.current) {
        Alert.alert("Error", "No se pudo capturar la vista para compartir");
        return;
      }

      // Capturar la vista como imagen
      const uri = await captureRef(viewRef.current, {
        format: "png",
        quality: 1.0,
        width: 1080, // Tamaño óptimo para Instagram Stories
        height: 1920,
      });

      // Verificar si Sharing está disponible
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert(
          "Error",
          "El compartir no está disponible en este dispositivo"
        );
        return;
      }

      // Compartir la imagen
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Compartir en Instagram",
      });

      // Cerrar el modal después de compartir
      closeInstagramModal();
    } catch (error) {
      console.error("Error al compartir en Instagram:", error);
      Alert.alert("Error", "No se pudo compartir la imagen");
    }
  };

  const handleSave = async () => {
    if (!form.marca || !form.modelo || !form.categoria || !form.precioBase) {
      Alert.alert("Error", "Por favor completa los campos obligatorios");
      return;
    }

    // Validar que el modelo sea único
    const modeloValido = await validateModelo(form.modelo);
    if (!modeloValido) {
      Alert.alert(
        "Error",
        "Ya existe un producto con este modelo. Por favor elige otro modelo."
      );
      return;
    }

    setSaving(true);
    try {
      // Preparar la imagen
      let imagenesArray: string[] = [];
      if (form.imagen) {
        console.log("Imagen URL:", form.imagen);
        imagenesArray = [form.imagen];
        console.log("Imagen agregada al producto:", form.imagen);
      }

      // Convertir precio a número (parsePrice maneja formato español)
      const precioNumerico = parsePrice(form.precioBase);
      if (isNaN(precioNumerico) || precioNumerico <= 0) {
        Alert.alert("Error", "El precio debe ser un número válido mayor a 0");
        setSaving(false);
        return;
      }

      const productoData = {
        marca: form.marca,
        modelo: formatModeloToUpperCase(form.modelo), // Convertir a mayúsculas
        descripcion: form.descripcion,
        categoria: form.categoria,
        precioBase: precioNumerico,
        stock: {
          cantidad: parseInt(form.stockCantidad) || 0,
          disponible: form.stockDisponible === "true",
        },
        tags: [],
        imagenes: imagenesArray,
        activo: true,
      };

      // Log para debug
      console.log(
        "Datos del producto a enviar:",
        JSON.stringify(productoData, null, 2)
      );

      if (editingProduct) {
        await productosService.actualizarProducto(
          editingProduct._id,
          productoData
        );
        Alert.alert("Éxito", "Producto actualizado correctamente");
      } else {
        await productosService.crearProducto(productoData);
        Alert.alert("Éxito", "Producto creado correctamente");
      }

      closeModal();

      // Agregar delay antes de recargar para evitar rate limiting
      await delay(500);
      await recargar();
      await delay(300);
      await recargarMarcas(); // Recargar marcas para incluir la nueva marca si se agregó una
    } catch (error: any) {
      console.error("Error al guardar producto:", error);

      // Log más detallado del error
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }

      Alert.alert(
        "Error",
        "No se pudo guardar el producto. Revisa la consola para más detalles."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (producto: Producto) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que quieres eliminar "${producto.marca} ${producto.modelo}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await productosService.eliminarProducto(producto._id);
              Alert.alert("Éxito", "Producto eliminado correctamente");

              // Agregar delay antes de recargar para evitar rate limiting
              await delay(500);
              await recargar();
            } catch (error) {
              console.error("Error al eliminar producto:", error);
              Alert.alert("Error", "No se pudo eliminar el producto");
            }
          },
        },
      ]
    );
  };

  // Función para manejo de imágenes
  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permisos requeridos",
          "Se necesitan permisos para acceder a la galería"
        );
        return false;
      }
    }
    return true;
  };

  // Cache para evitar múltiples peticiones de la misma imagen
  const imageCache = new Map<string, string>();
  const imageRequestQueue = new Map<string, Promise<string>>();
  const lastImageRequestTime = { value: 0 };

  // Función para convertir URL del servidor a data URL en web con cache y manejo de errores mejorado
  const getImageUrl = async (originalUrl: string): Promise<string> => {
    // Si ya es un data URL, devolverlo tal como está
    if (originalUrl.startsWith("data:")) {
      return originalUrl;
    }

    // Verificar cache primero
    if (imageCache.has(originalUrl)) {
      return imageCache.get(originalUrl)!;
    }

    // Si ya hay una request en progreso para esta URL, esperar a que termine
    if (imageRequestQueue.has(originalUrl)) {
      return imageRequestQueue.get(originalUrl)!;
    }

    // Si es una URL externa (http/https), devolverla tal como está
    if (
      originalUrl.startsWith("http://") &&
      !originalUrl.includes("192.168.1.13:3000") &&
      !originalUrl.includes("localhost:3000")
    ) {
      imageCache.set(originalUrl, originalUrl);
      return originalUrl;
    }

    // En web, si es una URL del servidor local, intentar convertir a data URL
    if (
      Platform.OS === "web" &&
      (originalUrl.includes("192.168.1.13:3000") ||
        originalUrl.includes("localhost:3000"))
    ) {
      const imagePromise = (async () => {
        try {
          // Rate limiting más agresivo para imágenes
          const now = Date.now();
          const timeSinceLastRequest = now - lastImageRequestTime.value;
          const minDelay = 500; // 500ms entre requests de imágenes

          if (timeSinceLastRequest < minDelay) {
            await new Promise((resolve) =>
              setTimeout(resolve, minDelay - timeSinceLastRequest)
            );
          }

          lastImageRequestTime.value = Date.now();

          console.log(
            "Convirtiendo URL del servidor a data URL en web:",
            originalUrl
          );

          // Intentar obtener la imagen del servidor con timeout extendido
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

          const response = await fetch(originalUrl, {
            signal: controller.signal,
            mode: "cors",
            headers: {
              Accept: "image/*",
              "Cache-Control": "max-age=3600", // Cache por 1 hora
            },
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const blob = await response.blob();
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });

            // Guardar en cache
            imageCache.set(originalUrl, dataUrl);
            imageRequestQueue.delete(originalUrl);
            return dataUrl;
          } else {
            console.warn(
              `No se pudo obtener la imagen del servidor (${response.status}), usando placeholder`
            );
            // En caso de 429 o otros errores, no intentar de nuevo
            const fallbackUrl = originalUrl;
            imageCache.set(originalUrl, fallbackUrl);
            imageRequestQueue.delete(originalUrl);
            return fallbackUrl;
          }
        } catch (error: any) {
          console.error(
            "Error al convertir imagen del servidor:",
            error.message
          );
          // Para errores CORS, timeout o rate limiting, usar URL original
          const fallbackUrl = originalUrl;
          imageCache.set(originalUrl, fallbackUrl);
          imageRequestQueue.delete(originalUrl);
          return fallbackUrl;
        }
      })();

      // Guardar la promesa en la cola para evitar requests duplicados
      imageRequestQueue.set(originalUrl, imagePromise);
      return imagePromise;
    }

    // En móvil, devolver la URL original
    imageCache.set(originalUrl, originalUrl);
    return originalUrl;
  };

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
          const convertedUri = await getImageUrl(source.uri);
          setImageUri(convertedUri);
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
        contentFit="cover"
      />
    );
  };

  // Función para subir imagen al backend
  const uploadImageToBackend = async (
    imageUri: string
  ): Promise<string | null> => {
    try {
      console.log("Subiendo imagen al backend:", imageUri);

      // Si es una URL de internet, devolverla directamente
      if (imageUri.startsWith("http://") || imageUri.startsWith("https://")) {
        return imageUri;
      }

      // Para archivos locales, convertir a base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Determinar el tipo de imagen
      const extension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = extension === "png" ? "image/png" : "image/jpeg";

      // Crear data URL para uso directo en web (evita problemas de CORS)
      const dataUrl = `data:${mimeType};base64,${base64}`;
      console.log("Data URL creada:", dataUrl.substring(0, 100) + "...");

      // En web, usar directamente el data URL para evitar problemas de CORS
      if (Platform.OS === "web") {
        console.log("Plataforma web detectada, usando data URL directamente");
        return dataUrl;
      }

      // En móvil, intentar subir al servidor
      const getBackendURL = () => {
        return "http://192.168.1.13:3000";
      };

      const backendURL = getBackendURL();
      console.log("Subiendo al servidor móvil:", backendURL);

      const requestBody = {
        imageData: dataUrl,
        filename: `product_${Date.now()}.${extension}`,
      };

      const response = await fetch(`${backendURL}/api/upload/base64`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Respuesta del servidor:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        // En móvil, si falla el servidor, usar el data URL como fallback
        console.log("Servidor falló, usando data URL como fallback");
        return dataUrl;
      }

      const data = await response.json();
      console.log("Imagen subida exitosamente:", data);

      // Construir URL completa si es relativa
      let fullUrl = data.url || data.data?.url;
      if (fullUrl && fullUrl.startsWith("/")) {
        fullUrl = `${backendURL}${fullUrl}`;
      }

      console.log("URL final de la imagen:", fullUrl);
      return fullUrl || dataUrl;
    } catch (error) {
      console.error("Error al subir imagen:", error);

      // Como último fallback, crear data URL si es posible
      try {
        if (imageUri && !imageUri.startsWith("data:")) {
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const extension = imageUri.split(".").pop()?.toLowerCase() || "jpg";
          const mimeType = extension === "png" ? "image/png" : "image/jpeg";
          const fallbackDataUrl = `data:${mimeType};base64,${base64}`;
          console.log("Usando data URL como fallback final");
          return fallbackDataUrl;
        }
      } catch (fallbackError) {
        console.error("Error al crear fallback:", fallbackError);
      }

      return null;
    }
  };

  const selectImageFromGallery = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("Imagen seleccionada de galería:", imageUri);

        // Subir imagen al backend automáticamente
        const uploadedUrl = await uploadImageToBackend(imageUri);
        console.log("URL recibida del upload (galería):", uploadedUrl);
        if (uploadedUrl) {
          console.log("Guardando URL en form:", uploadedUrl);
          setForm({ ...form, imagen: uploadedUrl });
          Alert.alert("Éxito", "Imagen subida correctamente");
        } else {
          console.error("No se recibió URL válida del upload");
        }
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const selectImageFromCamera = async () => {
    if (Platform.OS === "web") {
      Alert.alert("No disponible", "La cámara no está disponible en web");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos requeridos",
        "Se necesitan permisos para usar la cámara"
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("Imagen tomada con cámara:", imageUri);

        // Subir imagen al backend automáticamente
        const uploadedUrl = await uploadImageToBackend(imageUri);
        if (uploadedUrl) {
          setForm({ ...form, imagen: uploadedUrl });
          Alert.alert("Éxito", "Imagen subida correctamente");
        }
      }
    } catch (error) {
      console.error("Error al tomar foto:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  const selectImageFromFiles = async () => {
    if (Platform.OS !== "web") {
      Alert.alert(
        "No disponible",
        "Selección de archivos solo disponible en web"
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log("Archivo seleccionado:", imageUri);

        // Subir imagen al backend automáticamente
        const uploadedUrl = await uploadImageToBackend(imageUri);
        if (uploadedUrl) {
          setForm({ ...form, imagen: uploadedUrl });
          Alert.alert("Éxito", "Imagen subida correctamente");
        }
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  const showImagePicker = () => {
    const options = [
      {
        text: "Ingresar URL",
        onPress: () => promptForImageURL(),
      },
      { text: "Galería", onPress: selectImageFromGallery },
    ];

    if (Platform.OS !== "web") {
      options.push({
        text: "Cámara",
        onPress: selectImageFromCamera,
      });
    } else {
      options.push({
        text: "Archivos",
        onPress: selectImageFromFiles,
      });
    }

    options.push({ text: "Cancelar", onPress: () => {} });

    Alert.alert("Seleccionar imagen", "Elige la fuente de la imagen", options);
  };

  const promptForImageURL = () => {
    if (Platform.OS === "ios") {
      Alert.prompt(
        "URL de imagen",
        "Ingresa la URL de la imagen",
        [
          { text: "Cancelar" },
          {
            text: "Agregar",
            onPress: (url) => {
              if (url && url.trim()) {
                const cleanUrl = url.trim();
                console.log("URL ingresada:", cleanUrl);

                // Validar URL básica
                if (
                  cleanUrl.startsWith("http") ||
                  cleanUrl.startsWith("https") ||
                  cleanUrl.startsWith("data:")
                ) {
                  setForm({ ...form, imagen: cleanUrl });
                } else {
                  Alert.alert(
                    "Error",
                    "Por favor ingresa una URL válida que comience con http://, https:// o data:"
                  );
                }
              }
            },
          },
        ],
        "plain-text",
        form.imagen
      );
    } else {
      // Para Android y Web, mostrar un input simple
      Alert.alert(
        "URL de imagen",
        "Ve a configuración avanzada para ingresar URL manualmente"
      );
    }
  };

  const removeImage = () => {
    setForm({ ...form, imagen: "" });
  };

  // Convertir productos a ProductoConPrecios para las cards (simplificado)
  const convertirAProductoConPrecios = (
    producto: Producto
  ): ProductoConPrecios => ({
    ...producto,
    precios: {
      contado: producto.precioBase,
      tresCuotas: {
        total: producto.precioBase,
        cuota: producto.precioBase / 3,
      },
      seisCuotas: {
        total: producto.precioBase,
        cuota: producto.precioBase / 6,
      },
    },
  });

  const renderProducto = ({ item }: { item: Producto }) => {
    const productoConPrecios = convertirAProductoConPrecios(item);

    return (
      <View key={item._id} style={styles.cardContainer}>
        <ProductCard
          producto={productoConPrecios}
          onPress={() => {
            setSelectedProduct(item);
            setDetailModalVisible(true);
          }}
          showAdminButtons={true}
          onEdit={() => openModal(item)}
          onDelete={() => handleDelete(item)}
          onInstagramStory={() => openInstagramModal(item)}
        />
      </View>
    );
  };

  const isWeb = Platform.OS === "web";
  const { width } = Dimensions.get("window");
  const isWideScreen = width > 768;

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setFiltroCategoria("");
    setFiltroMarca("");
    setFiltroStock("");
    setSearchText("");
  };

  // Preparar datos para el sidebar
  const categoriaOptions = categorias.map((cat) => ({
    label: cat.nombre,
    value: cat._id,
  }));

  const marcaOptions = marcas.map((marca) => ({
    label: marca,
    value: marca,
  }));

  return (
    <>
      {isWeb && isWideScreen ? (
        // Layout para web con sidebar
        <View style={styles.webLayoutFullHeight}>
          {/* Header reutilizable */}
          <Header
            sectionTitle="Productos"
            sectionSubtitle="Gestiona tu inventario"
          />

          {/* Contenido con sidebar */}
          <View style={styles.webContentWithSidebar}>
            {/* Sidebar de filtros */}
            <SidebarFilters
              categorias={categoriaOptions}
              marcas={marcaOptions}
              selectedCategoria={filtroCategoria}
              selectedMarca={filtroMarca}
              selectedStock={filtroStock}
              searchText={searchText}
              onCategoriaChange={setFiltroCategoria}
              onMarcaChange={setFiltroMarca}
              onStockChange={setFiltroStock}
              onSearchChange={setSearchText}
              onClearFilters={clearAllFilters}
              onAddProduct={() => openModal()}
            />

            {/* Contenido principal */}
            <View style={styles.mainContent}>
              <ScrollView
                style={styles.mainScrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              >
                {/* Lista de productos */}
                <ThemedView style={styles.webProductsContainer}>
                  {productosFiltrados.length === 0 ? (
                    <ThemedView style={styles.emptyContainer}>
                      <ThemedText style={styles.emptyText}>
                        {productosLoading
                          ? "Cargando productos..."
                          : searchText ||
                            filtroCategoria ||
                            filtroMarca ||
                            filtroStock
                          ? "No se encontraron productos con los filtros aplicados"
                          : "No hay productos disponibles"}
                      </ThemedText>
                    </ThemedView>
                  ) : (
                    <View style={styles.webGrid}>
                      {productosFiltrados.map((producto) =>
                        renderProducto({ item: producto })
                      )}
                    </View>
                  )}
                </ThemedView>
              </ScrollView>
            </View>
          </View>
        </View>
      ) : (
        // Layout móvil con header estilo web
        <View style={styles.mobileLayout}>
          {/* Header móvil reutilizable */}
          <MobileHeader title="Productos" subtitle="Gestiona tu inventario" />

          <ScrollView
            style={styles.mobileContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.mobileContentWithBackground}>
              {/* Barra de acciones: Agregar + Filtros en la misma línea */}
              <View style={styles.mobileActionsBar}>
                <TouchableOpacity
                  onPress={() => openModal()}
                  style={styles.addButtonMobile}
                >
                  <ThemedText style={styles.addButtonText}>
                    + Agregar
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.filtersButtonMobile}
                  onPress={() => setFiltersModalVisible(true)}
                >
                  <ThemedText style={styles.filtersButtonText}>
                    🔍 Filtros
                  </ThemedText>
                  {(filtroCategoria || filtroMarca || filtroStock) && (
                    <View style={styles.activeFiltersBadge}>
                      <ThemedText style={styles.badgeText}>
                        {
                          [filtroCategoria, filtroMarca, filtroStock].filter(
                            (f) => f
                          ).length
                        }
                      </ThemedText>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Botón limpiar filtros */}
                {(filtroCategoria || filtroMarca || filtroStock) && (
                  <TouchableOpacity
                    style={styles.clearFiltersButtonMobile}
                    onPress={() => {
                      setFiltroCategoria("");
                      setFiltroMarca("");
                      setFiltroStock("");
                    }}
                  >
                    <ThemedText style={styles.clearFiltersText}>
                      Limpiar
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>

              {/* Chips de filtros activos */}
              {(filtroCategoria || filtroMarca || filtroStock) && (
                <FadeInView delay={300}>
                  <View style={styles.activeFiltersChips}>
                    {filtroCategoria && (
                      <View style={styles.filterChip}>
                        <ThemedText style={styles.chipText}>
                          {categorias.find((c) => c._id === filtroCategoria)
                            ?.nombre || "Categoría"}
                        </ThemedText>
                        <TouchableOpacity
                          onPress={() => setFiltroCategoria("")}
                          style={styles.chipRemove}
                        >
                          <ThemedText style={styles.chipRemoveText}>
                            ×
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}
                    {filtroMarca && (
                      <View style={styles.filterChip}>
                        <ThemedText style={styles.chipText}>
                          {filtroMarca}
                        </ThemedText>
                        <TouchableOpacity
                          onPress={() => setFiltroMarca("")}
                          style={styles.chipRemove}
                        >
                          <ThemedText style={styles.chipRemoveText}>
                            ×
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}
                    {filtroStock && (
                      <View style={styles.filterChip}>
                        <ThemedText style={styles.chipText}>
                          {filtroStock === "disponible"
                            ? "Disponible"
                            : "Agotado"}
                        </ThemedText>
                        <TouchableOpacity
                          onPress={() => setFiltroStock("")}
                          style={styles.chipRemove}
                        >
                          <ThemedText style={styles.chipRemoveText}>
                            ×
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </FadeInView>
              )}

              {/* Lista de productos móvil */}
              <FadeInView delay={400}>
                <ThemedView style={styles.productListContainer}>
                  {productosFiltrados.length === 0 ? (
                    <ThemedView style={styles.emptyContainer}>
                      <ThemedText style={styles.emptyText}>
                        {productosLoading
                          ? "Cargando productos..."
                          : searchText ||
                            filtroCategoria ||
                            filtroMarca ||
                            filtroStock
                          ? "No se encontraron productos con los filtros aplicados"
                          : "No hay productos disponibles"}
                      </ThemedText>
                    </ThemedView>
                  ) : (
                    <View style={styles.mobileList}>
                      {productosFiltrados.map((producto) =>
                        renderProducto({ item: producto })
                      )}
                    </View>
                  )}
                </ThemedView>
              </FadeInView>
            </View>
          </ScrollView>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType={Platform.OS === "web" ? "fade" : "slide"}
        transparent={Platform.OS === "web"}
        presentationStyle={
          Platform.OS === "web" ? "overFullScreen" : "pageSheet"
        }
        onRequestClose={closeModal}
      >
        {Platform.OS === "web" ? (
          // Modal web estilo "paper" centrado igual que el de detalle
          <View style={styles.webModalOverlay}>
            <View style={styles.webModalContainer}>
              <ThemedView style={styles.webModalHeader}>
                <ThemedText style={styles.webModalTitle}>
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </ThemedText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
              </ThemedView>

              <ScrollView
                style={styles.webModalContent}
                contentContainerStyle={styles.webModalContentContainer}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.form}>
                  <EditableDropdown
                    label="Marca *"
                    required
                    options={marcas}
                    selectedValue={form.marca}
                    onSelect={(value) => setForm({ ...form, marca: value })}
                    placeholder="Seleccionar o escribir marca"
                    loading={marcasLoading}
                  />

                  <AnimatedInput
                    label="Modelo *"
                    value={form.modelo}
                    onChangeText={async (text) => {
                      const modeloUpperCase = formatModeloToUpperCase(text);
                      setForm({ ...form, modelo: modeloUpperCase });
                      await validateModelo(text);
                    }}
                    placeholder="Modelo del producto"
                    error={modeloError}
                  />

                  <LabeledDropdown
                    label="Categoría *"
                    options={categorias.map((cat) => ({
                      label: cat.nombre,
                      value: cat._id,
                    }))}
                    selectedValue={form.categoria}
                    onSelect={(value) => setForm({ ...form, categoria: value })}
                    placeholder="Seleccionar categoría"
                    loading={categoriasLoading}
                  />

                  <AnimatedInput
                    label="Precio Base *"
                    value={form.precioBase}
                    onChangeText={(text) => {
                      // Solo permitir números, puntos y comas
                      const filteredText = text.replace(/[^0-9.,]/g, "");
                      setForm({ ...form, precioBase: filteredText });
                    }}
                    onBlur={() => {
                      // Formatear al perder el foco
                      if (form.precioBase) {
                        const numericValue = parsePrice(form.precioBase);
                        if (!isNaN(numericValue)) {
                          const formattedPrice = formatPrice(numericValue);
                          setForm({ ...form, precioBase: formattedPrice });
                        }
                      }
                    }}
                    placeholder="0,00"
                    keyboardType="numeric"
                  />

                  <AnimatedInput
                    label="Stock Cantidad"
                    value={form.stockCantidad}
                    onChangeText={(text) =>
                      setForm({ ...form, stockCantidad: text })
                    }
                    placeholder="Cantidad en stock"
                    keyboardType="numeric"
                  />

                  <LabeledDropdown
                    label="Stock Disponible"
                    options={[
                      { label: "Disponible", value: "true" },
                      { label: "No disponible", value: "false" },
                    ]}
                    selectedValue={form.stockDisponible}
                    onSelect={(value) =>
                      setForm({ ...form, stockDisponible: value })
                    }
                    placeholder="Seleccionar disponibilidad"
                  />

                  <AnimatedInput
                    label="Descripción"
                    value={form.descripcion}
                    onChangeText={(text) =>
                      setForm({ ...form, descripcion: text })
                    }
                    placeholder="Descripción del producto"
                    multiline
                    numberOfLines={3}
                  />

                  {/* Campo de imagen */}
                  <View style={styles.imageSection}>
                    <ThemedText style={styles.imageLabel}>
                      Imagen del producto
                    </ThemedText>
                    <ThemedText style={styles.imageSectionNote}>
                      📸 Puedes agregar imágenes desde URL, galería, cámara o
                      archivos.
                    </ThemedText>

                    {form.imagen &&
                    (form.imagen.startsWith("http") ||
                      form.imagen.startsWith("file") ||
                      form.imagen.startsWith("data:")) ? (
                      <View style={styles.imagePreviewContainer}>
                        <SmartImage
                          source={{ uri: form.imagen }}
                          style={styles.imagePreview}
                          onLoad={() =>
                            console.log(
                              "Imagen cargada exitosamente:",
                              form.imagen
                            )
                          }
                          onError={(error) =>
                            console.error(
                              "Error al cargar imagen:",
                              error,
                              "URL:",
                              form.imagen
                            )
                          }
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={removeImage}
                        >
                          <ThemedText style={styles.removeImageText}>
                            ✕
                          </ThemedText>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.imagePlaceholder}
                        onPress={showImagePicker}
                      >
                        <ThemedText style={styles.imagePlaceholderText}>
                          📷 Agregar Imagen
                        </ThemedText>
                        <ThemedText style={styles.imagePlaceholderSubtext}>
                          URL, Galería, Cámara o Archivos
                        </ThemedText>
                      </TouchableOpacity>
                    )}

                    {form.imagen && (
                      <View style={styles.imageActions}>
                        <TouchableOpacity
                          style={styles.changeImageButton}
                          onPress={showImagePicker}
                        >
                          <ThemedText style={styles.changeImageText}>
                            🔄 Cambiar imagen
                          </ThemedText>
                        </TouchableOpacity>

                        <AnimatedInput
                          label="URL de imagen (opcional)"
                          value={form.imagen}
                          onChangeText={(text) =>
                            setForm({ ...form, imagen: text })
                          }
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.webModalActions}>
                <AnimatedButton
                  title={editingProduct ? "Actualizar" : "Crear"}
                  onPress={handleSave}
                  loading={saving}
                  style={styles.saveButton}
                />
              </View>
            </View>
          </View>
        ) : (
          // Modal nativo para móvil (sin cambios)
          <SafeAreaView style={styles.modalContainer}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="subtitle">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </ThemedText>
              <TouchableOpacity onPress={closeModal}>
                <ThemedText style={styles.cancelButton}>Cancelar</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.form}>
                <EditableDropdown
                  label="Marca *"
                  required
                  options={marcas}
                  selectedValue={form.marca}
                  onSelect={(value) => setForm({ ...form, marca: value })}
                  placeholder="Seleccionar o escribir marca"
                  loading={marcasLoading}
                />

                <AnimatedInput
                  label="Modelo *"
                  value={form.modelo}
                  onChangeText={async (text) => {
                    const modeloUpperCase = formatModeloToUpperCase(text);
                    setForm({ ...form, modelo: modeloUpperCase });
                    await validateModelo(text);
                  }}
                  placeholder="Modelo del producto"
                  error={modeloError}
                />

                <LabeledDropdown
                  label="Categoría *"
                  options={categorias.map((cat) => ({
                    label: cat.nombre,
                    value: cat._id,
                  }))}
                  selectedValue={form.categoria}
                  onSelect={(value) => setForm({ ...form, categoria: value })}
                  placeholder="Seleccionar categoría"
                  loading={categoriasLoading}
                />

                <AnimatedInput
                  label="Precio Base *"
                  value={form.precioBase}
                  onChangeText={(text) => {
                    // Solo permitir números, puntos y comas
                    const filteredText = text.replace(/[^0-9.,]/g, "");
                    setForm({ ...form, precioBase: filteredText });
                  }}
                  onBlur={() => {
                    // Formatear al perder el foco
                    if (form.precioBase) {
                      const numericValue = parsePrice(form.precioBase);
                      if (!isNaN(numericValue)) {
                        const formattedPrice = formatPrice(numericValue);
                        setForm({ ...form, precioBase: formattedPrice });
                      }
                    }
                  }}
                  placeholder="0,00"
                  keyboardType="numeric"
                />

                <AnimatedInput
                  label="Stock Cantidad"
                  value={form.stockCantidad}
                  onChangeText={(text) =>
                    setForm({ ...form, stockCantidad: text })
                  }
                  placeholder="Cantidad en stock"
                  keyboardType="numeric"
                />

                <LabeledDropdown
                  label="Stock Disponible"
                  options={[
                    { label: "Disponible", value: "true" },
                    { label: "No disponible", value: "false" },
                  ]}
                  selectedValue={form.stockDisponible}
                  onSelect={(value) =>
                    setForm({ ...form, stockDisponible: value })
                  }
                  placeholder="Seleccionar disponibilidad"
                />

                <AnimatedInput
                  label="Descripción"
                  value={form.descripcion}
                  onChangeText={(text) =>
                    setForm({ ...form, descripcion: text })
                  }
                  placeholder="Descripción del producto"
                  multiline
                  numberOfLines={3}
                />

                {/* Campo de imagen */}
                <View style={styles.imageSection}>
                  <ThemedText style={styles.imageLabel}>
                    Imagen del producto
                  </ThemedText>
                  <ThemedText style={styles.imageSectionNote}>
                    📸 Puedes agregar imágenes desde URL, galería, cámara o
                    archivos.
                  </ThemedText>

                  {form.imagen &&
                  (form.imagen.startsWith("http") ||
                    form.imagen.startsWith("file") ||
                    form.imagen.startsWith("data:")) ? (
                    <View style={styles.imagePreviewContainer}>
                      <SmartImage
                        source={{ uri: form.imagen }}
                        style={styles.imagePreview}
                        onLoad={() =>
                          console.log(
                            "Imagen cargada exitosamente:",
                            form.imagen
                          )
                        }
                        onError={(error) =>
                          console.error(
                            "Error al cargar imagen:",
                            error,
                            "URL:",
                            form.imagen
                          )
                        }
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={removeImage}
                      >
                        <ThemedText style={styles.removeImageText}>
                          ✕
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.imagePlaceholder}
                      onPress={showImagePicker}
                    >
                      <ThemedText style={styles.imagePlaceholderText}>
                        📷 Agregar Imagen
                      </ThemedText>
                      <ThemedText style={styles.imagePlaceholderSubtext}>
                        URL, Galería, Cámara o Archivos
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  {form.imagen && (
                    <View style={styles.imageActions}>
                      <TouchableOpacity
                        style={styles.changeImageButton}
                        onPress={showImagePicker}
                      >
                        <ThemedText style={styles.changeImageText}>
                          🔄 Cambiar imagen
                        </ThemedText>
                      </TouchableOpacity>

                      <AnimatedInput
                        label="URL de imagen (opcional)"
                        value={form.imagen}
                        onChangeText={(text) =>
                          setForm({ ...form, imagen: text })
                        }
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <AnimatedButton
                title={editingProduct ? "Actualizar" : "Crear"}
                onPress={handleSave}
                loading={saving}
                style={styles.saveButton}
              />
            </View>
          </SafeAreaView>
        )}
      </Modal>

      {/* Modal de estadísticas detalladas */}
      <Modal
        visible={statsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStatsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statsModalContainer}>
            <View style={styles.statsModalHeader}>
              <ThemedText style={styles.statsModalTitle}>
                📊 Resumen del Inventario
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setStatsModalVisible(false)}
              >
                <ThemedText style={styles.closeButtonText}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.statsDetailGrid}>
              <View style={styles.statDetailItem}>
                <ThemedText style={styles.statNumber}>
                  {estadisticas.total}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Total de Productos
                </ThemedText>
              </View>
              <View style={styles.statDetailItem}>
                <ThemedText style={[styles.statNumber, styles.availableColor]}>
                  {estadisticas.disponibles}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Disponibles</ThemedText>
              </View>
              <View style={styles.statDetailItem}>
                <ThemedText
                  style={[styles.statNumber, styles.unavailableColor]}
                >
                  {estadisticas.agotados}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Agotados</ThemedText>
              </View>
              <View style={styles.statDetailItem}>
                <ThemedText style={[styles.statNumber, styles.valueColor]}>
                  ${estadisticas.valorTotal.toLocaleString()}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Valor Total del Inventario
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de detalle del producto */}
      <Modal
        visible={detailModalVisible}
        animationType={Platform.OS === "web" ? "fade" : "slide"}
        transparent={Platform.OS === "web"}
        presentationStyle={
          Platform.OS === "web" ? "overFullScreen" : "pageSheet"
        }
        onRequestClose={() => setDetailModalVisible(false)}
      >
        {Platform.OS === "web" ? (
          // Modal web estilo "paper" centrado
          <View style={styles.webModalOverlay}>
            <View style={styles.webModalContainer}>
              <ThemedView style={styles.webModalHeader}>
                <ThemedText style={styles.webModalTitle}>
                  Detalle del Producto
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.webModalCloseButton}
                >
                  <ThemedText style={styles.webModalCloseText}>✕</ThemedText>
                </TouchableOpacity>
              </ThemedView>

              {selectedProduct && (
                <ScrollView
                  style={styles.webModalContent}
                  contentContainerStyle={styles.webModalContentContainer}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.detailContainer}>
                    {/* Imagen del producto */}
                    {selectedProduct.imagenes &&
                      selectedProduct.imagenes.length > 0 && (
                        <View style={styles.detailImageContainer}>
                          <SmartImage
                            source={{ uri: selectedProduct.imagenes[0] }}
                            style={[
                              styles.detailImage,
                              { aspectRatio: imageAspectRatio },
                            ]}
                            onLoad={() => {
                              // Para SmartImage, usaremos RNImage.getSize para obtener las dimensiones
                              if (selectedProduct.imagenes?.[0]) {
                                RNImage.getSize(
                                  selectedProduct.imagenes[0],
                                  (width: number, height: number) => {
                                    setImageAspectRatio(width / height);
                                  },
                                  (error: any) => {
                                    console.error(
                                      "Error al obtener dimensiones:",
                                      error
                                    );
                                    // Mantener aspect ratio por defecto
                                    setImageAspectRatio(1);
                                  }
                                );
                              }
                            }}
                            onError={(error) =>
                              console.error(
                                "Error al cargar imagen del producto:",
                                error
                              )
                            }
                          />
                        </View>
                      )}

                    {/* Información básica */}
                    <View style={styles.detailSection}>
                      <ThemedText style={styles.detailTitle}>
                        {selectedProduct.marca} {selectedProduct.modelo}
                      </ThemedText>

                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>ID:</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          #{selectedProduct._id.slice(-6)}
                        </ThemedText>
                      </View>

                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>
                          Marca:
                        </ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedProduct.marca}
                        </ThemedText>
                      </View>

                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>
                          Modelo:
                        </ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedProduct.modelo}
                        </ThemedText>
                      </View>

                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>
                          Categoría:
                        </ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {typeof selectedProduct.categoria === "string"
                            ? selectedProduct.categoria
                            : selectedProduct.categoria.nombre}
                        </ThemedText>
                      </View>

                      {selectedProduct.descripcion && (
                        <View style={styles.detailRow}>
                          <ThemedText style={styles.detailLabel}>
                            Descripción:
                          </ThemedText>
                          <ThemedText style={styles.detailValue}>
                            {selectedProduct.descripcion}
                          </ThemedText>
                        </View>
                      )}

                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>
                          Precio Base:
                        </ThemedText>
                        <ThemedText
                          style={[styles.detailValue, styles.priceText]}
                        >
                          ${selectedProduct.precioBase.toLocaleString()}
                        </ThemedText>
                      </View>

                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>
                          Stock:
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.detailValue,
                            selectedProduct.stock.disponible
                              ? styles.availableText
                              : styles.unavailableText,
                          ]}
                        >
                          {selectedProduct.stock.cantidad} unidades
                          {selectedProduct.stock.disponible
                            ? " ✅ Disponible"
                            : " ❌ No disponible"}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Botones de acción */}
                    <View style={styles.detailActionsContainer}>
                      <TouchableOpacity
                        style={styles.detailEditButton}
                        onPress={() => {
                          setDetailModalVisible(false);
                          openModal(selectedProduct);
                        }}
                      >
                        <ThemedText style={styles.detailActionIcon}>
                          ✏️
                        </ThemedText>
                        <ThemedText style={styles.detailActionText}>
                          Editar Producto
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.detailDeleteButton}
                        onPress={() => {
                          setDetailModalVisible(false);
                          if (selectedProduct) {
                            handleDelete(selectedProduct);
                          }
                        }}
                      >
                        <ThemedText style={styles.detailActionIcon}>
                          🗑️
                        </ThemedText>
                        <ThemedText style={styles.detailActionText}>
                          Eliminar Producto
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        ) : (
          // Modal móvil estilo nativo
          <SafeAreaView style={styles.modalContainer}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="subtitle">Detalle del Producto</ThemedText>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <ThemedText style={styles.cancelButton}>Cerrar</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {selectedProduct && (
              <ScrollView
                style={styles.modalContent}
                contentContainerStyle={styles.modalContentContainer}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.detailContainer}>
                  {/* Imagen del producto */}
                  {selectedProduct.imagenes &&
                    selectedProduct.imagenes.length > 0 && (
                      <View style={styles.detailImageContainer}>
                        <SmartImage
                          source={{ uri: selectedProduct.imagenes[0] }}
                          style={[
                            styles.detailImage,
                            { aspectRatio: imageAspectRatio },
                          ]}
                          onLoad={() => {
                            // Para SmartImage, usaremos RNImage.getSize para obtener las dimensiones
                            if (selectedProduct.imagenes?.[0]) {
                              RNImage.getSize(
                                selectedProduct.imagenes[0],
                                (width: number, height: number) => {
                                  setImageAspectRatio(width / height);
                                },
                                (error: any) => {
                                  console.error(
                                    "Error al obtener dimensiones:",
                                    error
                                  );
                                  // Mantener aspect ratio por defecto
                                  setImageAspectRatio(1);
                                }
                              );
                            }
                          }}
                          onError={(error) =>
                            console.error(
                              "Error al cargar imagen del producto:",
                              error
                            )
                          }
                        />
                      </View>
                    )}

                  {/* Información básica */}
                  <View style={styles.detailSection}>
                    <ThemedText style={styles.detailTitle}>
                      {selectedProduct.marca} {selectedProduct.modelo}
                    </ThemedText>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>ID:</ThemedText>
                      <ThemedText style={styles.detailValue}>
                        #{selectedProduct._id.slice(-6)}
                      </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Marca:</ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {selectedProduct.marca}
                      </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>
                        Modelo:
                      </ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {selectedProduct.modelo}
                      </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>
                        Categoría:
                      </ThemedText>
                      <ThemedText style={styles.detailValue}>
                        {typeof selectedProduct.categoria === "string"
                          ? selectedProduct.categoria
                          : selectedProduct.categoria.nombre}
                      </ThemedText>
                    </View>

                    {selectedProduct.descripcion && (
                      <View style={styles.detailRow}>
                        <ThemedText style={styles.detailLabel}>
                          Descripción:
                        </ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {selectedProduct.descripcion}
                        </ThemedText>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>
                        Precio Base:
                      </ThemedText>
                      <ThemedText
                        style={[styles.detailValue, styles.priceText]}
                      >
                        ${selectedProduct.precioBase.toLocaleString()}
                      </ThemedText>
                    </View>

                    <View style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>Stock:</ThemedText>
                      <ThemedText
                        style={[
                          styles.detailValue,
                          selectedProduct.stock.disponible
                            ? styles.availableText
                            : styles.unavailableText,
                        ]}
                      >
                        {selectedProduct.stock.cantidad} unidades
                        {selectedProduct.stock.disponible
                          ? " ✅ Disponible"
                          : " ❌ No disponible"}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Botones de acción */}
                  <View style={styles.detailActionsContainer}>
                    <TouchableOpacity
                      style={styles.detailEditButton}
                      onPress={() => {
                        setDetailModalVisible(false);
                        openModal(selectedProduct);
                      }}
                    >
                      <ThemedText style={styles.detailActionIcon}>
                        ✏️
                      </ThemedText>
                      <ThemedText style={styles.detailActionText}>
                        Editar Producto
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailDeleteButton}
                      onPress={() => {
                        setDetailModalVisible(false);
                        if (selectedProduct) {
                          handleDelete(selectedProduct);
                        }
                      }}
                    >
                      <ThemedText style={styles.detailActionIcon}>
                        🗑️
                      </ThemedText>
                      <ThemedText style={styles.detailActionText}>
                        Eliminar Producto
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </SafeAreaView>
        )}
      </Modal>

      {/* Modal de Instagram Story */}
      <Modal
        visible={instagramModalVisible}
        animationType={Platform.OS === "web" ? "fade" : "slide"}
        transparent={Platform.OS === "web"}
        presentationStyle={
          Platform.OS === "web" ? "overFullScreen" : "pageSheet"
        }
        onRequestClose={closeInstagramModal}
      >
        {Platform.OS === "web" ? (
          <View style={styles.webModalOverlay}>
            <View style={styles.instagramModalContainer}>
              <ThemedView style={styles.webModalHeader}>
                <ThemedText style={styles.webModalTitle}>
                  📸 Crear Historia de Instagram
                </ThemedText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeInstagramModal}
                >
                  <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
              </ThemedView>

              <ScrollView
                style={styles.webModalContent}
                contentContainerStyle={styles.webModalContentContainer}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.instagramPreviewContainer}>
                  {/* Vista previa de la historia */}
                  <View ref={instagramViewRef} style={styles.storyPreview}>
                    <Image
                      source={require("@/assets/images/back-history.jpeg")}
                      style={styles.storyBackground}
                      contentFit="cover"
                    />

                    {/* Contenido superpuesto */}
                    <View style={styles.storyContent}>
                      {/* Imagen del producto */}
                      {selectedProductForInstagram?.imagenes &&
                        selectedProductForInstagram.imagenes.length > 0 && (
                          <View style={styles.storyProductImageContainer}>
                            <Image
                              source={{
                                uri: selectedProductForInstagram.imagenes[0],
                              }}
                              style={styles.storyProductImage}
                              contentFit="contain"
                            />
                          </View>
                        )}

                      {/* Contenedor de categoría debajo de la imagen */}
                      {instagramStoryOptions.showCategoria &&
                        selectedProductForInstagram?.categoria && (
                          <View style={styles.storyCategoryContainerBelow}>
                            <View style={styles.storyCategoryBadgeSmall}>
                              <ThemedText style={styles.storyCategoryTextSmall}>
                                {getShortCategoryName(
                                  typeof selectedProductForInstagram.categoria ===
                                    "string"
                                    ? selectedProductForInstagram.categoria
                                    : selectedProductForInstagram.categoria
                                        .nombre
                                )}
                              </ThemedText>
                            </View>
                          </View>
                        )}

                      {/* Información del producto */}
                      <View style={styles.storyProductInfo}>
                        {instagramStoryOptions.showMarca &&
                          selectedProductForInstagram?.marca && (
                            <ThemedText style={styles.storyText}>
                              {selectedProductForInstagram.marca}
                            </ThemedText>
                          )}

                        {instagramStoryOptions.showModelo &&
                          selectedProductForInstagram?.modelo && (
                            <ThemedText style={styles.storyTextBold}>
                              {selectedProductForInstagram.modelo}
                            </ThemedText>
                          )}

                        {instagramStoryOptions.showPrecio &&
                          selectedProductForInstagram?.precioBase && (
                            <ThemedText style={styles.storyPrice}>
                              $
                              {formatPrecioLocal(
                                Number(selectedProductForInstagram.precioBase)
                              )}
                            </ThemedText>
                          )}

                        {instagramStoryOptions.showStock &&
                          selectedProductForInstagram?.stock && (
                            <ThemedText style={styles.storyText}>
                              Stock:{" "}
                              {selectedProductForInstagram.stock.cantidad}
                              {selectedProductForInstagram.stock.disponible
                                ? " ✅"
                                : " ❌"}
                            </ThemedText>
                          )}

                        {instagramStoryOptions.showDescripcion &&
                          selectedProductForInstagram?.descripcion && (
                            <ThemedText style={styles.storyDescription}>
                              {selectedProductForInstagram.descripcion}
                            </ThemedText>
                          )}
                      </View>

                      {/* Mensaje de consulta precio - Dentro de la imagen de fondo */}
                      {instagramStoryOptions.showConsultaPrecio && (
                        <View style={styles.storyConsultaBoxInside}>
                          <ThemedText style={styles.storyConsultaText}>
                            💬 Consultá por el mejor precio!
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Opciones de personalización */}
                <View style={styles.instagramOptions}>
                  <ThemedText style={styles.optionsTitle}>
                    ⚙️ Personalizar información
                  </ThemedText>

                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showMarca: !prev.showMarca,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showMarca &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showMarca && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Marca
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showModelo: !prev.showModelo,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showModelo &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showModelo && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Modelo
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showCategoria: !prev.showCategoria,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showCategoria &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showCategoria && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Categoría
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showPrecio: !prev.showPrecio,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showPrecio &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showPrecio && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Precio
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showStock: !prev.showStock,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showStock &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showStock && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Stock
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showDescripcion: !prev.showDescripcion,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showDescripcion &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showDescripcion && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Descripción
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showConsultaPrecio: !prev.showConsultaPrecio,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showConsultaPrecio &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showConsultaPrecio && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar "Consultá por el mejor precio!"
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.webModalActions}>
                <TouchableOpacity
                  style={styles.instagramShareButton}
                  onPress={shareToInstagram}
                >
                  <ThemedText style={styles.instagramButtonText}>
                    📱 Compartir en Instagram
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // Versión móvil del modal
          <SafeAreaView style={styles.modalContainer}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="subtitle">
                📸 Crear Historia de Instagram
              </ThemedText>
              <TouchableOpacity onPress={closeInstagramModal}>
                <ThemedText style={styles.cancelButton}>Cancelar</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentContainer}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.instagramPreviewContainer}>
                {/* Vista previa de la historia para móvil */}
                <View
                  ref={instagramViewRefMobile}
                  style={[styles.storyPreview, { width: 250, height: 444 }]}
                >
                  <Image
                    source={require("@/assets/images/back-history.jpeg")}
                    style={styles.storyBackground}
                    contentFit="cover"
                  />

                  {/* Contenido superpuesto */}
                  <View style={styles.storyContent}>
                    {/* Imagen del producto */}
                    {selectedProductForInstagram?.imagenes &&
                      selectedProductForInstagram.imagenes.length > 0 && (
                        <View style={styles.storyProductImageContainer}>
                          <Image
                            source={{
                              uri: selectedProductForInstagram.imagenes[0],
                            }}
                            style={[
                              styles.storyProductImage,
                              { width: 180, height: 180 }, // Aumentado de 150 a 180
                            ]}
                            contentFit="contain"
                          />
                        </View>
                      )}

                    {/* Contenedor de categoría debajo de la imagen */}
                    {instagramStoryOptions.showCategoria &&
                      selectedProductForInstagram?.categoria && (
                        <View style={styles.storyCategoryContainerBelow}>
                          <View style={styles.storyCategoryBadgeSmall}>
                            <ThemedText style={styles.storyCategoryTextSmall}>
                              {getShortCategoryName(
                                typeof selectedProductForInstagram.categoria ===
                                  "string"
                                  ? selectedProductForInstagram.categoria
                                  : selectedProductForInstagram.categoria.nombre
                              )}
                            </ThemedText>
                          </View>
                        </View>
                      )}

                    {/* Información del producto */}
                    <View style={styles.storyProductInfo}>
                      {instagramStoryOptions.showMarca &&
                        selectedProductForInstagram?.marca && (
                          <ThemedText style={styles.storyText}>
                            {selectedProductForInstagram.marca}
                          </ThemedText>
                        )}

                      {instagramStoryOptions.showModelo &&
                        selectedProductForInstagram?.modelo && (
                          <ThemedText style={styles.storyTextBold}>
                            {selectedProductForInstagram.modelo}
                          </ThemedText>
                        )}

                      {instagramStoryOptions.showPrecio &&
                        selectedProductForInstagram?.precioBase && (
                          <ThemedText style={styles.storyPrice}>
                            $
                            {formatPrecioLocal(
                              Number(selectedProductForInstagram.precioBase)
                            )}
                          </ThemedText>
                        )}

                      {instagramStoryOptions.showStock && (
                        <ThemedText style={styles.storyText}>
                          {selectedProductForInstagram?.stock?.disponible
                            ? `Stock: ${
                                selectedProductForInstagram.stock.cantidad ||
                                "Disponible"
                              }`
                            : "Sin stock"}
                        </ThemedText>
                      )}

                      {instagramStoryOptions.showDescripcion &&
                        selectedProductForInstagram?.descripcion && (
                          <ThemedText style={styles.storyDescription}>
                            {selectedProductForInstagram.descripcion}
                          </ThemedText>
                        )}
                    </View>

                    {/* Mensaje de consulta precio - Dentro de la imagen de fondo */}
                    {instagramStoryOptions.showConsultaPrecio && (
                      <View style={styles.storyConsultaBoxInside}>
                        <ThemedText style={styles.storyConsultaText}>
                          💬 Consultá por el mejor precio!
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                {/* Opciones de personalización para móvil */}
                <View style={styles.instagramOptions}>
                  <ThemedText style={styles.optionsTitle}>
                    Personalizar información
                  </ThemedText>

                  <View style={styles.checkboxContainer}>
                    {/* Checkbox Marca */}
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showMarca: !prev.showMarca,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showMarca &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showMarca && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Marca
                      </ThemedText>
                    </TouchableOpacity>

                    {/* Checkbox Modelo */}
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showModelo: !prev.showModelo,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showModelo &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showModelo && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Modelo
                      </ThemedText>
                    </TouchableOpacity>

                    {/* Checkbox Categoría */}
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showCategoria: !prev.showCategoria,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showCategoria &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showCategoria && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Categoría
                      </ThemedText>
                    </TouchableOpacity>

                    {/* Checkbox Precio */}
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showPrecio: !prev.showPrecio,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showPrecio &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showPrecio && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Precio
                      </ThemedText>
                    </TouchableOpacity>

                    {/* Checkbox Stock */}
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showStock: !prev.showStock,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showStock &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showStock && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Stock
                      </ThemedText>
                    </TouchableOpacity>

                    {/* Checkbox Descripción */}
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showDescripcion: !prev.showDescripcion,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showDescripcion &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showDescripcion && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar Descripción
                      </ThemedText>
                    </TouchableOpacity>

                    {/* Checkbox Consulta Precio */}
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() =>
                        setInstagramStoryOptions((prev) => ({
                          ...prev,
                          showConsultaPrecio: !prev.showConsultaPrecio,
                        }))
                      }
                    >
                      <View
                        style={[
                          styles.checkbox,
                          instagramStoryOptions.showConsultaPrecio &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {instagramStoryOptions.showConsultaPrecio && (
                          <ThemedText style={styles.checkmark}>✓</ThemedText>
                        )}
                      </View>
                      <ThemedText style={styles.checkboxLabel}>
                        Mostrar "Consultá por el mejor precio!"
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.instagramShareButton}
                onPress={shareToInstagram}
              >
                <ThemedText style={styles.instagramButtonText}>
                  📱 Compartir en Instagram
                </ThemedText>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>

      {/* Modal de filtros móvil */}
      <Modal
        visible={filtersModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFiltersModalVisible(false)}
      >
        <SafeAreaView style={styles.filtersModalContainer}>
          <View style={styles.filtersModalHeader}>
            <ThemedText style={styles.filtersModalTitle}>Filtros</ThemedText>
            <TouchableOpacity
              onPress={() => setFiltersModalVisible(false)}
              style={styles.filtersModalClose}
            >
              <ThemedText style={styles.filtersModalCloseText}>×</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersModalContent}>
            <View style={styles.filtersSection}>
              <LabeledDropdown
                label="Categoría"
                options={[
                  { label: "Todas las categorías", value: "" },
                  ...categorias.map((cat) => ({
                    label: cat.nombre,
                    value: cat._id,
                  })),
                ]}
                selectedValue={filtroCategoria}
                onSelect={(value) => setFiltroCategoria(value)}
                placeholder="Filtrar por categoría"
              />
            </View>

            <View style={styles.filtersSection}>
              <LabeledDropdown
                label="Marca"
                options={[
                  { label: "Todas las marcas", value: "" },
                  ...marcas.map((marca) => ({
                    label: marca,
                    value: marca,
                  })),
                ]}
                selectedValue={filtroMarca}
                onSelect={(value) => setFiltroMarca(value)}
                placeholder="Filtrar por marca"
              />
            </View>

            <View style={styles.filtersSection}>
              <LabeledDropdown
                label="Stock"
                options={[
                  { label: "Todo el stock", value: "" },
                  { label: "Disponible", value: "disponible" },
                  { label: "Agotado", value: "agotado" },
                ]}
                selectedValue={filtroStock}
                onSelect={(value) => setFiltroStock(value)}
                placeholder="Filtrar por stock"
              />
            </View>
          </ScrollView>

          <View style={styles.filtersModalActions}>
            <TouchableOpacity
              style={styles.clearAllFiltersButton}
              onPress={() => {
                setFiltroCategoria("");
                setFiltroMarca("");
                setFiltroStock("");
              }}
            >
              <ThemedText style={styles.clearAllFiltersText}>
                Limpiar todos los filtros
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setFiltersModalVisible(false)}
            >
              <ThemedText style={styles.applyFiltersText}>
                Aplicar filtros
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mobileLayout: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mobileContent: {
    flex: 1,
    padding: SPACING.md,
  },
  // Estilos para barra de acciones móvil
  mobileActionsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filtersButtonMobile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  clearFiltersButtonMobile: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  mobileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mobileLogo: {
    width: 120,
    height: 40,
  },
  addButtonMobile: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  // Estilos para layout móvil con imagen de fondo
  mobileContentWithBackground: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  mobileHeaderActions: {
    alignItems: "flex-end",
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  addButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  list: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  productCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: SPACING.sm,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.xs, // Reducir margen
    minHeight: 24, // Altura mínima fija
  },
  productCategory: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs, // Reducir margen
    fontWeight: "500",
    minHeight: 22, // Altura mínima fija
  },
  productDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  productActions: {
    flexDirection: "column",
    marginTop: SPACING.sm, // Reducir margen superior
    gap: SPACING.sm, // Reducir gap entre botones
    minHeight: Platform.OS === "web" ? 90 : 70, // Altura mínima fija para alineación
  },
  actionButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: Platform.OS === "web" ? SPACING.md : SPACING.sm, // Menos padding en móvil
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    width: "100%",
    alignItems: "center",
    minHeight: Platform.OS === "web" ? 40 : 32, // Altura mínima fija
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteText: {
    color: COLORS.surface,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cancelButton: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  form: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  modalActions: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
    minHeight: 80,
  },
  saveButton: {
    width: "100%",
    minHeight: 50,
    justifyContent: "center",
  },
  // Nuevos estilos
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  viewToggle: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewToggleText: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  availableColor: {
    color: COLORS.success,
  },
  unavailableColor: {
    color: COLORS.error,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchRow: {
    marginBottom: SPACING.sm,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtersRow: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: SPACING.sm, // Reducir de SPACING.md a SPACING.sm
  },
  // Nuevos estilos para filtros móviles compactos
  mobileFiltersBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    flex: 1,
    justifyContent: "center",
    gap: SPACING.sm,
  },
  filtersButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  activeFiltersBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.xs,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  clearFiltersButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearFiltersText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  activeFiltersChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  chipRemove: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary + "30",
    justifyContent: "center",
    alignItems: "center",
  },
  chipRemoveText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  filterDropdown: {
    minWidth: 120,
    marginRight: SPACING.sm,
  },
  // Estilos para grilla en web
  gridRow: {
    justifyContent: "space-around",
    paddingHorizontal: SPACING.md,
  },
  productCardGrid: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: Platform.OS === "web" ? RADIUS.lg : 0, // Sin border radius en móvil
    padding: Platform.OS === "web" ? SPACING.xl : SPACING.md, // Menos padding en móvil
    marginBottom: Platform.OS === "web" ? SPACING.xl : 0, // Sin margin bottom en móvil
    width: Platform.OS === "web" ? "31%" : "50%", // 50% en móvil para ocupar toda la pantalla
    minHeight: Platform.OS === "web" ? 280 : 250, // Altura mínima aumentada para acomodar contenido
    borderWidth: Platform.OS === "web" ? 1 : 0, // Sin border en móvil
    borderBottomWidth: Platform.OS === "web" ? 1 : 1, // Border bottom sutil en móvil
    borderRightWidth: Platform.OS === "web" ? 1 : 0.5, // Border derecho sutil en móvil para separar columnas
    borderColor: Platform.OS === "web" ? COLORS.border : "#f0f0f0", // Color más sutil en móvil
    ...(Platform.OS === "web" ? SHADOWS.lg : {}), // Sin sombra en móvil
    flexDirection: "column", // Layout vertical
    justifyContent: "space-between", // Distribuir espacio entre elementos
  },
  productContent: {
    flex: 1, // Toma el espacio disponible entre imagen y botones
    justifyContent: "flex-start", // Alinear contenido al inicio
  },
  productNameGrid: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  productActionsGrid: {
    flexDirection: "column",
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  actionButtonSmall: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    width: "100%",
    alignItems: "center",
  },
  actionButtonTextSmall: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos para el header del ParallaxScrollView
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoHeader: {
    width: 60,
    height: 60,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md, // Reducir de SPACING.lg a SPACING.md
    paddingHorizontal: SPACING.lg,
  },
  // Estilos para link simple de estadísticas
  statsSimpleLink: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statsSimpleLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
  },
  // Estilos para estadísticas compactas
  statsCard: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: SPACING.md,
    textAlign: "center",
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  actionContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm, // Reducir de SPACING.lg a SPACING.sm
  },
  // Estilos para la estructura reorganizada de productos
  productIdContainer: {
    position: "absolute",
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  productId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  productBrand: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.xs, // Reducir margen para más consistencia
    fontWeight: "600",
    minHeight: 22, // Altura mínima fija
  },
  productModel: {
    fontSize: 17,
    color: COLORS.text,
    marginBottom: SPACING.xs, // Reducir margen para más consistencia
    fontWeight: "700",
    minHeight: 44, // Altura mínima fija para 2 líneas
  },
  productStock: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: SPACING.xs, // Reducir margen
    color: COLORS.textSecondary,
    minHeight: 22, // Altura mínima fija
  },
  actionButtonLabel: {
    color: COLORS.surface,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 12,
  },
  productsList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  productListContainer: {
    flex: 1,
  },
  webGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "flex-start" as const,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md, // Espacio uniforme entre cards
  },
  mobileList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start", // Cambiar a flex-start para que no haya espacios
    paddingHorizontal: 0, // Sin padding lateral en móvil
  },
  scrollContainer: {
    flex: 1,
  },
  // Estilos para componentes de imagen
  imageSection: {
    marginBottom: SPACING.lg,
  },
  imageSectionNote: {
    fontSize: 12,
    color: COLORS.warning,
    marginBottom: SPACING.sm,
    fontStyle: "italic",
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  imagePreviewContainer: {
    position: "relative",
    alignSelf: "flex-start",
    padding: SPACING.xs, // Padding alrededor del contenedor
    backgroundColor: "#FFFFFF", // Fondo blanco
    borderRadius: RADIUS.lg,
    ...SHADOWS.md, // Sombra
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.md,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
  imagePlaceholder: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: "center",
    backgroundColor: "#FFFFFF", // Fondo blanco consistente
    ...SHADOWS.sm, // Sombra sutil
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  imageActions: {
    marginTop: SPACING.md,
  },
  changeImageButton: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    alignItems: "center",
  },
  changeImageText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  // Estilos para imagen en cards de productos
  productImageContainer: {
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },

  // Estilos para el header de imagen de productos
  productImageHeader: {
    position: "relative",
    width: "100%",
    aspectRatio: 1, // Hace que sea cuadrado
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
  },
  productMainImage: {
    width: "100%",
    height: "100%",
    borderRadius: RADIUS.md,
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA", // Fondo gris muy claro para placeholder
    borderRadius: RADIUS.md,
  },
  imagePlaceholderIcon: {
    fontSize: 32,
    color: COLORS.textSecondary,
  },
  productIdBadge: {
    position: "absolute",
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
  },
  productIdText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: "600",
  },

  // Estilos para modal de estadísticas
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  statsModalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    maxWidth: 400,
    width: "100%",
    maxHeight: "80%",
  },
  statsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.md,
  },
  statsModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.sm,
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  statsDetailGrid: {
    gap: SPACING.lg,
  },
  statDetailItem: {
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  valueColor: {
    color: COLORS.warning,
  },
  cardContainer: {
    marginBottom: 0, // Quitamos margin porque usamos gap
    width: Platform.OS === "web" ? ("calc(25% - 12px)" as any) : "48%", // 4 columnas en web, 2 en móvil
    minHeight: Platform.OS === "web" ? 280 : undefined, // Altura mínima en web para consistencia
  },
  // Estilos para modal de detalle
  detailContainer: {
    padding: SPACING.lg,
  },
  detailImageContainer: {
    width: "100%",
    height: 300, // Altura fija para consistencia
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    backgroundColor: "#FFFFFF", // Fondo blanco consistente
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    ...SHADOWS.md, // Sombra para efecto de card
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    borderRadius: RADIUS.md,
    flex: 1,
  },
  detailSection: {
    gap: SPACING.md,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
    flex: 2,
    textAlign: "right",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  availableText: {
    color: COLORS.success,
    fontWeight: "600",
  },
  unavailableText: {
    color: COLORS.error,
    fontWeight: "600",
  },
  // Estilos para botones de acción en modal de detalle
  detailActionsContainer: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  detailEditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  detailDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  detailActionIcon: {
    fontSize: 18,
  },
  detailActionText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
  },

  // Estilos para layout web con sidebar
  webLayout: {
    flex: 1,
    flexDirection: "row" as const,
    height: "100vh" as any,
    backgroundColor: COLORS.background,
    gap: SPACING.lg,
  },
  sidebarContainer: {
    width: 280,
    minHeight: "100%",
  },
  contentContainer: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainScrollView: {
    flex: 1,
  },
  webHeader: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  webHeaderTop: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: SPACING.md,
  },
  webHeaderActions: {
    flexDirection: "row" as const,
    gap: SPACING.md,
    alignItems: "center" as const,
  },
  statsButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  statsButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  webAddButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  webSearchInput: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: "100%" as const,
    maxWidth: 400,
  },
  webProductsContainer: {
    padding: SPACING.lg,
    flex: 1,
  },

  // Estilos para header estilo ParallaxScrollView en web
  webParallaxHeader: {
    height: 180,
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  webHeaderBackground: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webBackgroundImage: {
    width: "100%" as const,
    height: "100%" as const,
    position: "absolute" as const,
  },
  webHeaderOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)" as any,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    flexDirection: "row" as const,
    gap: SPACING.lg,
  },
  webLogoContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  webLogoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)" as any,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    ...SHADOWS.md,
  },
  webLogoImage: {
    width: 50,
    height: 50,
  },
  webTitleContainer: {
    alignItems: "center" as const,
  },
  webMainTitle: {
    fontSize: 32,
    fontWeight: "bold" as const,
    color: COLORS.surface,
    textAlign: "center" as const,
    ...SHADOWS.sm,
  },
  webSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)" as any,
    textAlign: "center" as const,
    marginTop: SPACING.xs,
  },
  webSearchSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  webSearchContainer: {
    maxWidth: 600,
    alignSelf: "center" as const,
  },
  webLayoutFullHeight: {
    flex: 1,
    flexDirection: "column" as const,
    height: "100vh" as any,
    backgroundColor: COLORS.background,
  },
  webParallaxHeaderFullWidth: {
    height: 200,
    width: "100%" as const,
    position: "relative" as const,
    overflow: "hidden" as const,
    marginBottom: 0,
  },
  webContentWithSidebar: {
    flex: 1,
    flexDirection: "row" as const,
    backgroundColor: COLORS.background,
  },
  // Estilos para modal web tipo "paper"
  webModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)" as any,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: SPACING.lg,
  },
  webModalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    maxWidth: 600,
    maxHeight: "90%" as any,
    width: "100%" as const,
    ...SHADOWS.lg,
    overflow: "hidden" as const,
  },
  webModalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  webModalTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: COLORS.text,
  },
  webModalCloseButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.sm,
    minWidth: 32,
    minHeight: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  webModalCloseText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  webModalContent: {
    flex: 1,
  },
  webModalContentContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.lg,
  },
  webModalActions: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  // Estilos para modal de Instagram
  instagramModalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    maxWidth: 800,
    maxHeight: "90%" as any,
    width: "100%" as const,
    ...SHADOWS.lg,
    overflow: "hidden" as const,
  },
  instagramPreviewContainer: {
    padding: SPACING.lg,
    alignItems: "center" as const,
  },
  storyPreview: {
    width: 300,
    height: 533, // Proporción 9:16 de Instagram Stories
    borderRadius: RADIUS.lg,
    overflow: "hidden" as const,
    position: "relative" as const,
    ...SHADOWS.md,
  },
  storyBackground: {
    width: "100%" as const,
    height: "100%" as const,
    position: "absolute" as const,
  },
  storyContent: {
    flex: 1,
    padding: SPACING.md, // Reducido de SPACING.lg para menos padding
    justifyContent: "space-between" as const,
    position: "relative" as const,
  },
  storyProductImageContainer: {
    alignItems: "center" as const,
    marginTop: SPACING.md, // Reducido de SPACING.xl
  },
  storyProductImage: {
    width: 250, // Aumentado de 200 a 250
    height: 250, // Aumentado de 200 a 250
    borderRadius: RADIUS.lg,
    backgroundColor: "rgba(255, 255, 255, 0.9)" as any,
    padding: SPACING.sm, // Reducido de SPACING.md para menos padding interno
  },
  // Estilos para contenedor mejorado de categoría
  storyCategoryContainer: {
    alignItems: "center" as const,
    marginBottom: SPACING.sm,
  },
  storyCategoryBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.95)" as any,
    borderWidth: 2,
    borderColor: "rgba(100, 149, 237, 1)" as any,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: SPACING.xs,
  },
  storyCategoryIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(100, 149, 237, 0.2)" as any,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  storyCategoryIconText: {
    fontSize: 12,
  },
  // Estilo para categoría arriba de la imagen (legacy)
  storyCategoryBoxTop: {
    backgroundColor: "rgba(100, 149, 237, 0.9)" as any,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    alignItems: "center" as const,
    alignSelf: "center" as const,
    minWidth: 100,
  },
  storyCategoryBox: {
    backgroundColor: "rgba(100, 149, 237, 0.9)" as any, // Azul cornflower semi-transparente
    paddingVertical: SPACING.xs, // Reducido de SPACING.sm
    paddingHorizontal: SPACING.md, // Reducido de SPACING.lg
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm, // Reducido de SPACING.md
    marginBottom: SPACING.sm, // Reducido de SPACING.md
    alignItems: "center" as const,
    alignSelf: "center" as const,
    minWidth: 100, // Reducido de 120
  },
  storyCategoryText: {
    color: "rgba(100, 149, 237, 1)" as any, // Azul que coincide con el borde
    fontSize: 12, // Aumentado para mejor legibilidad
    fontWeight: "700" as const, // Más bold
    textAlign: "center" as const,
    textTransform: "uppercase" as any,
    letterSpacing: 0.8,
  },
  storyProductInfo: {
    backgroundColor: "rgba(0, 0, 0, 0.7)" as any,
    padding: SPACING.md, // Reducido de SPACING.lg
    borderRadius: RADIUS.lg,
    alignItems: "center" as const,
  },
  storyText: {
    color: "#FFFFFF" as const,
    fontSize: 13, // Reducido de 16
    textAlign: "center" as const,
    marginBottom: SPACING.xs,
  },
  storyTextBold: {
    color: "#FFFFFF" as const,
    fontSize: 16, // Reducido de 20
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginBottom: SPACING.sm,
  },
  storyPrice: {
    color: "#FFD700" as const, // Dorado para destacar el precio
    fontSize: 20, // Reducido de 24
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginBottom: SPACING.sm,
  },
  storyDescription: {
    color: "#FFFFFF" as const,
    fontSize: 12, // Reducido de 14
    textAlign: "center" as const,
    fontStyle: "italic" as const,
  },
  instagramOptions: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    margin: SPACING.lg,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: "center" as const,
  },
  checkboxContainer: {
    gap: SPACING.md,
  },
  checkboxRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: "#FFFFFF" as const,
    fontSize: 16,
    fontWeight: "bold" as const,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  instagramShareButton: {
    backgroundColor: "#E4405F" as const, // Color oficial de Instagram
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  instagramButtonText: {
    color: "#FFFFFF" as const,
    fontSize: 16,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
  storyConsultaBox: {
    backgroundColor: "rgba(173, 216, 230, 0.9)" as any, // Azul pastel (light blue)
    paddingVertical: SPACING.xs, // Reducido más
    paddingHorizontal: SPACING.sm, // Reducido más
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    alignItems: "center" as const,
    alignSelf: "center" as const,
    minWidth: 180, // Reducido
  },
  storyConsultaBoxInside: {
    backgroundColor: "rgba(173, 216, 230, 0.9)" as any, // Azul pastel (light blue)
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm, // Menos margen cuando está dentro
    alignItems: "center" as const,
    alignSelf: "center" as const,
    minWidth: 180,
  },
  storyConsultaText: {
    color: "#2F4F4F" as const, // Gris oscuro para contraste con el pastel
    fontSize: 11, // Reducido de 13
    fontWeight: "700" as const,
    textAlign: "center" as const,
  },
  // Estilos para modal de filtros
  filtersModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filtersModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filtersModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  filtersModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersModalCloseText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  filtersModalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  filtersSection: {
    marginBottom: SPACING.lg,
  },
  filtersModalActions: {
    flexDirection: "row",
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  clearAllFiltersButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  clearAllFiltersText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  applyFiltersText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos para contenedor de categoría pequeño debajo de la imagen
  storyCategoryContainerBelow: {
    alignItems: "center" as const,
    marginTop: SPACING.xs,
  },
  storyCategoryBadgeSmall: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.95)" as any,
    borderWidth: 1.5,
    borderColor: "rgba(100, 149, 237, 1)" as any,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs / 2,
    paddingHorizontal: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
    gap: SPACING.xs / 2,
  },
  storyCategoryIconSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(100, 149, 237, 0.2)" as any,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  storyCategoryIconTextSmall: {
    fontSize: 9,
  },
  storyCategoryTextSmall: {
    color: "rgba(100, 149, 237, 1)" as any,
    fontSize: 10,
    fontWeight: "600" as const,
    textAlign: "center" as const,
    textTransform: "uppercase" as any,
    letterSpacing: 0.5,
  },
});
