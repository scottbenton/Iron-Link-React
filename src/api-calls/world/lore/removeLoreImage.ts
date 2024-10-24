import { constructLoreImagesPath } from "./_getRef";
import { updateLore } from "./updateLore";
import { createApiFunction } from "api-calls/createApiFunction";
import { deleteImage } from "lib/storage.lib";

export const removeLoreImage = createApiFunction<
  {
    worldId: string;
    loreId: string;
    filename: string;
  },
  void
>((params) => {
  const { worldId, loreId, filename } = params;

  return new Promise((resolve, reject) => {
    updateLore({
      worldId,
      loreId,
      lore: { imageFilenames: [] },
    })
      .then(() => {
        deleteImage(constructLoreImagesPath(worldId, loreId), filename).catch(
          () => console.error("Failed to remove image from storage."),
        );
        resolve();
      })
      .catch(reject);
  });
}, "Failed to delete lore image.");
