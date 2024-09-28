import { Datasworn } from "@datasworn/core";
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import ChevronIcon from "@mui/icons-material/ChevronRight";
import { useState } from "react";
import { ListItemIcon } from "@mui/material";
import { OracleListItem } from "./OracleListItem";
import {
  CollectionVisibilityState,
  VisibilitySettings,
} from "./getOracleCollectionVisiblity";

export interface OracleCollectionListItemProps {
  oracleCollectionId: string;
  oracleCollectionMap: Record<string, Datasworn.OracleCollection>;
  oracleRollableMap: Record<string, Datasworn.OracleRollable>;
  disabled?: boolean;
  visibilitySettings: VisibilitySettings;
  isSearchActive: boolean;
  isFullCollectionVisible?: boolean;
}

export function OracleCollectionListItem(props: OracleCollectionListItemProps) {
  const {
    oracleCollectionId,
    oracleCollectionMap,
    oracleRollableMap,
    disabled,
    visibilitySettings,
    isSearchActive,
    isFullCollectionVisible,
  } = props;

  const oracleCollection = oracleCollectionMap[oracleCollectionId];

  const [isExpanded, setIsExpanded] = useState(false);

  let collectionVisibilityState = CollectionVisibilityState.All;
  if (isSearchActive && !isFullCollectionVisible) {
    collectionVisibilityState =
      visibilitySettings.visibleCollections[oracleCollectionId] ??
      CollectionVisibilityState.Hidden;
  }

  if (
    !oracleCollection ||
    collectionVisibilityState === CollectionVisibilityState.Hidden
  ) {
    return null;
  }

  const isExpandedOrForced = isExpanded || isSearchActive;

  return (
    <>
      <ListItem
        disablePadding={!isSearchActive}
        sx={(theme) => ({
          bgcolor: "background.default",
          mt: isExpanded ? 0.5 : 0,
          color: theme.palette.grey[theme.palette.mode === "light" ? 700 : 200],
          ...theme.typography.body1,
          fontFamily: theme.typography.fontFamilyTitle,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: theme.transitions.create(["margin"], {
            duration: theme.transitions.duration.shorter,
          }),
        })}
      >
        {isSearchActive ? (
          <ListItemText>{oracleCollection.name}</ListItemText>
        ) : (
          <ListItemButton
            disabled={disabled || isSearchActive}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <ListItemText>{oracleCollection.name}</ListItemText>
            <ListItemIcon sx={{ minWidth: "unset" }}>
              <ChevronIcon
                sx={(theme) => ({
                  transform: `rotate(${isExpanded ? "-" : ""}90deg)`,
                  transition: theme.transitions.create(["transform"], {
                    duration: theme.transitions.duration.shorter,
                  }),
                })}
              />
            </ListItemIcon>
          </ListItemButton>
        )}
      </ListItem>

      <Collapse unmountOnExit in={isExpandedOrForced}>
        <List sx={{ py: 0, mb: isExpandedOrForced ? 0.5 : 0 }}>
          {Object.values(oracleCollection.contents).map((oracle) => (
            <OracleListItem
              key={oracleCollection._id + "-" + oracle._id}
              oracle={oracle}
              disabled={!isExpandedOrForced || disabled}
              visibilitySettings={visibilitySettings}
              isSearchActive={isSearchActive}
              isFullCollectionVisible={
                collectionVisibilityState === CollectionVisibilityState.All
              }
            />
          ))}
          {oracleCollection.oracle_type === "tables" &&
            Object.values(oracleCollection.collections).map((subCollection) => (
              <OracleCollectionListItem
                key={oracleCollection._id + "-" + subCollection._id}
                disabled={!isExpandedOrForced || disabled}
                oracleCollectionId={subCollection._id}
                oracleCollectionMap={oracleCollectionMap}
                oracleRollableMap={oracleRollableMap}
                visibilitySettings={visibilitySettings}
                isSearchActive={isSearchActive}
                isFullCollectionVisible={
                  collectionVisibilityState === CollectionVisibilityState.All
                }
              />
            ))}
        </List>
      </Collapse>
    </>
  );
}
