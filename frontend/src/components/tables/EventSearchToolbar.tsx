// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { GridSlotProps } from "@mui/x-data-grid";

import * as React from "react";

import { ColumnsPanelTrigger, Toolbar, ToolbarButton } from "@mui/x-data-grid";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

import type { Event, Monitor } from "../../lib/api/responses";
import EventsFilter from "../input/EventsFilter";

export default function EventSearchToolbar(
  props: GridSlotProps["toolbar"] & {
    onDataLoad?: (events: Event[], monitors: Monitor[]) => void;
  },
): React.JSX.Element {
  return (
    <Toolbar style={{ marginTop: 2, marginBottom: 2 }}>
      <EventsFilter
        onSearch={(events, monitors) => {
          if (props.onDataLoad) {
            props.onDataLoad(events, monitors);
          }
        }}
      />

      <Divider
        orientation="vertical"
        variant="middle"
        flexItem
        sx={{ mx: 0.5 }}
      />

      <Tooltip title="Columns">
        <ColumnsPanelTrigger render={<ToolbarButton />}>
          <ViewColumnIcon fontSize="small" />
        </ColumnsPanelTrigger>
      </Tooltip>
    </Toolbar>
  );
}
