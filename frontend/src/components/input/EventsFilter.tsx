// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { DateTime } from "luxon";

import * as React from "react";

import Button from "@mui/material/Button";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import SearchIcon from "@mui/icons-material/Search";
import Stack from "@mui/material/Stack";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

import type { Monitor } from "../../lib/api/responses";
import MonitorAutoSelect from "../input/MonitorAutoSelect";

export interface EventsFilterError {
  dateFrom?: string | null;
  dateTo?: string | null;
  monitors?: string | null;
}

export interface EventsFilterProps {
  loading?: boolean;
  onSearch: (
    dateFrom: DateTime | null,
    dateTo: DateTime | null,
    selectedMonitors: Monitor[] | null,
  ) => EventsFilterError | undefined;
}

export default function EventsFilter(
  props: EventsFilterProps,
): React.JSX.Element {
  const [selectedMonitors, setSelectedMonitors] = React.useState<
    Monitor[] | null
  >([]);
  const [dateFrom, setDateFrom] = React.useState<DateTime | null>(null);
  const [dateTo, setDateTo] = React.useState<DateTime | null>(null);
  const [error, setError] = React.useState<EventsFilterError | undefined>();

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
        disabled={props.loading}
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
          },
        }}
      />
      <DateTimePicker
        disableFuture
        disabled={props.loading}
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
          },
        }}
      />

      <MonitorAutoSelect
        multiple
        disabled={props.loading}
        value={selectedMonitors}
        onChange={(_e, val) => {
          setSelectedMonitors(val);
        }}
        error={!!error?.monitors}
        helperText={error?.monitors}
      />

      <Button
        variant="outlined"
        sx={{ p: 1, width: "56px", height: "56px" }}
        loading={props.loading}
        onClick={() => {
          setError(props.onSearch(dateFrom, dateTo, selectedMonitors));
        }}
      >
        <SearchIcon />
      </Button>
    </Stack>
  );
}
