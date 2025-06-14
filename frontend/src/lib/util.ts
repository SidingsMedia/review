// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import { Duration } from "luxon";

/**
 * Format a runtime as a digital style mm:ss (or hh:mm:ss if there is an
 * hours component).
 *
 * @param runtime Runtime in seconds
 * @returns Formatted digital style runtime.
 */
export function formatRuntime(runtime: number): string {
  const duration = Duration.fromMillis(runtime * 1000);
  if (duration.hours > 0) {
    return duration.toFormat("hh:mm:ss");
  }
  return duration.toFormat("mm:ss");
}

// SPDX-SnippetBegin
// SPDX-SnippetCopyrightText: 2013 Mark Penner <https://github.com/mnpenner>
// SPDX-License-Identifier: CC-BY-SA-4.0

/**
 * Format bytes as human-readable text.
 *
 * https://stackoverflow.com/a/14919494/13306584
 *
 * @param bytes Number of bytes.
 * @param [si=false] True to use metric (SI) units, aka powers of 1000.
 *           False to use binary (IEC), aka powers of 1024.
 * @param [dp=1] Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes.toString() + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

// SPDX-SnippetEnd
