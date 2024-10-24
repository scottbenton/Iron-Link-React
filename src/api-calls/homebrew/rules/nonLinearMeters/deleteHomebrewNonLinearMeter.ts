import { deleteDoc } from "firebase/firestore";

import { getHomebrewNonLinearMeterDoc } from "./_getRef";
import { createApiFunction } from "api-calls/createApiFunction";

export const deleteHomebrewNonLinearMeter = createApiFunction<
  {
    meterId: string;
  },
  void
>((params) => {
  const { meterId } = params;
  return new Promise((resolve, reject) => {
    deleteDoc(getHomebrewNonLinearMeterDoc(meterId))
      .then(() => {
        resolve();
      })
      .catch(reject);
  });
}, "Failed to delete non-linear meter.");
