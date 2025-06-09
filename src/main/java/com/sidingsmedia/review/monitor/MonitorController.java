// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.monitor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sidingsmedia.review.common.ListResponse;

/**
 * HTTP controller for monitor.
 */
@RestController
@RequestMapping("/monitor")
public class MonitorController {
    @Autowired
    MonitorService service;

    /**
     * Get all monitors configured on this ZoneMinder instance.
     *
     * @return List of monitors.
     */
    @GetMapping("")
    public ListResponse<Monitor> getAll() {
        return new ListResponse<Monitor>(service.getAll());
    }
}
