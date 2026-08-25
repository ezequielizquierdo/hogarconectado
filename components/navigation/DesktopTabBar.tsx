import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type DesktopTabBarProps = BottomTabBarProps & {
  showUsers: boolean;
};

type NavigationItemProps = {
  label: string;
  focused: boolean;
  icon?: React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
};

const PRIMARY_ROUTES = ["index", "explore_new", "productos", "calculadora"];
const SECONDARY_ROUTES = ["usuarios", "perfil", "explore_clean"];

function NavigationItem({
  label,
  focused,
  icon,
  onPress,
  onLongPress,
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
    </Pressable>
  );
}

export function DesktopTabBar({
  state,
  descriptors,
  navigation,
  showUsers,
}: DesktopTabBarProps) {
  const routesByName = new Map(state.routes.map((route) => [route.name, route]));

  const visibleRoutes = (routeNames: string[]) =>
    routeNames.filter(
      (routeName) => routeName !== "usuarios" || showUsers,
    );

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
        />
      );
    });

  return (
    <View style={styles.topBar} accessibilityRole="tablist">
      <View style={styles.brand}>
        <Text style={styles.brandName}>Hogar Conectado</Text>
        <Text style={styles.brandDescription}>Tu vidriera operativa</Text>
      </View>

      <View style={styles.primaryNavigation}>
        {renderItems(PRIMARY_ROUTES)}
      </View>

      <View style={styles.secondaryNavigation}>
        {renderItems(SECONDARY_ROUTES)}
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    shadowColor: "#1D2440",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  brand: {
    minWidth: 190,
    paddingRight: SPACING.lg,
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
    minWidth: 265,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: SPACING.xs,
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
