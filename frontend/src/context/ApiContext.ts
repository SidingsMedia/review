// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import { createContext, useContext } from "react";

import { Api } from "../lib/api/Api";

export const ApiContext = createContext<Api>(new Api());

export function useApi(): Api {
  return useContext(ApiContext);
}
