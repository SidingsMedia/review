// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

export interface Error {
  status: string;
  code: string;
  timestamp: string;
  message: string;
  errors?: {
    message: string;
    field?: string;
    rejectedValue?: string;
    requestedObject?: string;
    objectType?: string;
  }[];
}
