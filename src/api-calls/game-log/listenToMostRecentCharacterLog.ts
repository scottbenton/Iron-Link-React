import {
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  Unsubscribe,
  where,
} from "firebase/firestore";

import { convertFromDatabase, getCampaignGameLogCollection } from "./_getRef";
import { Roll } from "types/DieRolls.type";

export function listenToMostRecentCharacterLog(params: {
  isGM: boolean;
  campaignId: string;
  characterId: string;
  onRoll: (rollId: string, roll: Roll) => void;
  onError: (error: string) => void;
}): Unsubscribe {
  const { isGM, campaignId, characterId, onRoll, onError } = params;

  const collection = getCampaignGameLogCollection(campaignId);

  const queryConstraints: QueryConstraint[] = [
    where("timestamp", ">", new Date()),
    where("characterId", "==", characterId),
    orderBy("timestamp", "desc"),
    limit(1),
  ];
  if (!isGM) {
    queryConstraints.push(where("gmsOnly", "==", false));
  }

  return onSnapshot(
    query(collection, ...queryConstraints),
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const doc = convertFromDatabase(change.doc.data());
          onRoll(change.doc.id, doc);
        }
      });
    },
    (error) => {
      console.error(error);
      onError("Error getting new logs.");
    },
  );
}
