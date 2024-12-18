import { LinearProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { GradientButton } from "components/GradientButton";
import { PageContent, PageHeader } from "components/Layout";
import { EmptyState } from "components/Layout/EmptyState";

import { pathConfig } from "pages/pathConfig";

import { useUID } from "stores/auth.store";

import { GameService, IGame } from "services/game.service";

import { useGameId } from "../gamePageLayout/hooks/useGameId";

export function GameJoinPage() {
  const { t } = useTranslation();

  const gameId = useGameId();
  const uid = useUID();

  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<IGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (gameId && uid) {
      GameService.getGame(gameId)
        .then((game) => {
          setLoading(false);
          setError(undefined);
          setCampaign(game);
          if (game.playerIds.includes(uid)) {
            navigate(pathConfig.game(gameId));
          }
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
          setError(t("game.load-failure", "Failed to load game"));
        });
    } else {
      setLoading(false);
      setError(t("game.find-failure", "Could not find game"));
    }
  }, [gameId, uid, t, navigate]);

  const addUser = () => {
    if (gameId && uid) {
      // Add user to campaign
      GameService.addPlayer(gameId, uid)
        .then(() => {
          navigate(pathConfig.game(gameId));
        })
        .catch(() => {
          setError(t("game.join-failure", "Failed to join game"));
        });
    }
  };

  if (error) {
    return (
      <PageContent maxWidth="md">
        <EmptyState message={error} />
      </PageContent>
    );
  }
  if (loading || !campaign) {
    return <LinearProgress />;
  }

  return (
    <>
      <PageHeader
        label={t("game.join-name", "Join {{campaignName}}", {
          campaignName: campaign.name,
        })}
        maxWidth="md"
      />
      <PageContent maxWidth="md">
        <div>
          <GradientButton onClick={addUser}>
            {t("game.join", "Join")}
          </GradientButton>
        </div>
      </PageContent>
    </>
  );
}
