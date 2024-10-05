import { Box, Typography } from "@mui/material";
import { MoveTree } from "components/datasworn/MoveTree";
import { OracleTree } from "components/datasworn/OracleTree";
import { StyledTab, StyledTabs } from "components/StyledTabs";
import { useState } from "react";
import { useTranslation } from "react-i18next";

enum Tabs {
  Moves = "moves",
  Oracles = "oracles",
  GameLog = "game-log",
}

function tabProps(tab: Tabs) {
  return {
    value: tab,
    id: `tab-${tab}`,
    "aria-controls": `tabpanel-${tab}`,
  };
}

function tabPanelProps(tab: Tabs, value: Tabs) {
  return {
    hidden: tab !== value,
    role: "tabpanel",
    id: `tabpanel-${tab}`,
    "aria-labelledby": `tab-${tab}`,
    mx: -2,
  };
}

export function ReferenceSidebarContents() {
  const { t } = useTranslation();

  const [currentTab, setCurrentTab] = useState<Tabs>(Tabs.Moves);
  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Typography fontFamily={"fontFamilyTitle"} textTransform={"uppercase"}>
          {t("character.reference-sidebar-title", "Reference")}
        </Typography>
      </Box>
      <StyledTabs
        sx={{ mx: -2 }}
        centered
        value={currentTab}
        onChange={(_, value) => setCurrentTab(value as unknown as Tabs)}
      >
        <StyledTab
          label={t("character.reference-sidebar-moves", "Moves")}
          {...tabProps(Tabs.Moves)}
        />
        <StyledTab
          label={t("character.reference-sidebar-oracles", "Oracles")}
          {...tabProps(Tabs.Oracles)}
        />
        <StyledTab
          label={t("character.reference-sidebar-game-log", "Game Log")}
          {...tabProps(Tabs.GameLog)}
        />
      </StyledTabs>
      <Box {...tabPanelProps(Tabs.Moves, currentTab)}>
        <MoveTree />
      </Box>
      <Box {...tabPanelProps(Tabs.Oracles, currentTab)}>
        <OracleTree />
      </Box>
      <Box {...tabPanelProps(Tabs.GameLog, currentTab)}>
        <Typography>Game Log</Typography>
      </Box>
    </>
  );
}
