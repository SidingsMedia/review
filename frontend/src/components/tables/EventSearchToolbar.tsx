// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { DateTime } from "luxon";

import type { GridSlotProps } from "@mui/x-data-grid";

import * as React from "react";

import { ColumnsPanelTrigger, Toolbar, ToolbarButton } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

import { useNotifications } from "@toolpad/core/useNotifications";

import type { Event, List, Monitor } from "../../lib/api/responses";
import { ApiError } from "../../lib/api/ApiError";
import MonitorAutoSelect from "../input/MonitorAutoSelect";
import { NOTIFICATION_DISPLAY_TIME } from "../../lib/api/constants";
import { useApi } from "../../context/ApiContext";

export default function EventSearchToolbar(
  props: GridSlotProps["toolbar"] & {
    onDataLoad?: (events: Event[], monitors: Monitor[]) => void;
  },
) {
  const api = useApi();
  const notifications = useNotifications();

  const [selectedMonitors, setSelectedMonitors] = React.useState<
    Monitor[] | null
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [dateFrom, setDateFrom] = React.useState<DateTime | null>(null);
  const [dateTo, setDateTo] = React.useState<DateTime | null>(null);

  const [dateFromError, setDateFromError] = React.useState<string | null>(null);
  const [dateToError, setDateToError] = React.useState<string | null>(null);
  const [monitorsError, setMonitorsError] = React.useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);
    setDateFromError(null);
    setDateToError(null);
    setMonitorsError(null);

    let hasError = false;
    if (!dateFrom) {
      setDateFromError("Please enter a start date");
      hasError = true;
    }

    if (!dateTo) {
      setDateToError("Please enter an end date");
      hasError = true;
    }

    if (!selectedMonitors || selectedMonitors.length === 0) {
      setMonitorsError("Please select at least one monitor");
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    if ((dateFrom as DateTime).valueOf() > (dateTo as DateTime).valueOf()) {
      notifications.show("Start date is after end date", {
        severity: "error",
        autoHideDuration: NOTIFICATION_DISPLAY_TIME,
      });
      setLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    let request = `event?after=${(dateFrom as DateTime).toISO({ includeOffset: false }) as string}&before=${(dateTo as DateTime).toISO({ includeOffset: false }) as string}`;
    if (selectedMonitors !== null && selectedMonitors.length > 0) {
      for (const monitor of selectedMonitors) {
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

    if (props.onDataLoad) {
      setLoading(false);
      props.onDataLoad(events.results, selectedMonitors ?? []);
    }
  }

  return (
    <Toolbar style={{ marginTop: 2, marginBottom: 2 }}>
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
            setDateFromError(newError);
          }}
          slotProps={{
            textField: {
              required: true,
              helperText: dateFromError,
              error: dateFromError !== null,
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
            setDateToError(newError);
          }}
          slotProps={{
            textField: {
              required: true,
              helperText: dateToError,
              error: dateToError !== null,
            },
          }}
        />

        <MonitorAutoSelect
          multiple
          disabled={loading}
          value={selectedMonitors}
          onChange={(_e, val) => {
            setSelectedMonitors(val);
          }}
          error={monitorsError !== null}
          helperText={monitorsError}
        />

        <Button
          variant="outlined"
          sx={{ p: 1, width: "56px", height: "56px" }}
          loading={loading}
          onClick={() => void loadEvents()}
        >
          <SearchIcon />
        </Button>
      </Stack>

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
