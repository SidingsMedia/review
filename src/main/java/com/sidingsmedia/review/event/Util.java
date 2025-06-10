// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;

/**
 * General event related utilities.
 */
class Util {
    /**
     * Get the path to a event video.
     * 
     * @param basePath Base path of event storage.
     * @param monitorId ID of monitor event was created by.
     * @param eventId ID of event.
     * @param eventStartDate Date of day event was started.
     * @return Event video path.
     */
    protected static Path formatEventVideoPath(String basePath, long monitorId, long eventId,
            LocalDate eventStartDate) {

        return Paths.get(basePath, String.valueOf(monitorId), eventStartDate.toString(),
                String.valueOf(eventId), String.valueOf(eventId) + "-video.mp4");
    }
}
