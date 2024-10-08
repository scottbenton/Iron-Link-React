import { useMemo } from "react";
import { Datasworn } from "@datasworn/core";
import {
  defaultBaseRulesets,
  defaultExpansions,
} from "data/datasworn.packages";
import { useSetDataswornTree } from "atoms/dataswornTree.atom";
import { ICreateGameAtom } from "../atoms/createGame.atom";

export function useSyncActiveRulesPackages(
  rulesets: ICreateGameAtom["rulesets"],
  expansions: ICreateGameAtom["expansions"]
) {
  const activeRulesPackages = useMemo(() => {
    const activePackages: Record<string, Datasworn.RulesPackage> = {};

    Object.entries(rulesets ?? {}).forEach(([id, isActive]) => {
      if (isActive) {
        activePackages[id] = defaultBaseRulesets[id];
        Object.entries(expansions?.[id] ?? {}).forEach(
          ([expansionId, isExpansionActive]) => {
            if (isExpansionActive) {
              activePackages[expansionId] = defaultExpansions[id][expansionId];
            }
          }
        );
      }
    });

    return activePackages;
  }, [rulesets, expansions]);

  useSetDataswornTree(activeRulesPackages);
}
