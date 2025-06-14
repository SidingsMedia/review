// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";

import type { ActivePage, PageHeaderProps } from "@toolpad/core";

import * as React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import ReactPlayer from "react-player";
import { useParams } from "react-router";

import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";

import { PageContainer, useActivePage } from "@toolpad/core";

import EventViewerControls, {
  type EventViewerControlsProps,
} from "../components/titlebars/EventViewerControls";
import { useApi } from "../context/ApiContext";
import { useBranding } from "../context/BrandContext";

export default function EventPage(): React.JSX.Element {
  const branding = useBranding();
  const params = useParams();
  const activePage = useActivePage();
  const api = useApi();

  const [playbackRate, setPlaybackRate] = React.useState<number>(1);

  const zoomRef = React.useRef<ReactZoomPanPinchContentRef | null>(null);

  const id = Number(params.eventId);
  const title = `Event ${id.toString()}`;
  const path = `${activePage?.path ?? ""}/${id.toString()}`;

  const breadcrumbs = [
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    ...(activePage as ActivePage).breadcrumbs,
    { title, path },
  ];

  const video = api.constructUrl(`event/${id.toString()}/export`).toString();

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    document.title = `${title} | ${branding.title}`;
  });

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
            eventId: id,
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
                  url={video}
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
