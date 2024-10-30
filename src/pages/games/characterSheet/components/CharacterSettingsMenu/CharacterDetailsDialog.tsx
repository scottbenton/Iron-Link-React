import { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { useTranslation } from "react-i18next";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from "@mui/material";

import { useCharacterId } from "../../hooks/useCharacterId";
import { useDerivedCurrentCharacterState } from "../../hooks/useDerivedCharacterState";
import { removeCharacterPortrait } from "api-calls/character/removeCharacterPortrait";
import { updateCharacter } from "api-calls/character/updateCharacter";
import { updateCharacterPortrait } from "api-calls/character/updateCharacterPortrait";
import { useCharacterPortrait } from "atoms/characterPortraits.atom";
import { DialogTitleWithCloseButton } from "components/DialogTitleWithCloseButton";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_LABEL } from "lib/storage.lib";
import { useSnackbar } from "providers/SnackbarProvider";

export interface CharacterDetailsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CharacterDetailsDialog(props: CharacterDetailsDialogProps) {
  const { open, onClose } = props;

  const { t } = useTranslation();

  const { error } = useSnackbar();

  const characterId = useCharacterId();
  const { name: initialName, profileImage: initialPortraitSettings } =
    useDerivedCurrentCharacterState(
      useCallback(
        (character) => ({
          name: character?.characterDocument.data?.name ?? "",
          profileImage: character?.characterDocument.data?.profileImage,
        }),
        [],
      ),
    );

  const initialFileUrl = useCharacterPortrait(characterId ?? "").url;

  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(initialName);
  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const [file, setFile] = useState<File | string | undefined>(initialFileUrl);
  const [scale, setScale] = useState<number>(
    initialPortraitSettings?.scale ?? 1,
  );
  const [position, setPosition] = useState<{ x: number; y: number }>(
    initialPortraitSettings?.position ?? {
      x: 0.5,
      y: 0.5,
    },
  );
  useEffect(() => {
    setScale(initialPortraitSettings?.scale ?? 1);
    setPosition(initialPortraitSettings?.position ?? { x: 0.5, y: 0.5 });
  }, [initialPortraitSettings]);

  useEffect(() => {
    setFile((prevFile) =>
      !prevFile || typeof prevFile === "string" ? initialFileUrl : prevFile,
    );
  }, [initialFileUrl]);

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (evt) => {
    handleClearFile();
    const files = evt.currentTarget.files;

    if (files && files.length > 0) {
      if (files[0].size > MAX_FILE_SIZE) {
        error(
          t(
            "common.file-size-error",
            "File is too large. The max file size is {{maxFileSize}}",
            {
              maxFileSize: MAX_FILE_SIZE_LABEL,
            },
          ),
        );
        evt.target.value = "";
        return;
      }
      setFile(files[0]);
    }
  };
  const handleClearFile = () => {
    setFile(undefined);
    setPosition({ x: 0.5, y: 0.5 });
    setScale(1);
  };

  const handleSave = () => {
    if (characterId) {
      setIsLoading(true);

      const promises: Promise<unknown>[] = [];
      if (name && name !== initialName) {
        promises.push(
          updateCharacter({ characterId, character: { name } }).catch(() => {}),
        );
      }
      if (
        file &&
        (scale !== initialPortraitSettings?.scale ||
          position !== initialPortraitSettings?.position)
      ) {
        if (file !== initialFileUrl && typeof file !== "string") {
          promises.push(
            updateCharacterPortrait({
              characterId,
              oldPortraitFilename: initialPortraitSettings?.filename,
              portrait: file,
              scale,
              position,
            }),
          );
        } else {
          promises.push(
            updateCharacter({
              "profileImage.position": position,
              "profileImage.scale": scale,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any),
          );
        }
      } else if (!file && initialPortraitSettings) {
        promises.push(
          removeCharacterPortrait({
            characterId,
            oldPortraitFilename: initialPortraitSettings.filename,
          }),
        );
      }

      Promise.all(promises)
        .then(() => {
          onClose();
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitleWithCloseButton onClose={onClose}>
        {t(
          "character.character-sidebar.change-character-name-portrait",
          "Change Character Name and Portrait",
        )}
      </DialogTitleWithCloseButton>
      <DialogContent>
        <TextField
          sx={{ mt: 1 }}
          label={t("character.name", "Name")}
          value={name}
          onChange={(evt) => setName(evt.currentTarget.value)}
        />
        <Box mt={2}>
          <Button variant="outlined" component="label" color={"inherit"}>
            {file
              ? t("character.character-sidebar.change-image", "Change Image")
              : t("character.character-sidebar.upload-image", "Upload Image")}
            <input
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={handleFileInputChange}
            />
          </Button>
          {file && (
            <Button
              variant={"outlined"}
              color={"error"}
              sx={{ ml: 1 }}
              onClick={handleClearFile}
            >
              {t("character.character-sidebar.remove-image", "Remove Image")}
            </Button>
          )}
          {file && (
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              mt={1}
            >
              <AvatarEditor
                width={200}
                height={200}
                image={file}
                borderRadius={4}
                scale={scale}
                position={position}
                onPositionChange={setPosition}
              />
              <Box display={"flex"} justifyContent={"flex-end"} mt={0.5}>
                <ButtonGroup variant={"outlined"}>
                  <Button
                    color={"inherit"}
                    disabled={scale <= 1}
                    onClick={() => setScale((prevScale) => prevScale - 0.1)}
                    aria-label={"Zoom Out"}
                  >
                    <ZoomOutIcon />
                  </Button>
                  <Button
                    color={"inherit"}
                    disabled={scale >= 2}
                    onClick={() => setScale((prevScale) => prevScale + 0.1)}
                    aria-label={"Zoom In"}
                  >
                    <ZoomInIcon />
                  </Button>
                </ButtonGroup>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color={"inherit"} onClick={onClose} disabled={isLoading}>
          {t("common.cancel", "Cancel")}
        </Button>
        <Button variant={"contained"} onClick={handleSave} disabled={isLoading}>
          {t("common.save-changes", "Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
