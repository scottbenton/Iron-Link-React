import { addDoc, setDoc } from "firebase/firestore";

import { getNoteFolderCollection, getNoteFolderDocument } from "./_getRef";
import { NoteFolder } from "./_notes.type";
import { createApiFunction } from "api-calls/createApiFunction";

export const addFolder = createApiFunction<
  {
    uid: string;
    campaignId: string;
    parentFolderId: string | null;
    order: number;
    name?: string;
    viewPermissions: NoteFolder["viewPermissions"];
    writePermissions: NoteFolder["writePermissions"];
    folderId?: string;
  },
  string
>((params) => {
  const {
    uid,
    campaignId,
    order,
    parentFolderId,
    name,
    viewPermissions,
    writePermissions,
    folderId,
  } = params;

  return new Promise((resolve, reject) => {
    const folder: NoteFolder = {
      name: name ?? "New Folder",
      order,
      creator: uid,
      parentFolderId,
      viewPermissions: viewPermissions,
      writePermissions: writePermissions,
    };

    if (folderId) {
      setDoc(getNoteFolderDocument(campaignId, folderId), folder)
        .then(() => resolve(folderId))
        .catch((e) => {
          reject(e);
        });
    } else {
      addDoc(getNoteFolderCollection(campaignId), folder)
        .then((doc) => {
          resolve(doc.id);
        })
        .catch((e) => {
          reject(e);
        });
    }
  });
}, "Failed to add folder.");