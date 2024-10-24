import { addDoc } from "firebase/firestore";

import { getHomebrewMoveCategoryCollection } from "./_getRef";
import { createApiFunction } from "api-calls/createApiFunction";
import { HomebrewMoveCategoryDocument } from "api-calls/homebrew/moves/categories/_homebrewMoveCategory.type";

export const createHomebrewMoveCategory = createApiFunction<
  { moveCategory: HomebrewMoveCategoryDocument },
  void
>((params) => {
  const { moveCategory } = params;
  return new Promise((resolve, reject) => {
    addDoc(getHomebrewMoveCategoryCollection(), moveCategory)
      .then(() => resolve())
      .catch(reject);
  });
}, "Failed to create move category.");
