import { updateDoc } from "firebase/firestore";

import { convertToDatabase, getNPCDoc } from "./_getRef";
import { createApiFunction } from "api-calls/createApiFunction";
import { NPC } from "types/NPCs.type";

interface NPCParams {
  worldId: string;
  npcId: string;
  npc: Partial<NPC>;
}

export const updateNPC = createApiFunction<NPCParams, void>((params) => {
  const { worldId, npcId, npc } = params;

  return new Promise((resolve, reject) => {
    updateDoc(getNPCDoc(worldId, npcId), convertToDatabase(npc))
      .then(() => {
        resolve();
      })
      .catch((e) => {
        reject(e);
      });
  });
}, "Failed to update npc.");
