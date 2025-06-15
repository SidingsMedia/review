// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";

import type { ActivePage, PageHeaderProps } from "@toolpad/core";

import type { Event } from "../lib/api/responses";

import * as React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import ReactPlayer from "react-player";
import { useParams } from "react-router";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

import { PageContainer, useActivePage, useNotifications } from "@toolpad/core";

import EventViewerControls, {
  type EventViewerControlsProps,
} from "../components/titlebars/EventViewerControls";
import { ApiError } from "../lib/api/ApiError";
import { NOTIFICATION_DISPLAY_TIME } from "../lib/api/constants";
import { useApi } from "../context/ApiContext";
import { useBranding } from "../context/BrandContext";

export default function EventPage(): React.JSX.Element {
  const activePage = useActivePage();
  const api = useApi();
  const branding = useBranding();
  const notifications = useNotifications();
  const params = useParams();

  const [playbackRate, setPlaybackRate] = React.useState<number>(1);
  const [loaded, setLoaded] = React.useState(false);
  const [event, setEvent] = React.useState<Event | undefined>();

  const zoomRef = React.useRef<ReactZoomPanPinchContentRef | null>(null);

  const id = Number(params.eventId);
  const title = `Event ${id.toString()}`;
  const path = `${activePage?.path ?? ""}/${id.toString()}`;

  const breadcrumbs = [
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    ...(activePage as ActivePage).breadcrumbs,
    { title, path },
  ];

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    document.title = `${title} | ${branding.title}`;
  });

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
        event = await api.get<Event>(`event/${id.toString()}`, {
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
  }, [api, id, loaded, notifications]);

  return (
    <PageContainer
      maxWidth={false}
      title={title}
      breadcrumbs={breadcrumbs}
      slotProps={{
        header: {
          toolbarProps: {
            rateSelectProps: {
              value: playbackRate,
              onChange: (val) => {
                setPlaybackRate(val);
              },
            },
            zoomControlsProps: {
              ref: zoomRef,
            },
            event: event,
            loaded: loaded,
          } as EventViewerControlsProps["toolbarProps"],
        } as PageHeaderProps,
      }}
      slots={{ header: EventViewerControls }}
      sx={{ flex: 1 }}
    >
      <Container component="main" maxWidth={false}>
        <Stack direction="column">
          <TransformWrapper
            ref={(ref) => {
              zoomRef.current = ref;
            }}
          >
            <TransformComponent>
              <div style={{ maxHeight: "80vh" }}>
                <ReactPlayer
                  url={event?.location}
                  height="100%"
                  width="100%"
                  // TODO: Custom controls
                  controls
                  playbackRate={playbackRate}
                  pip={false}
                />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </Stack>
      </Container>
    </PageContainer>
  );
}
