import { IconButton, Menu, MenuItem } from "@mui/material";
import { useNotePermission } from "../NoteView/useNotePermission";
import { useRef, useState } from "react";
import MenuIcon from "@mui/icons-material/MoreHoriz";
import { MoveDialog } from "../MoveDialog";
import { useDerivedNotesAtom } from "pages/games/gamePageLayout/atoms/notes.atom";
import { useTranslation } from "react-i18next";

export interface NoteActionMenuProps {
  noteId: string;
}

export function NoteActionMenu(props: NoteActionMenuProps) {
  const { noteId } = props;

  const { t } = useTranslation();

  const { /**canEdit, canDelete,*/ canChangePermissions } =
    useNotePermission(noteId);

  const parentFolderId = useDerivedNotesAtom(
    (store) => store.notes.notes[noteId].parentFolderId,
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuParentRef = useRef<HTMLButtonElement>(null);

  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

  if (/**!canEdit && !canDelete &&*/ !canChangePermissions) {
    return null;
  }

  return (
    <>
      <IconButton
        sx={(theme) => ({
          position: "absolute",
          right: theme.spacing(1),
          zIndex: 1,
          top: "50%",
          transform: "translateY(-50%)",
        })}
        ref={menuParentRef}
        onClick={() => setIsMenuOpen(true)}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorEl={menuParentRef.current}
      >
        {canChangePermissions && (
          <MenuItem
            onClick={() => {
              setIsMoveDialogOpen(true);
              setIsMenuOpen(false);
            }}
          >
            {t("notes.note-menu.move", "Move Note")}
          </MenuItem>
        )}
      </Menu>
      <MoveDialog
        open={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
        item={{ type: "note", id: noteId, parentFolderId: parentFolderId }}
      />
    </>
  );
}