// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { Event, Monitor } from "../lib/api/responses";
import type { MontageControlsProps } from "../components/titlebars/MontageControls";

import * as React from "react";
import { DateTime } from "luxon";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

import { PageContainer, type PageHeaderProps } from "@toolpad/core";

import Frame from "../components/Frame";
import MontageControls from "../components/titlebars/MontageControls";
import Scrubber from "../components/input/Scrubber";
import { useBranding } from "../context/BrandContext";

export default function MontagePage(): React.JSX.Element {
  const branding = useBranding();

  const [playbackRate, setPlaybackRate] = React.useState<number>(1);
  const [monitors, setMonitors] = React.useState<Monitor[]>([]);
  const [layout, setLayout] = React.useState<number>(2);
  const [paused, setPaused] = React.useState<boolean>(true);
  const [startTimestamp, setStartTimestamp] = React.useState<DateTime | null>(
    null,
  );
  const [endTimestamp, setEndTimestamp] = React.useState<DateTime | null>(null);
  const [currentTimestamp, setCurrentTimestamp] =
    React.useState<DateTime | null>(null);
  const [events, setEvents] = React.useState<Map<number, Event[]>>();

  const [lastTimstampUpdate, setLastTimestampUpdate] =
    React.useState<DateTime>();

  function handleEventLoad(events: Event[]): void {
    if (import.meta.env.VITE_MIN_FRAMES) {
      events = events.filter(
        (event) => event.frames > import.meta.env.VITE_MIN_FRAMES,
      );
    }
    setEvents(Map.groupBy(events, (event) => event.monitorId));
    setCurrentTimestamp(startTimestamp);
  }

  // Update timestamp
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (lastTimstampUpdate && !paused) {
        const diff =
          DateTime.now().toSeconds() - lastTimstampUpdate.toSeconds();
        setCurrentTimestamp(
          currentTimestamp?.plus({
            seconds: diff * playbackRate,
          }) ?? null,
        );
      }
      setLastTimestampUpdate(DateTime.now());
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [currentTimestamp, lastTimstampUpdate, paused, playbackRate]);

  React.useEffect(() => {
    if (
      currentTimestamp &&
      endTimestamp &&
      currentTimestamp.toMillis() > endTimestamp.toMillis()
    ) {
      setPaused(true);
    }
  }, [currentTimestamp, endTimestamp]);

  React.useEffect(() => {
    if (paused) {
      console.log("Clearing last update");
      setLastTimestampUpdate(undefined);
    }
  }, [paused]);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    document.title = `Montage | ${branding.title}`;
  });

  const frames = [];
  for (const monitor of monitors) {
    frames.push(
      <Grid size={1}>
        <Frame
          events={events?.get(monitor.id)}
          monitorName={monitor.name}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          timestamp={currentTimestamp!}
          playbackRate={playbackRate}
          paused={paused}
        />
      </Grid>,
    );
  }

  return (
    <PageContainer
      maxWidth={false}
      slotProps={{
        header: {
          toolbarProps: {
            rateSelectProps: {
              value: playbackRate,
              onChange: (val) => {
                setPlaybackRate(val);
              },
            },
            onEventsLoad: (events, monitors) => {
              setMonitors(monitors);
              handleEventLoad(events);
            },
            layout,
            onLayoutChange: (layout: number) => {
              setLayout(layout);
            },
            onDateFromChange: (dateFrom: DateTime | null) => {
              setStartTimestamp(dateFrom);
            },
            onDateToChange: (dateTo: DateTime | null) => {
              setEndTimestamp(dateTo);
            },
            isPaused: paused,
            onPause: () => {
              setPaused(true);
            },
            onPlay: () => {
              setPaused(false);
            },
          } as MontageControlsProps["toolbarProps"],
        } as PageHeaderProps,
      }}
      slots={{ header: MontageControls }}
    >
      <Container component="main" maxWidth={false}>
        {currentTimestamp && startTimestamp && endTimestamp ? (
          <Scrubber
            value={currentTimestamp}
            min={startTimestamp}
            max={endTimestamp}
            onChange={(val) => {
              setCurrentTimestamp(val);
            }}
          />
        ) : null}
        <Grid container spacing={1} columns={layout}>
          {frames}
        </Grid>
      </Container>
    </PageContainer>
  );
}
