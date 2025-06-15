// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { Event } from "../../lib/api/responses";

import type { PlaybackSpeedSelectProps } from "../input/PlaybackSpeedSelect";
import type { ZoomControlsProps } from "../input/ZoomControls";

import type { PageHeaderProps, PageHeaderToolbarProps } from "@toolpad/core";

import * as React from "react";

import Divider from "@mui/material/Divider";
import DownloadIcon from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { PageHeader, PageHeaderToolbar } from "@toolpad/core";

import { formatRuntime, humanFileSize } from "../../lib/util";
import PlaybackSpeedSelect from "../input/PlaybackSpeedSelect";
import ZoomControls from "../input/ZoomControls";

interface ToolbarProps {
  rateSelectProps: PlaybackSpeedSelectProps;
  zoomControlsProps: ZoomControlsProps;
  loaded: boolean;
  event?: Event;
}

export type EventViewerControlsProps = PageHeaderProps & {
  toolbarProps: ToolbarProps;
};

function Toolbar(props: ToolbarProps): React.JSX.Element {
  return (
    <PageHeaderToolbar>
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography>
          Runtime:{" "}
          {props.loaded && props.event ? (
            formatRuntime(props.event.runtime)
          ) : (
            <Skeleton
              variant="text"
              width={70}
              sx={{ display: "inline-block" }}
            />
          )}
        </Typography>
        <Typography>
          Size:{" "}
          {props.loaded && props.event ? (
            humanFileSize(props.event.size)
          ) : (
            <Skeleton
              variant="text"
              width={70}
              sx={{ display: "inline-block" }}
            />
          )}
        </Typography>
        <Tooltip title="Download">
          <IconButton
            aria-label="Download"
            disabled={!props.loaded}
            onClick={() => {
              if (!props.event) {
                return;
              }

              const link = document.createElement("a");
              link.href = props.event.location;
              link.setAttribute(
                "download",
                `event-${props.event.id.toString()}.mp4`,
              );
              link.setAttribute("target", "_blank");
              document.body.appendChild(link);
              link.click();
              link.parentNode?.removeChild(link);
            }}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" variant="middle" flexItem />
        <ZoomControls {...props.zoomControlsProps} />
      </Stack>
      <PlaybackSpeedSelect {...props.rateSelectProps} />
    </PageHeaderToolbar>
  );
}

export default function EventViewerControls(
  props: EventViewerControlsProps,
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
