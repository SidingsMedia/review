// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { Event } from "../lib/api/responses";

import * as React from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { DateTime } from "luxon";
import ReactPlayer from "react-player";

import { CircularProgress, Typography } from "@mui/material";
import Box from "@mui/material/Box";

export interface FrameProps {
  events?: Event[];
  monitorName: string;
  timestamp: DateTime;
  playbackRate: number;
  paused: boolean;
}

export default function Frame(props: FrameProps): React.JSX.Element {
  const MAX_TIME_DIFF = 1000; // 3 Seconds of normal time
  const ALERT_TIME_DIFF = MAX_TIME_DIFF * 3;

  const [currentEvent, setCurrentEvent] = React.useState<Event>();
  const [nextEvent, setNextEvent] = React.useState<Event>();
  const [progress, setProgress] = React.useState<number>();
  const playerRef = React.createRef<ReactPlayer>();

  const calculateTimeDiff = React.useCallback((): number => {
    if (currentEvent) {
      const eventStart = DateTime.fromISO(currentEvent.start);
      const eventTimestamp = eventStart.plus({ seconds: progress });

      const diff = Math.abs(
        eventTimestamp.toMillis() - props.timestamp.toMillis(),
      );

      return diff;
    }
    return 0;
  }, [currentEvent, progress, props.timestamp]);

  React.useEffect(() => {
    const i = props.events?.findIndex(
      (event) =>
        DateTime.fromISO(event.start) <= props.timestamp &&
        DateTime.fromISO(event.end) > props.timestamp,
    );

    if (i !== undefined && props.events) {
      setCurrentEvent(props.events[i]);
      if (i + 1 < props.events.length) {
        setNextEvent(props.events[i + 1]);
      }
    }

    // Make sure video is synced to within a few seconds
    if (currentEvent) {
      const eventStart = DateTime.fromISO(currentEvent.start);
      const diff = calculateTimeDiff();
      // Offset is greater than 3 seconds
      if (diff > MAX_TIME_DIFF * props.playbackRate) {
        const syncedVideoTime =
          (props.timestamp.toMillis() - eventStart.toMillis()) / 1000;
        playerRef.current?.seekTo(syncedVideoTime, "seconds");
      }
    }
  }, [
    calculateTimeDiff,
    currentEvent,
    playerRef,
    progress,
    props.events,
    props.playbackRate,
    props.timestamp,
  ]);

  return (
    <Box
      width="100%"
      height="100%"
      border={1}
      sx={{
        aspectRatio:
          !currentEvent ||
          calculateTimeDiff() > ALERT_TIME_DIFF * props.playbackRate
            ? 16 / 9
            : undefined,
      }}
      position="relative"
    >
      <TransformWrapper>
        <TransformComponent>
          <div
            onClick={() =>
              window.open(
                `/events/${currentEvent?.id.toString() ?? ""}`,
                "_blank",
              )
            }
          >
            <ReactPlayer
              ref={playerRef}
              url={currentEvent?.location}
              width="100%"
              height="100%"
              playbackRate={props.playbackRate}
              pip={false}
              muted
              playing={!props.paused}
              // controls
              onProgress={({ playedSeconds }) => {
                setProgress(playedSeconds);
              }}
            />
            {nextEvent ? (
              <ReactPlayer
                url={nextEvent.location}
                pip={false}
                muted
                playing={false}
                style={{ display: "none" }}
              />
            ) : null}
          </div>
        </TransformComponent>
      </TransformWrapper>
      {!currentEvent ||
      calculateTimeDiff() > ALERT_TIME_DIFF * props.playbackRate ? (
        <Box
          position="absolute"
          top={0}
          left={0}
          zIndex={10}
          margin="auto"
          width="100%"
          height="100%"
          display="flex"
          flexDirection="row"
        >
          {calculateTimeDiff() > ALERT_TIME_DIFF * props.playbackRate ? (
            <div
              style={{
                margin: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h5" component="p" margin="auto">
                {props.monitorName}
              </Typography>
              <CircularProgress style={{ margin: "auto" }} />
              <Typography margin="auto" variant="h6" component="p">
                Catching Up
              </Typography>
            </div>
          ) : (
            <Typography margin="auto" variant="h5" component="p">
              No Data
            </Typography>
          )}
        </Box>
      ) : null}
    </Box>
  );
}
