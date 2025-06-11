// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.monitor;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Business logic for monitors.
 */
@Service
public class MonitorService {
    @Autowired
    MonitorRepository repository;

    /**
     * Get all monitors.
     *
     * @return List of all monitors.
     */
    protected List<Monitor> getAll() {
        return repository.getAll();
    }
}
