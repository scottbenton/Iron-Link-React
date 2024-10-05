import { StatRoll } from "types/DieRolls.type";
import { RollContainer, RollResult, RollTitle, RollValues } from "../common";
import { useMove } from "hooks/datasworn/useMove";
import { useTranslation } from "react-i18next";
import { RollResult as RollResultEnum } from "types/DieRolls.type";

export interface StatRollSnackbarProps {
  rollId: string | undefined;
  roll: StatRoll;
  isExpanded: boolean;
}

export function StatRollSnackbar(props: StatRollSnackbarProps) {
  const { roll, isExpanded } = props;
  const { t } = useTranslation();

  const move = useMove(roll.moveId ?? "");

  const resultLabel = t("datasworn.weak-hit", "Weak Hit");
  if (roll.result === RollResultEnum.StrongHit) {
    t("datasworn.strong-hit", "Strong Hit");
  } else if (roll.result === RollResultEnum.Miss) {
    t("datasworn.miss", "Miss");
  }

  return (
    <>
      <RollTitle
        title={move ? move.name : roll.rollLabel}
        overline={move ? roll.rollLabel : undefined}
        isExpanded={isExpanded}
      />
      <RollContainer>
        <RollValues
          d6Result={{
            action: roll.action,
            modifier: roll.modifier,
            adds: roll.adds,
            rollTotal: roll.actionTotal,
          }}
          crossOutD6={!!roll.momentumBurned}
          crossOutD6Value={roll.matchedNegativeMomentum}
          d10Results={[roll.challenge1, roll.challenge2]}
          fixedResult={
            roll.momentumBurned
              ? { title: "Momentum", value: roll.momentumBurned }
              : undefined
          }
          isExpanded={isExpanded}
        />
        <RollResult
          result={resultLabel}
          extras={[
            ...(roll.challenge1 === roll.challenge2
              ? [t("datasworn.match", "Match")]
              : []),
            ...(roll.action === 1
              ? [t("datasworn.one-on-the-action-die", "One on the action die")]
              : []),
            ...(roll.matchedNegativeMomentum
              ? [
                  t(
                    "datasworn.matched-negative-momentum",
                    "Matched negative momentum"
                  ),
                ]
              : []),
          ]}
        />
      </RollContainer>
    </>
  );
}
