// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import { RouterProvider } from "react-router/dom";
import { StrictMode } from "react";
import { createBrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import DashboardLayout from "./layouts/DashboardLayout";
import EventPage from "./pages/EventPage.tsx";
import EventsListPage from "./pages/EventsListPage.tsx";
import IndexPage from "./pages/IndexPage.tsx";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: DashboardLayout,
        children: [
          { path: "/", Component: IndexPage },
          {
            path: "/events",
            Component: EventsListPage,
          },
          { path: "/events/:eventId", Component: EventPage },
        ],
      },
    ],
  },
]);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
