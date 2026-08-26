import html2canvas from "html2canvas";

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

export async function captureWebStory(
  target: unknown,
  filename: string
): Promise<File> {
  if (!(target instanceof HTMLElement)) {
    throw new Error("No se encontró la vista previa de la historia.");
  }

  const sourceCanvas = await html2canvas(target, {
    allowTaint: false,
    backgroundColor: null,
    logging: false,
    onclone: (documentClone) => {
      documentClone
        .querySelectorAll<HTMLElement>("#instagram-story-info-panel")
        .forEach((panel) => {
          panel.style.backgroundColor = "#45413B";
          panel.style.borderRadius = "16px";
        });
    },
    scale: Math.max(1, STORY_WIDTH / target.offsetWidth),
    useCORS: true,
  });

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = STORY_WIDTH;
  outputCanvas.height = STORY_HEIGHT;

  const context = outputCanvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar el lienzo de la historia.");
  }

  context.drawImage(sourceCanvas, 0, 0, STORY_WIDTH, STORY_HEIGHT);

  const blob = await new Promise<Blob>((resolve, reject) => {
    outputCanvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("No se pudo convertir la historia a PNG."));
    }, "image/png");
  });

  return new File([blob], filename, { type: "image/png" });
}
