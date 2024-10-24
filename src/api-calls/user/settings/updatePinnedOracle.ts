import { updateDoc } from "firebase/firestore";

import { getUserOracleSettingsDoc } from "./_getRef";
import { createApiFunction } from "api-calls/createApiFunction";
import { encodeDataswornId } from "lib/dataswornIdEncoder";

export const updatePinnedOracle = createApiFunction<
  { uid: string; oracleId: string; pinned: boolean },
  void
>((params) => {
  const { uid, oracleId, pinned } = params;

  return new Promise((resolve, reject) => {
    const encodedId = encodeDataswornId(oracleId);
    updateDoc(getUserOracleSettingsDoc(uid), {
      [`pinnedOracleSections.${encodedId}`]: pinned,
    })
      .then(() => resolve())
      .catch((e) => reject(e));
  });
}, "Failed to pin oracle.");
