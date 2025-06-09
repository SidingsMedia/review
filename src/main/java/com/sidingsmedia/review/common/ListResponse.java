// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.common;

import java.util.List;

/**
 * Generic list response to avoid an array at the root of a JSON
 * response.
 */
public record ListResponse<T>(List<T> results) {

}
