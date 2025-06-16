// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import * as React from "react";
import { Outlet } from "react-router";

import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LocalizationProvider } from "@mui/x-date-pickers";
import PersonalVideoIcon from "@mui/icons-material/PersonalVideo";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

import type { Navigation } from "@toolpad/core";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { useBranding } from "./context/BrandContext";

const NAVIGATION: Navigation = [
  {
    icon: <PersonalVideoIcon />,
    segment: "montage",
    title: "Montage",
  },
  {
    icon: <VideoLibraryIcon />,
    segment: "events",
    title: "Events",
    pattern: "events{/:eventId}?",
  },
];

export default function App(): React.JSX.Element {
  const branding = useBranding();
  // const navigate = useNavigate();

  return (
    <LocalizationProvider adapterLocale="en-gb" dateAdapter={AdapterLuxon}>
      <ReactRouterAppProvider branding={branding} navigation={NAVIGATION}>
        <Outlet />
      </ReactRouterAppProvider>
    </LocalizationProvider>
  );
}
