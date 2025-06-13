// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import type { Error as ErrorResponse } from "./responses";

export class ApiError extends Error {
  public error: ErrorResponse;

  public constructor(message: string, error: ErrorResponse) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);

    this.error = error;
  }
}
