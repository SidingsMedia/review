// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.errors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.sidingsmedia.review.common.exceptions.NotFoundException;
import com.sidingsmedia.review.common.exceptions.ValidationException;

/**
 * REST API exception handler.
 */
@ControllerAdvice
public class ErrorController extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ValidationException.class)
    protected ResponseEntity<Object> handleValidationException(ValidationException e) {
        Error error = new Error(HttpStatus.BAD_REQUEST, "Validation of request failed");
        error.addError(new ValidationError(e.getMessage(), e.getField(), e.getRejectedValue()));

        return new ResponseEntity<>(error, error.getStatus());
    }

    @ExceptionHandler(NotFoundException.class)
    protected ResponseEntity<Object> handleNotFound(NotFoundException e) {
        Error error = new Error(HttpStatus.NOT_FOUND, "Requested resource was not found");
        error.addError(new NotFoundError(e.getMessage(), e.getRequestedObject(), e.getObjectTypeName()));

        return new ResponseEntity<>(error, error.getStatus());
    }

}
