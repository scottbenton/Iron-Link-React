import { atom, useAtomValue } from "jotai";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { CampaignType } from "api-calls/campaign/_campaign.type";

import { authAtom } from "atoms/auth.atom";
import { derivedAtomWithEquality } from "atoms/derivedAtomWithEquality";

import { currentCampaignAtom } from "../atoms/campaign.atom";

const campaignPermissions = derivedAtomWithEquality(
  currentCampaignAtom,
  (atom) => ({
    players: atom.campaign?.users ?? [],
    gmIds: atom.campaign?.gmIds ?? [],
    campaignType: atom.campaign?.type ?? CampaignType.Solo,
    characters: atom.campaign?.characters ?? [],
  }),
);

// Decreasing levels of ownership
export enum CharacterPermissionType {
  Owner = "owner",
  Guide = "guide",
  OtherPlayer = "other_player",
  Viewer = "viewer",
}
export enum CampaignPermissionType {
  Guide = "guide",
  Player = "player",
  Viewer = "viewer",
}

export function useCampaignPermissions() {
  const { characterId } = useParams<{ characterId?: string }>();

  const { campaignType, campaignPermission, permissionsByCharacter } =
    useAtomValue(
      useMemo(
        () =>
          atom((get) => {
            const currentUserUid = get(authAtom).uid;
            const { players, gmIds, campaignType, characters } =
              get(campaignPermissions);

            const isUserInCampaign = players.includes(currentUserUid);
            const isUserGuide =
              (isUserInCampaign &&
                (campaignType === CampaignType.Solo ||
                  campaignType === CampaignType.Coop)) ||
              gmIds.includes(currentUserUid);

            const characterPermissions: Record<
              string,
              CharacterPermissionType
            > = {};
            characters.forEach(({ characterId, uid }) => {
              if (currentUserUid === uid) {
                characterPermissions[characterId] =
                  CharacterPermissionType.Owner;
              } else if (isUserGuide) {
                characterPermissions[characterId] =
                  CharacterPermissionType.Guide;
              } else if (isUserInCampaign) {
                characterPermissions[characterId] =
                  CharacterPermissionType.OtherPlayer;
              } else {
                characterPermissions[characterId] =
                  CharacterPermissionType.Viewer;
              }
            });

            return {
              campaignType,
              campaignPermission: isUserGuide
                ? CampaignPermissionType.Guide
                : isUserInCampaign
                  ? CampaignPermissionType.Player
                  : CampaignPermissionType.Viewer,
              permissionsByCharacter: characterPermissions,
            };
          }),
        [],
      ),
    );

  return {
    campaignType,
    campaignPermission,
    permissionsByCharacter,
    characterPermission: characterId
      ? (permissionsByCharacter[characterId] ?? CharacterPermissionType.Viewer)
      : CharacterPermissionType.Viewer,
  };
}
