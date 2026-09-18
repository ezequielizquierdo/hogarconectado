import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ImageStyle, Platform, StyleProp, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { COLORS, RADIUS } from "@/constants/theme";

const imageCache = new Map<string, string>();
const pendingImageRequests = new Map<string, Promise<string>>();
let lastImageRequestAt = 0;

async function resolveImageUri(originalUrl: string): Promise<string> {
  if (originalUrl.startsWith("data:")) return originalUrl;

  const cachedUrl = imageCache.get(originalUrl);
  if (cachedUrl) return cachedUrl;

  const pendingRequest = pendingImageRequests.get(originalUrl);
  if (pendingRequest) return pendingRequest;

  const isLegacyLocalUrl =
    originalUrl.includes("192.168.1.13:3000") ||
    originalUrl.includes("localhost:3000");

  if (Platform.OS !== "web" || !isLegacyLocalUrl) {
    imageCache.set(originalUrl, originalUrl);
    return originalUrl;
  }

  const request = (async () => {
    try {
      const elapsed = Date.now() - lastImageRequestAt;
      if (elapsed < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
      }
      lastImageRequestAt = Date.now();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000);

      try {
        const response = await fetch(originalUrl, {
          signal: controller.signal,
          mode: "cors",
          headers: {
            Accept: "image/*",
            "Cache-Control": "max-age=3600",
          },
        });

        if (!response.ok) return originalUrl;

        const blob = await response.blob();
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch {
      return originalUrl;
    }
  })();

  pendingImageRequests.set(originalUrl, request);
  const resolvedUrl = await request;
  pendingImageRequests.delete(originalUrl);
  imageCache.set(originalUrl, resolvedUrl);
  return resolvedUrl;
}

interface SmartProductImageProps {
  source: { uri: string };
  style: StyleProp<ImageStyle>;
  onError?: (error: unknown) => void;
  onLoad?: () => void;
}

export function SmartProductImage({
  source,
  style,
  onError,
  onLoad,
}: SmartProductImageProps) {
  const [imageUri, setImageUri] = useState(source.uri);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setHasError(false);

    resolveImageUri(source.uri)
      .then((uri) => {
        if (active) setImageUri(uri);
      })
      .catch(() => {
        if (active) {
          setImageUri(source.uri);
          setHasError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [source.uri]);

  if (loading || hasError) {
    return (
      <View
        style={[
          style,
          {
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.surface,
            borderColor: hasError ? COLORS.border : undefined,
            borderRadius: RADIUS.md,
            borderWidth: hasError ? 1 : 0,
          },
        ]}
      >
        <ThemedText style={{ color: COLORS.textSecondary, fontSize: hasError ? 20 : 28 }}>
          {hasError ? "❌" : "📷"}
        </ThemedText>
        {hasError ? (
          <ThemedText
            style={{ color: COLORS.textSecondary, fontSize: 10, textAlign: "center" }}
          >
            Error cargando imagen
          </ThemedText>
        ) : null}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUri }}
      style={style}
      onError={(event) => {
        setHasError(true);
        onError?.(event);
      }}
      onLoad={() => {
        setHasError(false);
        onLoad?.();
      }}
      contentFit="cover"
    />
  );
}
