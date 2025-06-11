// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { Branding } from "@toolpad/core";

import React, { createContext } from "react";

const BRANDING = {
  // logo: <img alt="MUI logo" height={40} src="/icon.svg" width={40} />,
  title: "Review",
};

export const BrandContext = createContext<Branding>(BRANDING);
export function useBranding(): Branding {
  return React.useContext(BrandContext);
}
