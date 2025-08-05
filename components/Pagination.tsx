import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { ThemedText } from "./ThemedText";
import { COLORS, SPACING, RADIUS } from "../constants/theme";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

interface PaginationMetadata {
  pagina: number;
  limite: number;
  total: number;
  paginas: number;
  tienePaginaAnterior?: boolean;
  tienePaginaSiguiente?: boolean;
  paginaAnterior?: number;
  paginaSiguiente?: number;
}

interface PaginationComponentProps {
  pagination: PaginationMetadata;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const Pagination: React.FC<PaginationComponentProps> = ({
  pagination,
  onPageChange,
  loading = false,
}) => {
  if (!pagination || pagination.paginas <= 1) {
    return null;
  }

  const {
    pagina: currentPage,
    total,
    limite,
    paginas: totalPages,
  } = pagination;
  const startItem = (currentPage - 1) * limite + 1;
  const endItem = Math.min(currentPage * limite, total);

  // Generar números de páginas a mostrar
  const getPageNumbers = () => {
    const delta = Platform.OS === "web" ? 2 : 1; // Mostrar más páginas en web
    const range = [];
    const rangeWithDots = [];

    // Siempre mostrar primera página
    if (currentPage > delta + 2) {
      range.push(1);
      if (currentPage > delta + 3) {
        range.push("...");
      }
    }

    // Páginas alrededor de la actual
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Siempre mostrar última página
    if (currentPage < totalPages - delta - 1) {
      if (currentPage < totalPages - delta - 2) {
        range.push("...");
      }
      range.push(totalPages);
    }

    return range;
  };

  return (
    <View style={styles.container}>
      {/* Información de elementos */}
      <View style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>
          Mostrando {startItem}-{endItem} de {total} productos
        </ThemedText>
      </View>

      {/* Controles de paginación */}
      <View style={styles.paginationContainer}>
        {/* Botón anterior */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            styles.navButton,
            (!pagination.tienePaginaAnterior || loading) &&
              styles.disabledButton,
          ]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={!pagination.tienePaginaAnterior || loading}
        >
          <ThemedText
            style={[
              styles.navButtonText,
              (!pagination.tienePaginaAnterior || loading) &&
                styles.disabledText,
            ]}
          >
            {Platform.OS === "web" ? "‹ Anterior" : "‹"}
          </ThemedText>
        </TouchableOpacity>

        {/* Números de página */}
        <View style={styles.pageNumbersContainer}>
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === "...") {
              return (
                <View key={`dots-${index}`} style={styles.dotsContainer}>
                  <ThemedText style={styles.dotsText}>...</ThemedText>
                </View>
              );
            }

            const isCurrentPage = pageNum === currentPage;
            return (
              <TouchableOpacity
                key={pageNum}
                style={[
                  styles.pageButton,
                  styles.pageNumberButton,
                  isCurrentPage && styles.currentPageButton,
                  loading && styles.disabledButton,
                ]}
                onPress={() => onPageChange(pageNum as number)}
                disabled={isCurrentPage || loading}
              >
                <ThemedText
                  style={[
                    styles.pageNumberText,
                    isCurrentPage && styles.currentPageText,
                    loading && styles.disabledText,
                  ]}
                >
                  {pageNum}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón siguiente */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            styles.navButton,
            (!pagination.tienePaginaSiguiente || loading) &&
              styles.disabledButton,
          ]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={!pagination.tienePaginaSiguiente || loading}
        >
          <ThemedText
            style={[
              styles.navButtonText,
              (!pagination.tienePaginaSiguiente || loading) &&
                styles.disabledText,
            ]}
          >
            {Platform.OS === "web" ? "Siguiente ›" : "›"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: "center" as const,
    gap: SPACING.md,
  },
  infoContainer: {
    alignItems: "center" as const,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500" as const,
  },
  paginationContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: Platform.OS === "web" ? SPACING.sm : SPACING.xs,
  },
  pageNumbersContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: Platform.OS === "web" ? SPACING.xs : 4,
  },
  pageButton: {
    paddingHorizontal: Platform.OS === "web" ? SPACING.sm : SPACING.xs,
    paddingVertical: Platform.OS === "web" ? SPACING.sm : SPACING.xs,
    borderRadius: RADIUS.sm,
    minWidth: Platform.OS === "web" ? 40 : 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  navButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: Platform.OS === "web" ? SPACING.md : SPACING.sm,
  },
  pageNumberButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currentPageButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: COLORS.background,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: COLORS.text,
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: COLORS.text,
  },
  currentPageText: {
    color: COLORS.surface,
    fontWeight: "600" as const,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  dotsContainer: {
    paddingHorizontal: SPACING.xs,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  dotsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500" as const,
  },
};

export default Pagination;
