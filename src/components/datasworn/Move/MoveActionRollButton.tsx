import { Datasworn } from "@datasworn/core";
import { Stat } from "../Stat";
import { CharacterDocument } from "api-calls/character/_character.type";
import { useStatRules } from "atoms/dataswornRules/useStatRules";
import { useTranslation } from "react-i18next";
import RollIcon from "@mui/icons-material/Casino";
import { useRollStatAndAddToLog } from "pages/games/hooks/useRollStatAndAddToLog";
import { useConditionMeterRules } from "atoms/dataswornRules/useConditionMeterRules";
import { CampaignDocument } from "api-calls/campaign/_campaign.type";

export interface CharacterData {
  name: string;
  stats: CharacterDocument["stats"];
  conditionMeters: CharacterDocument["conditionMeters"];
  adds: CharacterDocument["adds"];
  momentum: CharacterDocument["momentum"];
}
export interface CampaignData {
  conditionMeters: CampaignDocument["conditionMeters"];
}

export interface MoveActionRollButtonProps {
  moveId: string;
  disabled?: boolean;
  rollOption: Datasworn.RollableValue;
  characterData: CharacterData;
  campaignData: CampaignData;
  characterId: string;
}

export function MoveActionRollButton(props: MoveActionRollButtonProps) {
  const {
    moveId,
    rollOption,
    disabled,
    characterData,
    campaignData,
    characterId,
  } = props;
  const { t } = useTranslation();
  const rollStat = useRollStatAndAddToLog();

  const stats = useStatRules();
  const conditionMeters = useConditionMeterRules();

  if (rollOption.using === "stat" && stats[rollOption.stat]) {
    const statRule = stats[rollOption.stat];
    const characterStatValue = characterData.stats[rollOption.stat] ?? 0;
    return (
      <Stat
        disabled={disabled}
        label={statRule.label}
        value={characterStatValue}
        action={{
          actionLabel: t("datasworn.roll"),
          ActionIcon: RollIcon,
        }}
        onActionClick={() => {
          rollStat({
            statId: rollOption.stat,
            statLabel: statRule.label,
            statModifier: characterStatValue,
            moveId,
            adds: characterData.adds ?? 0,
            momentum: characterData.momentum,
            characterId,
          });
        }}
      />
    );
  }

  if (
    rollOption.using === "condition_meter" &&
    conditionMeters[rollOption.condition_meter]
  ) {
    const conditionMeterRule = conditionMeters[rollOption.condition_meter];
    const currentValue =
      (conditionMeterRule.shared
        ? campaignData?.conditionMeters?.[rollOption.condition_meter]
        : characterData.conditionMeters?.[rollOption.condition_meter]) ??
      conditionMeterRule.value;

    return (
      <Stat
        disabled={disabled}
        label={conditionMeterRule.label}
        value={currentValue}
        action={{
          actionLabel: t("datasworn.roll"),
          ActionIcon: RollIcon,
        }}
        onActionClick={() => {
          rollStat({
            statId: rollOption.condition_meter,
            statLabel: conditionMeterRule.label,
            statModifier: currentValue,
            moveId,
            adds: characterData.adds ?? 0,
            momentum: characterData.momentum,
            characterId,
          });
        }}
      />
    );
  }
  if (rollOption.using === "custom") {
    return (
      <Stat
        disabled={disabled}
        label={rollOption.label}
        value={rollOption.value}
        action={{
          actionLabel: t("datasworn.roll"),
          ActionIcon: RollIcon,
        }}
        onActionClick={() => {
          rollStat({
            statId: rollOption.label,
            statLabel: rollOption.label,
            statModifier: rollOption.value,
            moveId,
            adds: characterData.adds ?? 0,
            momentum: characterData.momentum,
            characterId,
          });
        }}
      />
    );
  }

  console.error("Could not find rollOption", rollOption);
  return null;
}
