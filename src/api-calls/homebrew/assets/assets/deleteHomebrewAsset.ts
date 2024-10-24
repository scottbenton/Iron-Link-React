import { deleteDoc } from "firebase/firestore";

import { getHomebrewAssetDoc } from "./_getRef";
import { createApiFunction } from "api-calls/createApiFunction";

export const deleteHomebrewAsset = createApiFunction<
  {
    assetId: string;
  },
  void
>((params) => {
  const { assetId } = params;
  return new Promise((resolve, reject) => {
    deleteDoc(getHomebrewAssetDoc(assetId)).then(resolve).catch(reject);
  });
}, "Failed to delete asset.");
