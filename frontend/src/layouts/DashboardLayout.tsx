// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import * as React from "react";
import { Outlet } from "react-router";

import { DashboardLayout as BaseLayout } from "@toolpad/core/DashboardLayout";

export default function DashboardLayout(): React.JSX.Element {
  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  );
}
