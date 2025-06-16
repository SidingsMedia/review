// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import { DateTime } from "luxon";

import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";

export interface ScrubberProps {
  value: DateTime;
  min: DateTime;
  max: DateTime;
  onChange: (value: DateTime) => void;
}

const CustomSlider = styled(Slider)(({ theme }) => ({
  height: 5,
  paddingTop: 15,
  paddingBottom: 15,
  paddingLeft: 0,
  paddingRight: 0,
  "& .MuiSlider-thumb": {
    height: 20,
    width: 20,
  },
  "& .MuiSlider-valueLabel": {
    fontSize: 14,
    fontWeight: "normal",
    top: 50,
    backgroundColor: "unset",
    color: theme.palette.text.primary,
    "&::before": {
      display: "none",
    },
    "& *": {
      background: "transparent",
      color: "#000",
      ...theme.applyStyles("dark", {
        color: "#fff",
      }),
    },
  },
  "& .MuiSlider-track": {
    border: "none",
    height: 5,
  },
}));

export default function Scrubber(props: ScrubberProps): React.JSX.Element {
  return (
    <div style={{ marginLeft: 70, marginRight: 70, marginBottom: 25 }}>
      <CustomSlider
        min={props.min.toSeconds()}
        max={props.max.toSeconds()}
        value={props.value.toSeconds()}
        step={1}
        onChange={(_e, val) => {
          props.onChange(DateTime.fromSeconds(val as number));
        }}
        // slots={{ valueLabel: ValueLabel }}
        valueLabelDisplay="on"
        valueLabelFormat={(value) =>
          DateTime.fromSeconds(value).toLocaleString(
            DateTime.DATETIME_SHORT_WITH_SECONDS,
          )
        }
      />
    </div>
  );
}
