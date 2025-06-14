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

import { PageHeader, PageHeaderToolbar, useNotifications } from "@toolpad/core";

import { formatRuntime, humanFileSize } from "../../lib/util";
import { ApiError } from "../../lib/api/ApiError";
import { NOTIFICATION_DISPLAY_TIME } from "../../lib/api/constants";
import PlaybackSpeedSelect from "../input/PlaybackSpeedSelect";
import ZoomControls from "../input/ZoomControls";
import { useApi } from "../../context/ApiContext";

interface ToolbarProps {
  rateSelectProps: PlaybackSpeedSelectProps;
  zoomControlsProps: ZoomControlsProps;
  eventId: number;
}

export type EventViewerControlsProps = PageHeaderProps & {
  toolbarProps: ToolbarProps;
};

function Toolbar(props: ToolbarProps): React.JSX.Element {
  const api = useApi();
  const notifications = useNotifications();

  const [loaded, setLoaded] = React.useState(false);
  const [event, setEvent] = React.useState<Event | undefined>();

  React.useEffect(() => {
    const abortController = new AbortController();

    function cleanup(): void {
      abortController.abort();
    }

    async function loadEvent(
      signal: AbortSignal,
    ): Promise<(() => void) | undefined> {
      let event: Event;
      try {
        event = await api.get<Event>(`event/${props.eventId.toString()}`, {
          signal,
        });
      } catch (e) {
        if (e instanceof ApiError) {
          notifications.show(e.error.message, {
            severity: "error",
            autoHideDuration: NOTIFICATION_DISPLAY_TIME,
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          notifications.show(`Network error: ${e}`, {
            severity: "error",
            autoHideDuration: NOTIFICATION_DISPLAY_TIME,
          });
        }
        return cleanup;
      }

      setEvent(event);
      setLoaded(true);
    }

    if (!loaded) {
      void loadEvent(abortController.signal);
    }

    return cleanup;
  }, [api, loaded, notifications, props.eventId]);

  return (
    <PageHeaderToolbar>
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography>
          Runtime:{" "}
          {loaded && event ? (
            formatRuntime(event.runtime)
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
          {loaded && event ? (
            humanFileSize(event.size)
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
            // sx={{ width: 50, height: 50 }}
            onClick={() => {
              const link = document.createElement("a");
              link.href = api
                .constructUrl(
                  `event/${props.eventId.toString()}/export?download=true`,
                )
                .toString();
              link.setAttribute("download", "");
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
