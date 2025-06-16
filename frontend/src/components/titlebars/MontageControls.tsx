// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { DateTime } from "luxon";

import type { PageHeaderProps, PageHeaderToolbarProps } from "@toolpad/core";

import type { Event, Monitor } from "../../lib/api/responses";
import type { PlaybackSpeedSelectProps } from "../input/PlaybackSpeedSelect";

import * as React from "react";

import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { PageHeader, PageHeaderToolbar } from "@toolpad/core";

import EventsFilter from "../input/EventsFilter";
import PlaybackSpeedSelect from "../input/PlaybackSpeedSelect";

interface ToolbarProps {
  rateSelectProps: PlaybackSpeedSelectProps;
  isPaused?: boolean;
  onPause?: () => void;
  onPlay?: () => void;
  onEventsLoad: (events: Event[], monitors: Monitor[]) => void;
  layout: number;
  onLayoutChange: (layout: number) => void;
  onDateFromChange: (dateFrom: DateTime | null) => void;
  onDateToChange: (dateTo: DateTime | null) => void;
}

export type MontageControlsProps = PageHeaderProps & {
  toolbarProps: ToolbarProps;
};

function Toolbar(props: ToolbarProps): React.JSX.Element {
  return (
    <div style={{ flex: 1 }}>
      <PageHeaderToolbar>
        <Stack
          alignItems="center"
          gap={1}
          sx={{ flex: 1 }}
          maxWidth="lg"
          marginLeft="auto"
          flexWrap={"wrap"}
          direction={{ sm: "column", md: "row" }}
        >
          <EventsFilter
            onSearch={props.onEventsLoad}
            onDateFromChange={props.onDateFromChange}
            onDateToChange={props.onDateToChange}
            size="small"
          />
          <Divider orientation="vertical" variant="middle" flexItem />
          <Tooltip title={props.isPaused ? "Play" : "Pause"}>
            <IconButton
              onClick={() => {
                if (props.isPaused) {
                  if (props.onPlay) {
                    props.onPlay();
                  }
                } else {
                  if (props.onPause) {
                    props.onPause();
                  }
                }
              }}
            >
              {props.isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>
          </Tooltip>
          <PlaybackSpeedSelect {...props.rateSelectProps} />

          {props.rateSelectProps.value > 8 ? (
            <Tooltip title="Playback rates above 8 may experience degraded performance, buffering, excessive skipping or sync issues.">
              <WarningAmberIcon color="warning" />
            </Tooltip>
          ) : null}

          <FormControl sx={{ margin: 1, minWidth: 120 }}>
            <InputLabel id="layout-select-label">Layout</InputLabel>
            <Select
              id="layout-select"
              label="Layout"
              labelId="layout-select-label"
              value={props.layout}
              onChange={(event) => {
                props.onLayoutChange(event.target.value);
              }}
              size="small"
            >
              <MenuItem value={2}>2 Wide</MenuItem>
              <MenuItem value={3}>3 Wide</MenuItem>
              <MenuItem value={4}>4 Wide</MenuItem>
              <MenuItem value={5}>5 Wide</MenuItem>
              <MenuItem value={6}>6 Wide</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </PageHeaderToolbar>
    </div>
  );
}

export default function MontageControls(
  props: MontageControlsProps,
): React.JSX.Element {
  return (
    <PageHeader
      slots={{ toolbar: Toolbar }}
      {...props}
      slotProps={{
        toolbar: { ...props.toolbarProps } as unknown as PageHeaderToolbarProps,
      }}
    />
  );
}
