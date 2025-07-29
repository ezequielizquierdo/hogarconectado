import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { Producto } from "@/services/types";

interface ModeloDropdownProps {
  label: string;
  required?: boolean;
  productos: Producto[];
  selectedValue: string;
  onSelect: (modelo: string, producto: Producto) => void;
  placeholder?: string;
  style?: any;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

export default function ModeloDropdown({
  label,
  required = false,
  productos,
  selectedValue,
  onSelect,
  placeholder = "Seleccionar modelo...",
  style,
  loading = false,
  error = null,
  disabled = false,
}: ModeloDropdownProps) {
  const [isVisible, setIsVisible] = useState(false);

  const modelos = productos.map((producto) => ({
    modelo: producto.modelo,
    producto: producto,
  }));

  const handleSelect = (modelo: string, producto: Producto) => {
    onSelect(modelo, producto);
    setIsVisible(false);
  };

  const renderModelo = ({
    item,
  }: {
    item: { modelo: string; producto: Producto };
  }) => (
    <TouchableOpacity
      style={styles.option}
      onPress={() => handleSelect(item.modelo, item.producto)}
    >
      <View style={styles.modeloInfo}>
        <ThemedText style={styles.modeloText}>{item.modelo}</ThemedText>
        <ThemedText style={styles.precioText}>
          $
          {item.producto.precioBase
            ? Number(item.producto.precioBase).toLocaleString()
            : "N/A"}
        </ThemedText>
      </View>
      {item.producto.descripcion && (
        <ThemedText style={styles.descripcionText}>
          {item.producto.descripcion}
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  const selectedProducto = productos.find((p) => p.modelo === selectedValue);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.label}>
          {label}{" "}
          {required && <ThemedText style={styles.required}>*</ThemedText>}
        </ThemedText>
      </View>

      <TouchableOpacity
        style={[
          styles.dropdown,
          disabled && styles.disabled,
          error && styles.error,
          style,
        ]}
        onPress={() => !disabled && !loading && setIsVisible(true)}
        disabled={disabled || loading}
      >
        <View style={styles.dropdownContent}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <ThemedText
                style={[
                  styles.selectedText,
                  !selectedValue && styles.placeholderText,
                ]}
                numberOfLines={1}
              >
                {selectedValue || placeholder}
              </ThemedText>
              {selectedProducto && (
                <ThemedText style={styles.selectedPrecio}>
                  ${Number(selectedProducto.precioBase || 0).toLocaleString()}
                </ThemedText>
              )}
            </>
          )}
        </View>
        <ThemedText style={styles.arrow}>▼</ThemedText>
      </TouchableOpacity>

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      <Modal visible={isVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Seleccionar Modelo
              </ThemedText>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            {modelos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  No hay modelos disponibles
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={modelos}
                keyExtractor={(item, index) => `${item.modelo}-${index}`}
                renderItem={renderModelo}
                style={styles.list}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  labelContainer: {
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  required: {
    color: COLORS.error,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 50,
    ...SHADOWS.sm,
  },
  disabled: {
    backgroundColor: COLORS.surface,
    opacity: 0.6,
  },
  error: {
    borderColor: COLORS.error,
  },
  dropdownContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  selectedText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedPrecio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  arrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    maxHeight: "80%",
    width: "100%",
    maxWidth: 400,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 20,
    color: COLORS.textSecondary,
    padding: SPACING.xs,
  },
  list: {
    maxHeight: 300,
  },
  option: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modeloInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  modeloText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    flex: 1,
  },
  precioText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  descripcionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
