import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";
import { useAtom } from "jotai";

import { createGameAtom } from "../atoms/createGame.atom";
import { SectionHeading } from "components/SectionHeading";

export function GameDetails() {
  const { t } = useTranslation();
  const [gameDetails, setGameDetails] = useAtom(createGameAtom);

  return (
    <>
      <SectionHeading
        label={t("game.create.game-details", "Game Details")}
        breakContainer
      />
      <TextField
        sx={{ mt: 2 }}
        label={t("game.create.game-name", "Game Name")}
        value={gameDetails.gameName}
        onChange={(e) =>
          setGameDetails({ ...gameDetails, gameName: e.target.value })
        }
      />
    </>
  );
}
