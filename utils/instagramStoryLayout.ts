import { InstagramStoryRenderData } from "./instagramStoryRenderer";

export const INSTAGRAM_STORY_SIZE = {
  width: 1080,
  height: 1920,
} as const;

export const INSTAGRAM_STORY_SAFE_AREA = {
  horizontal: 96,
  top: 150,
  bottom: 190,
} as const;

const PANEL_BASE_HEIGHT = 72;
const PRODUCT_PANEL_GAP = 44;
const CONSULTATION_HEIGHT = 92;
const CONSULTATION_GAP = 28;

export interface StoryLayout {
  contentWidth: number;
  image: { x: number; y: number; width: number; height: number };
  panel: { x: number; y: number; width: number; height: number } | null;
  consultation: { x: number; y: number; width: number; height: number } | null;
}

export interface ImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const hasInstagramStoryProductInfo = (
  data: InstagramStoryRenderData
): boolean =>
  Boolean(
    data.categoria ||
      data.modelo ||
      data.marca ||
      data.precio ||
      data.stock ||
      data.descripcion
  );

export const calculateInstagramStoryPanelHeight = (
  data: InstagramStoryRenderData,
  descriptionLineCount = data.descripcion ? 1 : 0
): number => {
  if (!hasInstagramStoryProductInfo(data)) return 0;

  let height = PANEL_BASE_HEIGHT;
  if (data.categoria) height += 46;
  if (data.modelo) height += 66;
  if (data.marca) height += 46;
  if (data.precio) height += 126;
  if (data.stock) height += 48;
  if (data.descripcion) height += Math.max(1, descriptionLineCount) * 40 + 16;
  return height;
};

export const calculateInstagramStoryLayout = (
  data: InstagramStoryRenderData,
  descriptionLineCount = data.descripcion ? 1 : 0
): StoryLayout => {
  const { width, height } = INSTAGRAM_STORY_SIZE;
  const safeArea = INSTAGRAM_STORY_SAFE_AREA;
  const contentWidth = width - safeArea.horizontal * 2;
  const panelHeight = calculateInstagramStoryPanelHeight(
    data,
    descriptionLineCount
  );
  const consultationHeight = data.consultaPrecio ? CONSULTATION_HEIGHT : 0;
  const consultationGap = data.consultaPrecio ? CONSULTATION_GAP : 0;
  const panelBottom =
    height - safeArea.bottom - consultationHeight - consultationGap;
  const panelY = panelBottom - panelHeight;
  const imageBottom = panelHeight ? panelY - PRODUCT_PANEL_GAP : panelBottom;

  return {
    contentWidth,
    image: {
      x: safeArea.horizontal,
      y: safeArea.top,
      width: contentWidth,
      height: Math.max(400, imageBottom - safeArea.top),
    },
    panel: panelHeight
      ? {
          x: safeArea.horizontal,
          y: panelY,
          width: contentWidth,
          height: panelHeight,
        }
      : null,
    consultation: data.consultaPrecio
      ? {
          x: safeArea.horizontal,
          y: height - safeArea.bottom - CONSULTATION_HEIGHT,
          width: contentWidth,
          height: CONSULTATION_HEIGHT,
        }
      : null,
  };
};

export const calculateContainedImageRect = (
  sourceWidth: number,
  sourceHeight: number,
  bounds: ImageRect
): ImageRect => {
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error("La imagen debe tener dimensiones válidas.");
  }

  const scale = Math.min(
    bounds.width / sourceWidth,
    bounds.height / sourceHeight
  );
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;

  return {
    x: bounds.x + (bounds.width - width) / 2,
    y: bounds.y + (bounds.height - height) / 2,
    width,
    height,
  };
};
