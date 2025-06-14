// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";

import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

export interface ZoomControlsProps {
  ref: React.RefObject<ReactZoomPanPinchContentRef | null>;
}

export default function ZoomControls(
  props: ZoomControlsProps,
): React.JSX.Element {
  return (
    <Stack direction="row">
      <Tooltip title="Zoom in">
        <IconButton
          onClick={() => {
            props.ref.current?.zoomIn();
          }}
        >
          <ZoomInIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reset zoom">
        <IconButton
          onClick={() => {
            props.ref.current?.resetTransform();
          }}
        >
          <CenterFocusStrongIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Zoom out">
        <IconButton
          onClick={() => {
            props.ref.current?.zoomOut();
          }}
        >
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
