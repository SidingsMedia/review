// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.errors;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;

public class Error {
    private HttpStatus status;
    private int code;
    private LocalDateTime timestamp;
    private String message;
    private List<SubError> errors;

    private Error() {
        timestamp = LocalDateTime.now();
    }

    public Error(HttpStatus status) {
        this();
        this.status = status;
        this.code = status.value();
    }

    public Error(HttpStatus status, String message) {
        this(status);
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public List<SubError> getErrors() {
        return errors;
    }

    public void addError(SubError err) {
        if (errors == null) {
            errors = new ArrayList<>();
        }
        errors.add(err);
    }

    public int getCode() {
        return code;
    }
}

interface SubError {

}

record ValidationError(
    String message,
    String field,
    Object rejectedValue

) implements SubError {}
