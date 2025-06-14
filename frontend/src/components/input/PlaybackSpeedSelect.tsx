// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import * as React from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

export interface PlaybackSpeedSelectProps {
  onChange: (value: number) => void;
  value: number;
}

export default function PlaybackSpeedSelect(
  props: PlaybackSpeedSelectProps,
): React.JSX.Element {
  const rateOptions = [];
  for (let i = 0; i < 8; i++) {
    rateOptions.push(<MenuItem value={2 ** (i - 2)}>{2 ** (i - 2)}x</MenuItem>);
  }

  return (
    <FormControl sx={{ margin: 1, minWidth: 120 }}>
      <InputLabel id="playback-rate-select-label">Playback Rate</InputLabel>
      <Select
        id="playback-rate-select"
        label="Playback Rate"
        labelId="playback-rate-select-label"
        value={props.value}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
        size="small"
      >
        {rateOptions}
      </Select>
    </FormControl>
  );
}
