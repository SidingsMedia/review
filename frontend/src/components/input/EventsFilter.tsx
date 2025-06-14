// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { DateTime } from "luxon";

import type { InputBasePropsSizeOverrides } from "@mui/material/InputBase";
import type { OverridableStringUnion } from "@mui/types";

import * as React from "react";

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Stack from "@mui/material/Stack";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

import { useNotifications } from "@toolpad/core";

import type { Event, List, Monitor } from "../../lib/api/responses";
import { ApiError } from "../../lib/api/ApiError";
import MonitorAutoSelect from "../input/MonitorAutoSelect";
import { NOTIFICATION_DISPLAY_TIME } from "../../lib/api/constants";
import { useApi } from "../../context/ApiContext";

export interface EventsFilterError {
  dateFrom?: string | null;
  dateTo?: string | null;
  monitors?: string | null;
}

export interface EventsFilterProps {
  size?: OverridableStringUnion<
    "small" | "medium",
    InputBasePropsSizeOverrides
  >;
  onSearch?: (events: Event[], selectedMonitors: Monitor[]) => void;
}

export default function EventsFilter(
  props: EventsFilterProps,
): React.JSX.Element {
  const api = useApi();
  const notifications = useNotifications();

  const [monitors, setMonitors] = React.useState<Monitor[] | null>([]);
  const [dateFrom, setDateFrom] = React.useState<DateTime | null>(null);
  const [dateTo, setDateTo] = React.useState<DateTime | null>(null);
  const [error, setError] = React.useState<EventsFilterError | undefined>();

  const [loading, setLoading] = React.useState(false);

  function loadEvents(): void {
    setLoading(true);

    setError(undefined);
    const error: EventsFilterError = {};

    let hasError = false;
    if (!dateFrom) {
      error.dateFrom = "Please enter a start date";
      hasError = true;
    }

    if (!dateTo) {
      error.dateTo = "Please enter an end date";
      hasError = true;
    }

    if (!monitors || monitors.length === 0) {
      error.monitors = "Please select at least one monitor";
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      setError(error);
      return;
    }

    void (async () => {
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      let request = `event?after=${(dateFrom as DateTime).toISO({ includeOffset: false }) as string}&before=${(dateTo as DateTime).toISO({ includeOffset: false }) as string}`;
      if (monitors !== null && monitors.length > 0) {
        for (const monitor of monitors) {
          request += `&monitor=${monitor.id.toString()}`;
        }
      }

      let events: List<Event>;
      try {
        events = await api.get<List<Event>>(request);
      } catch (e) {
        if (e instanceof ApiError) {
          notifications.show(e.error.message, {
            severity: "error",
            autoHideDuration: NOTIFICATION_DISPLAY_TIME,
          });
          setLoading(false);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        notifications.show(`Network Error: ${e}`, {
          severity: "error",
          autoHideDuration: NOTIFICATION_DISPLAY_TIME,
        });
        setLoading(false);
        return;
      }

      if (props.onSearch) {
        setLoading(false);
        props.onSearch(events.results, monitors ?? []);
      }
    })();
  }

  return (
    <Stack
      useFlexGap
      flexWrap={"wrap"}
      direction={{ sm: "column", md: "row" }}
      gap={1}
      style={{ flex: 1, marginLeft: 0.5, marginRight: 0.5 }}
    >
      <DateTimePicker
        disableFuture
        disabled={loading}
        label="From"
        viewRenderers={{
          hours: renderTimeViewClock,
          minutes: renderTimeViewClock,
          seconds: renderTimeViewClock,
        }}
        maxDateTime={dateTo ?? undefined}
        value={dateFrom}
        onChange={(val) => {
          setDateFrom(val);
        }}
        onError={(newError) => {
          setError({ ...error, dateFrom: newError });
        }}
        slotProps={{
          textField: {
            required: true,
            helperText: error?.dateFrom,
            error: !!error?.dateFrom,
            size: props.size,
          },
        }}
      />
      <DateTimePicker
        disableFuture
        disabled={loading}
        label="To"
        viewRenderers={{
          hours: renderTimeViewClock,
          minutes: renderTimeViewClock,
          seconds: renderTimeViewClock,
        }}
        minDateTime={dateFrom ?? undefined}
        value={dateTo}
        onChange={(val) => {
          setDateTo(val);
        }}
        onError={(newError) => {
          setError({ ...error, dateTo: newError });
        }}
        slotProps={{
          textField: {
            required: true,
            helperText: error?.dateTo,
            error: !!error?.dateTo,
            size: props.size,
          },
        }}
      />

      <MonitorAutoSelect
        multiple
        disabled={loading}
        value={monitors}
        onChange={(_e, val) => {
          setMonitors(val);
        }}
        error={!!error?.monitors}
        helperText={error?.monitors}
        size={props.size}
      />

      <IconButton
        // variant="outlined"
        // sx={{ p: 1, width: "56px", height: "56px" }}
        loading={loading}
        onClick={() => {
          loadEvents();
        }}
      >
        <SearchIcon />
      </IconButton>
    </Stack>
  );
}
