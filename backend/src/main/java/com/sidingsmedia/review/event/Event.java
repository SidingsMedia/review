// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.time.LocalDateTime;

/**
 * Representation of a single ZoneMinder event.
 */
public record Event(long id, long monitorId, LocalDateTime start, LocalDateTime end, long frames,
        long size, double runtime, String location, String thumbnail) {
}
