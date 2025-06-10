// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.util.Date;

public record Event(
        long id,
        long monitorId,
        Date start,
        Date end,
        long frames,
        long size) {
}
