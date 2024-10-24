import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";

import { useCharacterId } from "../../hooks/useCharacterId";
import { useDerivedCharacterState } from "../../hooks/useDerivedCharacterState";
import { updateCharacter } from "api-calls/character/updateCharacter";
import { ColorScheme } from "atoms/theme.atom";
import { ColorSchemeSelector } from "components/ColorSchemeSelector";
import { DialogTitleWithCloseButton } from "components/DialogTitleWithCloseButton";

export interface ColorSchemeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ColorSchemeDialog(props: ColorSchemeDialogProps) {
  const { open, onClose } = props;
  const { t } = useTranslation();

  const characterId = useCharacterId();
  const colorScheme = useDerivedCharacterState(
    characterId,
    (character) => character?.characterDocument.data?.colorScheme,
  );

  const [localColorScheme, setLocalColorScheme] = useState(colorScheme);
  useEffect(() => {
    setLocalColorScheme(colorScheme);
  }, [colorScheme]);

  const handleSave = () => {
    if (characterId) {
      updateCharacter({
        characterId,
        character: {
          colorScheme: localColorScheme,
        },
      }).catch(() => {});
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitleWithCloseButton onClose={onClose}>
        {t(
          "character.character-sidebar.change-color-scheme",
          "Change Color Scheme",
        )}
      </DialogTitleWithCloseButton>
      <DialogContent>
        {/* Add your color scheme selection UI here */}
        <ColorSchemeSelector
          selectedColorScheme={localColorScheme ?? ColorScheme.Default}
          onChange={setLocalColorScheme}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          {t("common.cancel", "Cancel")}
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {t("common.save-changes", "Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
