import { useRollOracle } from "hooks/useRollOracle";
import { useCallback } from "react";
import { useUID } from "atoms/auth.atom";
import { useParams } from "react-router-dom";
import { addRoll } from "api-calls/game-log/addRoll";
import { createId } from "lib/id.lib";
import { OracleTableRoll } from "types/DieRolls.type";
import { useSnackbar } from "providers/SnackbarProvider";
import { useTranslation } from "react-i18next";
import { useAddRollSnackbar } from "atoms/rollDisplay.atom";
import { useDerivedCharacterState } from "../characterSheet/hooks/useDerivedCharacterState";

export function useRollOracleAndAddToLog() {
  const uid = useUID();
  const { characterId, campaignId } = useParams<{
    characterId?: string;
    campaignId?: string;
  }>();

  const characterOwner = useDerivedCharacterState(
    characterId,
    (character) => character?.characterDocument.data?.uid
  );

  const addRollSnackbar = useAddRollSnackbar();

  const { t } = useTranslation();

  const { error } = useSnackbar();

  const rollOracle = useRollOracle();

  const handleRollOracle = useCallback(
    (
      oracleId: string,
      gmOnly: boolean = false
    ): { id: string | undefined; result: OracleTableRoll | undefined } => {
      const result = rollOracle(oracleId);
      if (result) {
        const resultWithAdditions = {
          ...result,
          uid,
          characterId:
            characterId && characterOwner === uid ? characterId : null,
          gmOnly,
        };
        if (campaignId) {
          const rollId = createId();
          addRoll({ campaignId, rollId, roll: resultWithAdditions }).catch(
            () => {}
          );
          addRollSnackbar(rollId, resultWithAdditions);
          return {
            id: rollId,
            result: resultWithAdditions,
          };
        }
        addRollSnackbar(undefined, resultWithAdditions);
        return {
          id: undefined,
          result: resultWithAdditions,
        };
      } else {
        error(
          t("datasworn.roll-oracle.oracle-not-found", "Could not find oracle")
        );
      }
      return {
        id: undefined,
        result: undefined,
      };
    },
    [
      uid,
      characterId,
      campaignId,
      rollOracle,
      error,
      t,
      addRollSnackbar,
      characterOwner,
    ]
  );

  return handleRollOracle;
}
