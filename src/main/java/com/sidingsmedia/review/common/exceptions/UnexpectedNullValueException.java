// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.common.exceptions;

/**
 * A null value was encountered where is wasn't expected.
 */
public class UnexpectedNullValueException extends RuntimeException {
    private String field;

    public UnexpectedNullValueException(String message, String field) {
        super(message);
        this.field = field;
    }


    public String getField() {
        return field;
    }
}
