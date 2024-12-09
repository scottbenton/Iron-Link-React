import { Datasworn } from "@datasworn/core";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import { ironLinkAskTheOracleRulesPackage } from "data/askTheOracle";

export const dataswornTreeAtom = atom<Record<string, Datasworn.RulesPackage>>(
  {},
);

export function useDataswornTree() {
  return useAtomValue(dataswornTreeAtom);
}

export function useSetDataswornTree(
  tree: Record<string, Datasworn.RulesPackage>,
) {
  const setTree = useDataswornTreeSetter();
  useEffect(() => {
    setTree(tree);
  }, [tree, setTree]);
}

export function useDataswornTreeSetter() {
  const setTree = useSetAtom(dataswornTreeAtom);
  return useCallback(
    (tree: Record<string, Datasworn.RulesPackage>) => {
      setTree({
        [ironLinkAskTheOracleRulesPackage._id]:
          ironLinkAskTheOracleRulesPackage,
        ...JSON.parse(JSON.stringify(tree)),
      });
    },
    [setTree],
  );
}
