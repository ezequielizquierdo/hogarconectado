import { InstagramStoryRenderData } from "./instagramStoryRenderer";
import {
  calculateContainedImageRect,
  calculateInstagramStoryLayout,
  INSTAGRAM_STORY_SAFE_AREA,
  INSTAGRAM_STORY_SIZE,
} from "./instagramStoryLayout";

const STORY_WIDTH = INSTAGRAM_STORY_SIZE.width;
const STORY_HEIGHT = INSTAGRAM_STORY_SIZE.height;
const SAFE_MARGIN_X = INSTAGRAM_STORY_SAFE_AREA.horizontal;
const CONTENT_WIDTH = STORY_WIDTH - SAFE_MARGIN_X * 2;

const PANEL_COLOR = "#45413B";
const TEXT_COLOR = "#FFFFFF";
const PRICE_COLOR = "#FFD700";
const CONSULTA_COLOR = "#D7EEF2";

const loadImage = (source: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("No se pudo cargar una imagen de la historia."));
    image.src = source;
  });

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
};

const drawImageCover = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
};

const drawImageContain = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const rect = calculateContainedImageRect(
    image.naturalWidth,
    image.naturalHeight,
    { x, y, width, height }
  );
  context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
};

const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) lines.push(currentLine);
    currentLine = word;
    if (lines.length === maxLines - 1) break;
  }

  if (currentLine && lines.length < maxLines) lines.push(currentLine);
  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) {
    let finalLine = lines[maxLines - 1];
    while (context.measureText(`${finalLine}…`).width > maxWidth) {
      finalLine = finalLine.slice(0, -1);
    }
    lines[maxLines - 1] = `${finalLine}…`;
  }

  return lines;
};

const drawCenteredText = (
  context: CanvasRenderingContext2D,
  text: string,
  y: number
) => {
  context.fillText(text, STORY_WIDTH / 2, y);
};

const findBackgroundSource = (target: HTMLElement): string => {
  const image = target.querySelector<HTMLImageElement>("img");
  const source = image?.currentSrc || image?.src;
  if (!source) throw new Error("No se encontró el fondo de la historia.");
  return source;
};

export async function captureWebStory(
  target: unknown,
  filename: string,
  data: InstagramStoryRenderData
): Promise<File> {
  if (!(target instanceof HTMLElement)) {
    throw new Error("No se encontró la vista previa de la historia.");
  }

  const backgroundSource = findBackgroundSource(target);
  const [backgroundImage, productImage] = await Promise.all([
    loadImage(backgroundSource),
    data.imageUrl ? loadImage(data.imageUrl) : Promise.resolve(null),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar el lienzo de la historia.");
  }

  context.textAlign = "center";
  context.textBaseline = "middle";
  drawImageCover(context, backgroundImage, 0, 0, STORY_WIDTH, STORY_HEIGHT);

  context.font = "italic 32px Arial, sans-serif";
  const descriptionLines = data.descripcion
    ? wrapText(context, data.descripcion, CONTENT_WIDTH - 112, 3)
    : [];
  const layout = calculateInstagramStoryLayout(data, descriptionLines.length);
  const { image: imageLayout, panel, consultation } = layout;

  if (productImage) {
    roundedRect(
      context,
      imageLayout.x,
      imageLayout.y,
      imageLayout.width,
      imageLayout.height,
      44
    );
    context.fillStyle = "rgba(255, 255, 255, 0.94)";
    context.fill();
    context.save();
    roundedRect(
      context,
      imageLayout.x,
      imageLayout.y,
      imageLayout.width,
      imageLayout.height,
      44
    );
    context.clip();
    drawImageContain(
      context,
      productImage,
      imageLayout.x + 32,
      imageLayout.y + 32,
      imageLayout.width - 64,
      imageLayout.height - 64
    );
    context.restore();
  }

  if (panel) {
    roundedRect(context, panel.x, panel.y, panel.width, panel.height, 44);
    context.fillStyle = PANEL_COLOR;
    context.fill();
  }

  let textY = (panel?.y ?? 0) + 44;
  context.fillStyle = TEXT_COLOR;

  if (data.categoria) {
    context.font = "700 32px Arial, sans-serif";
    drawCenteredText(context, data.categoria.toUpperCase(), textY + 16);
    textY += 46;
  }

  if (data.modelo) {
    context.font = "700 46px Arial, sans-serif";
    drawCenteredText(context, data.modelo, textY + 24);
    textY += 66;
  }

  if (data.marca) {
    context.font = "400 34px Arial, sans-serif";
    drawCenteredText(context, data.marca, textY + 18);
    textY += 46;
  }

  if (data.precio) {
    context.fillStyle = TEXT_COLOR;
    context.font = "700 26px Arial, sans-serif";
    drawCenteredText(context, "PRECIO CONTADO", textY + 18);
    context.fillStyle = PRICE_COLOR;
    context.font = "700 62px Arial, sans-serif";
    drawCenteredText(context, `$ ${data.precio}`, textY + 82);
    textY += 126;
  }

  if (data.stock) {
    context.fillStyle = TEXT_COLOR;
    context.font = "400 32px Arial, sans-serif";
    drawCenteredText(context, data.stock, textY + 18);
    textY += 48;
  }

  if (data.descripcion) {
    context.fillStyle = TEXT_COLOR;
    context.font = "italic 32px Arial, sans-serif";
    descriptionLines.forEach((line, index) => {
      drawCenteredText(context, line, textY + 20 + index * 40);
    });
  }

  if (data.consultaPrecio && consultation) {
    roundedRect(
      context,
      consultation.x,
      consultation.y,
      consultation.width,
      consultation.height,
      32
    );
    context.fillStyle = CONSULTA_COLOR;
    context.fill();
    context.fillStyle = "#2F4858";
    context.font = "700 34px Arial, sans-serif";
    drawCenteredText(
      context,
      data.consultaPrecio,
      consultation.y + consultation.height / 2
    );
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("No se pudo convertir la historia a PNG."));
    }, "image/png");
  });

  return new File([blob], filename, { type: "image/png" });
}
