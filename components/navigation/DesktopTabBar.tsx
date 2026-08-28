import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useDesktopHeader } from "@/contexts/DesktopHeaderContext";
import { useConsultasResumen } from "@/contexts/ConsultasContext";

type DesktopTabBarProps = BottomTabBarProps & {
  isAdmin: boolean;
  isAuthenticated: boolean;
};

type NavigationItemProps = {
  label: string;
  focused: boolean;
  icon?: React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
  badge?: number;
};

const PRIMARY_ROUTES = ["index", "explore_new", "productos", "calculadora", "consultas"];
const SECONDARY_ROUTES = ["usuarios", "perfil", "explore_clean"];

const ACCOUNT_LABELS: Record<string, string> = {
  usuarios: "Usuarios",
  perfil: "Perfil",
  explore_clean: "Contacto",
};

function NavigationItem({
  label,
  focused,
  icon,
  onPress,
  onLongPress,
  badge = 0,
}: NavigationItemProps) {
  const [hovered, setHovered] = React.useState(false);
  const [keyboardFocused, setKeyboardFocused] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setKeyboardFocused(true)}
      onBlur={() => setKeyboardFocused(false)}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      style={({ pressed }) => [
        styles.item,
        focused && styles.itemActive,
        (hovered || keyboardFocused) && !focused && styles.itemHovered,
        keyboardFocused && styles.itemFocused,
        pressed && styles.itemPressed,
      ]}
    >
      <View style={styles.icon}>{icon}</View>
      <Text
        numberOfLines={1}
        style={[styles.itemLabel, focused && styles.itemLabelActive]}
      >
        {label}
      </Text>
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function DesktopTabBar({
  state,
  descriptors,
  navigation,
  isAdmin,
  isAuthenticated,
}: DesktopTabBarProps) {
  const router = useRouter();
  const { action } = useDesktopHeader();
  const { nuevas } = useConsultasResumen();
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const routesByName = new Map(state.routes.map((route) => [route.name, route]));

  const visibleRoutes = (routeNames: string[]) => {
    if (!isAdmin) {
      if (routeNames === PRIMARY_ROUTES) return ["productos"];
      return isAuthenticated ? ["perfil"] : [];
    }
    return routeNames;
  };

  const navigate = (routeName: string) => {
    const route = routesByName.get(routeName);
    if (!route) return;

    const focused = state.index === state.routes.indexOf(route);
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!focused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
    setAccountMenuOpen(false);
  };

  const renderItems = (routeNames: string[]) =>
    visibleRoutes(routeNames).map((routeName) => {
      const route = routesByName.get(routeName);
      if (!route) return null;

      const options = descriptors[route.key].options;
      const focused = state.index === state.routes.indexOf(route);
      const color = focused ? COLORS.primaryDark : COLORS.textSecondary;
      const label =
        typeof options.title === "string" ? options.title : route.name;

      return (
        <NavigationItem
          key={route.key}
          label={label}
          focused={focused}
          onPress={() => navigate(routeName)}
          onLongPress={() =>
            navigation.emit({ type: "tabLongPress", target: route.key })
          }
          icon={options.tabBarIcon?.({ focused, color, size: 22 })}
          badge={routeName === "consultas" ? nuevas : 0}
        />
      );
    });

  return (
    <View style={styles.topBar} accessibilityRole="tablist">
      <View style={styles.brand}>
        <Image
          source={require("@/assets/images/logo-transparent-circle.png")}
          style={styles.brandLogo}
          contentFit="contain"
          accessibilityLabel="Logo de Hogar Conectado"
        />
        <View style={styles.brandCopy}>
          <Text style={styles.brandName}>Hogar Conectado</Text>
          <Text numberOfLines={1} style={styles.brandDescription}>
            Tu vidriera operativa
          </Text>
        </View>
      </View>

      <View style={styles.primaryNavigation}>
        {renderItems(PRIMARY_ROUTES)}
      </View>

      <View style={styles.secondaryNavigation}>
        {action && (
          <Pressable
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            style={({ pressed }) => [
              styles.contextAction,
              pressed && styles.itemPressed,
            ]}
          >
            <MaterialIcons name="add" size={20} color={COLORS.ink} />
            <Text style={styles.contextActionLabel}>{action.label}</Text>
          </Pressable>
        )}

        <View style={styles.accountMenuContainer}>
          <Pressable
            onPress={() => {
              if (!isAuthenticated) {
                router.push('/login');
                return;
              }
              setAccountMenuOpen((current) => !current);
            }}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú de cuenta"
            accessibilityState={{ expanded: accountMenuOpen }}
            style={({ pressed }) => [
              styles.accountButton,
              accountMenuOpen && styles.accountButtonActive,
              pressed && styles.itemPressed,
            ]}
          >
            <MaterialIcons
              name="account-circle"
              size={24}
              color={COLORS.textSecondary}
            />
            <Text style={styles.accountButtonLabel}>
              {isAuthenticated ? "Cuenta" : "Ingresar"}
            </Text>
            {isAuthenticated && <MaterialIcons
                name={accountMenuOpen ? "expand-less" : "expand-more"}
                size={20}
                color={COLORS.textSecondary}
              />}
          </Pressable>

          {isAuthenticated && accountMenuOpen && (
            <View style={styles.accountMenu} accessibilityRole="menu">
              {visibleRoutes(SECONDARY_ROUTES).map((routeName) => {
                const route = routesByName.get(routeName);
                if (!route) return null;
                const focused = state.index === state.routes.indexOf(route);

                return (
                  <Pressable
                    key={route.key}
                    onPress={() => navigate(routeName)}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: focused }}
                    style={({ pressed }) => [
                      styles.accountMenuItem,
                      focused && styles.accountMenuItemActive,
                      pressed && styles.itemPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.accountMenuItemLabel,
                        focused && styles.itemLabelActive,
                      ]}
                    >
                      {ACCOUNT_LABELS[routeName]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4ff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  brand: {
    minWidth: 230,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  brandLogo: {
    width: 50,
    height: 50,
  },
  brandCopy: {
    flex: 1,
  },
  brandName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 21,
  },
  brandDescription: {
    marginTop: 2,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  primaryNavigation: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  secondaryNavigation: {
    minWidth: 280,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: SPACING.xs,
  },
  contextAction: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  contextActionLabel: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  accountMenuContainer: {
    position: "relative",
  },
  accountButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  accountButtonActive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderFocus,
  },
  accountButtonLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  accountMenu: {
    position: "absolute",
    top: 50,
    right: 0,
    zIndex: 120,
    width: 180,
    padding: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  accountMenuItem: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  accountMenuItemActive: {
    backgroundColor: COLORS.cardBackground,
  },
  accountMenuItemLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  item: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  itemActive: {
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.primaryDark,
  },
  itemHovered: {
    backgroundColor: COLORS.cardBackground,
  },
  itemFocused: {
    outlineColor: COLORS.primaryDark,
    outlineStyle: "solid",
    outlineWidth: 2,
  },
  itemPressed: {
    opacity: 0.78,
  },
  icon: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error,
  },
  badgeText: {
    color: COLORS.ink,
    fontSize: 10,
    fontWeight: "800",
  },
  itemLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  itemLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
});
