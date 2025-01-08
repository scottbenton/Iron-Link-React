import deepEqual from "fast-deep-equal";
import { useEffect } from "react";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";

import { useGamePermissions } from "pages/games/gamePageLayout/hooks/usePermissions";

import { EditPermissions, ReadPermissions } from "repositories/shared.types";

import { INoteFolder, NoteFoldersService } from "services/noteFolders.service";
import { INote, INoteContent, NotesService } from "services/notes.service";

import { useUID } from "./auth.store";
import { GamePermission } from "./game.store";

interface NotesStoreState {
  noteState: {
    notes: Record<string, INote>;
    loading: boolean;
    error?: string;
  };
  folderState: {
    folders: Record<string, INoteFolder>;
    loading: boolean;
    error?: string;
  };
  openItem?:
    | {
        type: "note";
        noteId: string;
        noteContent: {
          data?: INoteContent;
          loading: boolean;
          error?: string;
        };
      }
    | {
        type: "folder";
        folderId: string;
      };
}

interface NotesStoreActions {
  listenToGameNoteFolders: (
    uid: string | undefined,
    gameId: string,
    gamePermissions: GamePermission,
  ) => () => void;
  listenToGameNotes: (
    uid: string | undefined,
    gameId: string,
    gamePermissions: GamePermission,
  ) => () => void;
  listenToActiveNoteContent: (noteId: string) => () => void;

  setOpenItem: (type: "folder" | "note", id: string) => void;

  createFolder: (
    uid: string,
    gameId: string,
    parentFolderId: string | null,
    name: string,
    order: number,
    readPermissions: ReadPermissions,
    editPermissions: EditPermissions,
    isRootPlayerFolder?: boolean,
  ) => Promise<string>;
  updateFolderName: (folderId: string, name: string) => Promise<void>;
  // updateFolderPermissions: (
  //   gameId: string,
  //   folderId: string,
  //   readPermissions: ReadPermissions,
  //   editPermissions: EditPermissions,
  // ) => Promise<void>;

  deleteFolder: (folderId: string) => Promise<void>;

  createNote: (
    uid: string,
    parentFolderId: string,
    title: string,
    order: number,
  ) => Promise<string>;
  updateNoteName: (noteId: string, title: string) => Promise<void>;
  updateNoteOrder: (noteId: string, order: number) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;

  updateNoteContent: (
    noteId: string,
    content: Uint8Array,
    contentString: string,
    isBeaconRequest?: boolean,
  ) => Promise<void>;

  getFolderDescendants: (folderId: string) => {
    folders: Record<string, INoteFolder>;
    notes: Record<string, INote>;
  };

  reset: () => void;
}

const defaultNotesState: NotesStoreState = {
  noteState: {
    loading: true,
    notes: {},
    error: undefined,
  },
  folderState: {
    loading: true,
    folders: {},
    error: undefined,
  },
  openItem: undefined,
};

export const useNotesStore = createWithEqualityFn<
  NotesStoreState & NotesStoreActions
