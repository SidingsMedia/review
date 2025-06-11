// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.common.exceptions;

/**
 * The requested entity could not be found.
 */
public class NotFoundException extends RuntimeException {
    private Object requestedObject;
    private String objectTypeName;

    public NotFoundException(String message, Object requestedObject, Class<?> objectType) {
        super(message);
        this.requestedObject = requestedObject;
        objectTypeName = objectType.getSimpleName();
    }

    public Object getRequestedObject() {
        return requestedObject;
    }

    public String getObjectTypeName() {
        return objectTypeName;
    }
}
