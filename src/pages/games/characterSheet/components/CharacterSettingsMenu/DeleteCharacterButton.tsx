import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { useCampaignId } from "pages/games/gamePageLayout/hooks/useCampaignId";
import { pathConfig } from "pages/pathConfig";
import { useNavigate } from "react-router-dom";
import { useCharacterId } from "../../hooks/useCharacterId";
import { useDerivedCharacterState } from "../../hooks/useDerivedCharacterState";
import { useDerivedCampaignDocumentState } from "pages/games/gamePageLayout/hooks/useDerivedCampaignState";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteCharacter } from "api-calls/character/deleteCharacter";
import { deleteCampaign } from "api-calls/campaign/deleteCampaign";
import { useConfirm } from "material-ui-confirm";

export interface DeleteCharacterButtonProps {
  closeMenu: () => void;
}

export function DeleteCharacterButton(props: DeleteCharacterButtonProps) {
  const { closeMenu } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const campaignId = useCampaignId();
  const characterId = useCharacterId();
  const portraitFilename = useDerivedCharacterState(
    characterId,
    (store) => store?.characterDocument.data?.profileImage?.filename
  );
  const campaignCharacters = useDerivedCampaignDocumentState(
    (state) => state?.characters
  );

  const confirm = useConfirm();
  const handleDeleteCharacter = useCallback(() => {
    confirm({
      title: t(
        "character.character-sidebar.delete-character",
        "Delete Character"
      ),
      description: t(
        "character.character-sidebar.delete-character-confirmation",
        "Are you sure you want to delete this character? This action cannot be undone."
      ),
      confirmationText: t("common.delete", "Delete"),
    })
      .then(() => {
        closeMenu();
        if (Array.isArray(campaignCharacters)) {
          const alsoDeleteCampaign = campaignCharacters.length === 1;
          navigate(
            alsoDeleteCampaign
              ? pathConfig.gameSelect
              : pathConfig.game(campaignId)
          );
          deleteCharacter({
            characterId,
            campaignId: alsoDeleteCampaign ? undefined : campaignId,
            portraitFilename,
          });
          if (alsoDeleteCampaign) {
            deleteCampaign({ campaignId, characterIds: [] }).catch(() => {});
          }
        }
      })
      .catch(() => {
        closeMenu();
      });
  }, [
    confirm,
    t,
    campaignCharacters,
    campaignId,
    characterId,
    portraitFilename,
    navigate,
    closeMenu,
  ]);

  return (
    <MenuItem
      onClick={() => {
        handleDeleteCharacter();
      }}
    >
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <ListItemText
        primary={t(
          "character.character-sidebar.delete-character",
          "Delete Character"
        )}
      />
    </MenuItem>
  );
}
