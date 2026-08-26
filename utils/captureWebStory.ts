import { InstagramStoryRenderData } from "./instagramStoryRenderer";

export async function captureWebStory(
  _target: unknown,
  _filename: string,
  _data: InstagramStoryRenderData
): Promise<File> {
  throw new Error("La captura web solo está disponible en el navegador.");
}
