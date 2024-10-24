import { setDoc } from "firebase/firestore";

import {
  convertRollToGameLogDocument,
  getCampaignGameLogDocument,
} from "./_getRef";
import { createApiFunction } from "api-calls/createApiFunction";
import { Roll } from "types/DieRolls.type";

export const addRoll = createApiFunction<
  { roll: Roll; campaignId: string; rollId: string },
  void
>((params) => {
  const { campaignId, rollId, roll } = params;

  return new Promise((resolve, reject) => {
    setDoc(
      getCampaignGameLogDocument(campaignId, rollId),
      convertRollToGameLogDocument(roll),
    )
      .then(() => {
        resolve();
      })
      .catch((e) => {
        reject(e);
      });
  });
}, "Failed to add roll to log.");
