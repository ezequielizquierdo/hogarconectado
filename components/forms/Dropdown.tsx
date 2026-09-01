import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  style?: any;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  accessibilityLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  createLabel?: string;
  onCreate?: (label: string) => Promise<string | void>;
}

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function Dropdown({
  options,
  selectedValue,
  onSelect,
  placeholder = "Seleccionar...",
  style,
  loading = false,
  error = null,
  onRetry,
  accessibilityLabel = "Seleccionar una opción",
  searchable = false,
  searchPlaceholder = "Buscar...",
  createLabel = "Agregar",
  onCreate,
}: DropdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return options;
    return options.filter(option => normalize(option.label).includes(normalizedQuery));
  }, [options, query]);

  const canCreate = Boolean(
    onCreate && query.trim() && !options.some(option => normalize(option.label) === normalize(query))
  );

  const open = () => {
    setQuery("");
    setCreateError("");
    setIsVisible(true);
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsVisible(false);
    setQuery("");
  };

  const handleCreate = async () => {
    if (!onCreate || !query.trim() || creating) return;
    setCreating(true);
    setCreateError("");
    try {
      const value = await onCreate(query.trim());
      if (value) onSelect(value);
      setIsVisible(false);
      setQuery("");
    } catch {
      setCreateError("No pudimos agregar la opción. Intentá nuevamente.");
    } finally {
      setCreating(false);
    }
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={styles.option}
      onPress={() => handleSelect(item.value)}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: item.value === selectedValue }}
    >
      <ThemedText style={styles.optionText}>{item.label}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dropdown,
          style,
          error && styles.dropdownError,
          loading && styles.dropdownDisabled,
          isFocused && styles.dropdownFocused,
        ]}
        onPress={() => !loading && open()}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={error || placeholder}
        accessibilityState={{ disabled: loading, expanded: isVisible }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <>
            <ThemedText
              style={[
                styles.dropdownText,
                !selectedOption && styles.placeholderText,
              ]}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </ThemedText>
            <ThemedText style={styles.arrow}>▼</ThemedText>
          </>
        )}
      </TouchableOpacity>

      {error ? (
        <ThemedView style={styles.errorRow}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          {onRetry ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Reintentar carga de opciones"
              onPress={onRetry}
              style={styles.retryButton}
            >
              <ThemedText style={styles.retryText}>Reintentar</ThemedText>
            </TouchableOpacity>
          ) : null}
        </ThemedView>
      ) : null}

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar selector"
          />
          <ThemedView style={styles.modalContent}>
            {searchable ? (
              <View style={styles.searchArea}>
                <TextInput
                  autoFocus
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={COLORS.textLight}
                  style={styles.searchInput}
                  accessibilityLabel={searchPlaceholder}
                />
                {createError ? <ThemedText style={styles.createError}>{createError}</ThemedText> : null}
              </View>
            ) : null}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={renderOption}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <ThemedText style={styles.emptyText}>No encontramos coincidencias.</ThemedText>
              }
            />
            {canCreate ? (
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreate}
                disabled={creating}
                accessibilityRole="button"
                accessibilityLabel={`${createLabel} ${query.trim()}`}
              >
                {creating ? <ActivityIndicator size="small" color={COLORS.text} /> : null}
                <ThemedText style={styles.createButtonText}>+ {createLabel} “{query.trim()}”</ThemedText>
              </TouchableOpacity>
            ) : null}
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 56,
    ...SHADOWS.sm,
  },
  dropdownError: {
    borderColor: COLORS.error,
  },
  dropdownFocused: {
    borderColor: COLORS.primaryDark,
  },
  dropdownDisabled: {
    backgroundColor: COLORS.cardBackground,
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    flex: 1,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    marginHorizontal: SPACING.sm,
    backgroundColor: "transparent",
  },
  retryButton: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.accent,
  },
  retryText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
  arrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    width: "100%",
    maxWidth: 560,
    maxHeight: "60%",
    ...SHADOWS.lg,
  },
  searchArea: { padding: SPACING.md, paddingBottom: SPACING.sm },
  searchInput: { minHeight: 44, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, color: COLORS.text, backgroundColor: COLORS.cardBackground },
  createError: { marginTop: SPACING.xs, color: COLORS.errorStrong, fontSize: 12 },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  emptyText: { padding: SPACING.lg, color: COLORS.textSecondary, textAlign: "center" },
  createButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, margin: SPACING.md, marginTop: SPACING.sm, borderRadius: RADIUS.md, backgroundColor: COLORS.secondary },
  createButtonText: { color: COLORS.text, fontWeight: "700" },
});
