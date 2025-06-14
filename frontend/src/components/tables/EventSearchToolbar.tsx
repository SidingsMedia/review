// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { DateTime } from "luxon";

import type { GridSlotProps } from "@mui/x-data-grid";

import type { EventsFilterError } from "../input/EventsFilter";

import * as React from "react";

import { ColumnsPanelTrigger, Toolbar, ToolbarButton } from "@mui/x-data-grid";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

import { useNotifications } from "@toolpad/core/useNotifications";

import type { Event, List, Monitor } from "../../lib/api/responses";
import { ApiError } from "../../lib/api/ApiError";
import EventsFilter from "../input/EventsFilter";
import { NOTIFICATION_DISPLAY_TIME } from "../../lib/api/constants";
import { useApi } from "../../context/ApiContext";

export default function EventSearchToolbar(
  props: GridSlotProps["toolbar"] & {
    onDataLoad?: (events: Event[], monitors: Monitor[]) => void;
  },
) {
  const api = useApi();
  const notifications = useNotifications();

  const [loading, setLoading] = React.useState(false);

  function loadEvents(
    dateFrom: DateTime | null,
    dateTo: DateTime | null,
    monitors: Monitor[] | null,
  ): EventsFilterError | undefined {
    setLoading(true);

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
      return error;
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

      if (props.onDataLoad) {
        setLoading(false);
        props.onDataLoad(events.results, monitors ?? []);
      }
    })();
  }

  return (
    <Toolbar style={{ marginTop: 2, marginBottom: 2 }}>
      <EventsFilter
        loading={loading}
        onSearch={(dateFrom, dateTo, monitors) =>
          loadEvents(dateFrom, dateTo, monitors)
        }
      />

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