>()(
  immer((set, getState) => ({
    ...defaultNotesState,

    listenToGameNoteFolders: (uid, gameId, gamePermissions) => {
      return NoteFoldersService.listenToGameNoteFolders(
        uid,
        gameId,
        gamePermissions,
        (changedNoteFolders, deletedNoteFolderIds) => {
          set((store) => {
            store.folderState.folders = {
              ...store.folderState.folders,
              ...changedNoteFolders,
            };
            deletedNoteFolderIds.forEach((folderId) => {
              delete store.folderState.folders[folderId];
            });
            store.folderState.loading = false;
            store.folderState.error = undefined;
          });
        },
        (error) => {
          set((store) => {
            store.folderState.loading = false;
            store.folderState.error = error.message;
          });
        },
      );
    },
    listenToGameNotes: (uid, gameId, gamePermissions) => {
      return NotesService.listenToGameNotes(
        uid,
        gameId,
        gamePermissions,
        (chaingedNotes, removedNoteIds) => {
          set((store) => {
            store.noteState.notes = {
              ...store.noteState.notes,
              ...chaingedNotes,
            };
            removedNoteIds.forEach((noteId) => {
              delete store.noteState.notes[noteId];
            });
            store.noteState.loading = false;
            store.noteState.error = undefined;
          });
        },
        (error) => {
          set((store) => {
            store.noteState.loading = false;
            store.noteState.error = error.message;
          });
        },
      );
    },
    listenToActiveNoteContent: (noteId) => {
      return NotesService.listenToNoteContent(
        noteId,
        (noteContent) => {
          set((store) => {
            if (
              store.openItem?.type === "note" &&
              store.openItem.noteId === noteId
            ) {
              store.openItem.noteContent = {
                data: noteContent,
                loading: false,
                error: undefined,
              };
            }
          });
        },
        (error) => {
          set((store) => {
            if (
              store.openItem?.type === "note" &&
              store.openItem.noteId === noteId
            ) {
              store.openItem.noteContent = {
                data: undefined,
                loading: false,
                error: error.message,
              };
            }
          });
        },
      );
    },

    updateNoteContent: (noteId, content, contentString, isBeaconRequest) => {
      return NotesService.updateNoteContent(
        noteId,
        content,
        contentString,
        isBeaconRequest,
      );
    },

    setOpenItem: (type, id) => {
      set((store) => {
        if (store.openItem?.type === type) {
          if (
            (store.openItem.type === "folder" &&
              store.openItem.folderId === id) ||
            (store.openItem.type === "note" && store.openItem.noteId === id)
          ) {
            return;
          }
        }

        if (type === "folder") {
          store.openItem = {
            type: "folder",
            folderId: id,
          };
        } else {
          store.openItem = {
            type: "note",
            noteId: id,
            noteContent: {
              data: undefined,
              loading: true,
              error: undefined,
            },
          };
        }
      });
    },

    createFolder: (
      uid,
      gameId,
      parentFolderId,
      name,
      order,
      readPermissions,
      editPermissions,
      isRootPlayerFolder,
    ) => {
      return NoteFoldersService.addFolder(
        uid,
        gameId,
        parentFolderId,
        order,
        name,
        readPermissions,
        editPermissions,
        isRootPlayerFolder ?? false,
      );
    },
    updateFolderName: (folderId, name) => {
      return NoteFoldersService.updateFolderName(folderId, name);
    },
    // updateFolderPermissions: (
    //   gameId,
    //   folderId,
    //   readPermissions,
    //   editPermissions,
    // ) => {
    //   return new Promise((resolve, reject) => {});
    // },
    deleteFolder: (folderId) => {
      return NoteFoldersService.deleteFolder(folderId);
    },

    createNote: (uid, parentFolderId, title, order) => {
      const parentFolder = getState().folderState.folders[parentFolderId];
      if (!parentFolder) {
        return Promise.reject(new Error("Parent folder not found"));
      }
      return NotesService.addNote(
        uid,
        parentFolderId,
        title,
        order,
        parentFolder.readPermissions,
        parentFolder.editPermissions,
      );
    },
    updateNoteName: (noteId, title) => {
      return NotesService.updateNoteName(noteId, title);
    },
    updateNoteOrder: (noteId, order) => {
      return NotesService.updateNoteOrder(noteId, order);
    },
    deleteNote: (noteId) => {
      return NotesService.deleteNote(noteId);
    },

    getFolderDescendants: (folderId) => {
      const checkedFolderMap: Record<string, boolean> = {};
      const folders: Record<string, INoteFolder> = {};
      const notes: Record<string, INote> = {};

      const { folderState, noteState } = getState();
      const allFolders = folderState.folders;
      function processAncestorsAndReturnResult(
        testingFolderId: string,
      ): boolean {
        if (testingFolderId in checkedFolderMap) {
          return checkedFolderMap[testingFolderId];
        }

        if (testingFolderId === folderId) {
          checkedFolderMap[testingFolderId] = true;
          folders[testingFolderId] = allFolders[testingFolderId];
          return true;
        }

        const folder = allFolders[testingFolderId];
        if (!folder) {
          return false;
        }
        if (folder.parentFolderId) {
          const result = processAncestorsAndReturnResult(folder.parentFolderId);
          checkedFolderMap[testingFolderId] = result;
          if (result) {
            folders[testingFolderId] = folder;
          }
          return result;
        }
        return false;
      }

      Object.keys(allFolders).forEach((id) => {
        if (processAncestorsAndReturnResult(id)) {
          checkedFolderMap[id] = true;
        }
      });

      Object.entries(noteState.notes).forEach(([noteId, note]) => {
        const parentFolder = note.parentFolderId;
        if (checkedFolderMap[parentFolder]) {
          notes[noteId] = note;
        }
      });

      return {
        folders,
        notes,
      };
    },

    reset: () => {
      set((store) => ({ ...store, ...defaultNotesState }));
    },
  })),
  deepEqual,
);

export function useListenToGameNotes(gameId: string | undefined) {
  const uid = useUID();
  const gamePermissions = useGamePermissions().gamePermission;

  const resetStore = useNotesStore((store) => store.reset);
  const listenToNoteFolders = useNotesStore(
    (store) => store.listenToGameNoteFolders,
  );
  const listenToNotes = useNotesStore((store) => store.listenToGameNotes);
  const listenToNoteContents = useNotesStore(
    (store) => store.listenToActiveNoteContent,
  );

  const activeNoteId = useNotesStore((store) =>
    store.openItem?.type === "note" ? store.openItem.noteId : undefined,
  );

  useEffect(() => {
    if (gameId && gamePermissions) {
      return listenToNoteFolders(uid, gameId, gamePermissions);
    }
  }, [gameId, uid, gamePermissions, listenToNoteFolders]);

  useEffect(() => {
    if (gameId && gamePermissions) {
      return listenToNotes(uid, gameId, gamePermissions);
    }
  }, [gameId, uid, gamePermissions, listenToNotes]);

  useEffect(() => {
    if (activeNoteId) {
      return listenToNoteContents(activeNoteId);
    }
  }, [activeNoteId, listenToNoteContents]);

  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [gameId, uid, resetStore]);
} // So what does it look like to fetch all this information?
// Query all folders where I have permission
// THEN
// Query all notes where I have permission OR notes in folders where I have permission

export function getPlayerNotesFolder(
  playerId: string,
  folders: Record<string, INoteFolder>,
): INoteFolder | undefined {
  return Object.values(folders).find((folder) => {
    return folder.creator === playerId && folder.isRootPlayerFolder;
  });
}
