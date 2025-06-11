// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.monitor;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Repository for monitor.
 */
@Repository
public class MonitorRepository {
    @Autowired
    JdbcTemplate jdbcTemplate;

    /**
     * Get all monitors in the database.
     *
     * @return List of monitors.
     */
    protected List<Monitor> getAll() {
        return jdbcTemplate.query("SELECT Id, Name FROM Monitors;", (rs, rowNum) -> new Monitor(
                rs.getLong("Id"),
                rs.getString("Name")));
    }
}
