// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { List, Monitor } from "../../lib/api/responses";

import * as React from "react";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { useNotifications } from "@toolpad/core/useNotifications";

import { ApiError } from "../../lib/api/ApiError";
import { NOTIFICATION_DISPLAY_TIME } from "../../lib/api/constants";
import { useApi } from "../../context/ApiContext";

interface MonitorAutoSelectPropsBase {
  disabled?: boolean;
  error?: boolean;
  helperText?: string | null;
}

interface MonitorAutoSelectPropsSingle extends MonitorAutoSelectPropsBase {
  multiple: false;
  onChange: (event: React.SyntheticEvent, value: Monitor | null) => void;
  value: Monitor | null;
}

interface MonitorAutoSelectPropsMultiple extends MonitorAutoSelectPropsBase {
  multiple: true;
  onChange: (event: React.SyntheticEvent, value: Monitor[] | null) => void;
  value: Monitor[] | null;
}

export type MonitorAutoSelectProps =
  | MonitorAutoSelectPropsSingle
  | MonitorAutoSelectPropsMultiple;

export default function MonitorAutoSelect(
  props: MonitorAutoSelectProps,
): React.JSX.Element {
  const api = useApi();
  const notifications = useNotifications();

  const [loaded, setLoaded] = React.useState(false);
  const [monitors, setMonitors] = React.useState<Monitor[]>([]);

  React.useEffect(() => {
    const abortController = new AbortController();

    function cleanup(): void {
      abortController.abort();
    }

    async function loadMonitors(
      signal: AbortSignal,
    ): Promise<(() => void) | undefined> {
      let monitors: List<Monitor>;
      try {
        monitors = await api.get<List<Monitor>>("monitor", { signal });
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

      setMonitors(monitors.results);
      setLoaded(true);
    }

    if (!loaded) {
      void loadMonitors(abortController.signal);
    }

    return cleanup;
  }, [api, loaded, notifications]);

  return (
    <Autocomplete
      disabled={props.disabled}
      loading={!loaded}
      multiple={props.multiple}
      sx={{ flex: 1 }}
      limitTags={2}
      disableCloseOnSelect
      getOptionKey={(option) => option.id}
      getOptionLabel={(option) => option.name}
      options={monitors}
      value={props.value}
      onChange={(e, value) => {
        if (props.multiple) {
          props.onChange(e, value as Monitor[] | null);
        } else {
          props.onChange(e, value as Monitor | null);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={"Monitors"}
          name="target"
          error={props.error}
          helperText={props.helperText}
          slotProps={{
            input: {
              ...params.InputProps,
            },
          }}
        />
      )}
    />
  );
}
