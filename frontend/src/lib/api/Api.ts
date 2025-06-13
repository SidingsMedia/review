// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

import { ApiError } from "./ApiError";
import type { Error } from "./responses";

export type DecodeAs = "json" | "text" | "blob";

export class Api {
  private baseUrl: string =
    (import.meta.env.VITE_API_URL as string | undefined) ??
    "http://localhost:8080/api/v1/";

  /**
   * Make a GET request to the API
   * @param path Endpoint path to call
   * @param options Standard fetch() options
   * @returns API response
   */
  public async get<T>(path: string, options?: RequestInit): Promise<T> {
    const completeOptions = options ?? {};
    return this.request(path, "get", completeOptions);
  }

  /**
   * Make a POST request to the API
   * @param path Endpoint path to call
   * @param options Standard fetch() options
   * @returns API response
   */
  public async post<T>(path: string, options: RequestInit): Promise<T> {
    return this.request(path, "post", options);
  }

  /**
   * Make a PUT request to the API
   * @param path Endpoint path to call
   * @param options Standard fetch() options
   * @returns API response
   */
  public async put<T>(path: string, options: RequestInit): Promise<T> {
    return this.request(path, "put", options);
  }

  /**
   * Make a PATCH request to the API
   * @param path Endpoint path to call
   * @param options Standard fetch() options
   * @returns API response
   */
  public async patch<T>(path: string, options: RequestInit): Promise<T> {
    return this.request(path, "patch", options);
  }

  /**
   * Make a DELETE request to the API
   * @param path Endpoint path to call
   * @param options Standard fetch() options
   * @returns API response
   */
  public async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const completeOptions = options ?? {};
    return this.request(path, "delete", completeOptions);
  }

  /**
   * Make request to API. Generally one of the other methods (e.g.
   * get(), post() and so on) should be used rather than this one. Only
   * use this one if you need more flexibility (e.g. return a blob).
   *
   * @param path Endpoint path
   * @param method HTTP method
   * @param options Standard fetch() options
   * @param baseUrl Optional alternate base url to use
   * @param [decodeAs="json"] How should the response be decoded? Defaults
   * to `json`.
   * @param [contentType="application/json"] Content type to use.
   * `Defaults to application/json`
   * @returns API response
   */
  public async request<T>(
    path: string,
    method: "get" | "post" | "put" | "patch" | "delete",
    options: RequestInit,
    baseUrl?: string,
    decodeAs: DecodeAs = "json",
    contentType = "application/json",
  ): Promise<T> {
    const opts = {
      ...options,
      method,
    };

    opts.headers = {
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...opts.headers,
      "Content-type": contentType,
      ...this.headers(),
    };

    let url: URL;
    if (baseUrl === undefined) {
      // Handle when base URL is set to relative path
      if (!this.baseUrl.startsWith("http")) {
        this.baseUrl = new URL(this.baseUrl, window.location.origin).toString();
      }
      url = new URL(path, this.baseUrl);
    } else {
      url = new URL(path, baseUrl);
    }

    console.log(`Sending request: ${method.toUpperCase()} ${url.toString()}`);
    const response = await fetch(url.toString(), opts);
    if (!response.ok) {
      const data: Error = (await response.json()) as Error;
      throw new ApiError(data.message, data);
    }

    switch (decodeAs) {
      case "json":
        return response.json() as Promise<T>;
      case "text":
        return response.text() as Promise<T>;
      case "blob":
        return response.blob() as T;
    }
  }

  /**
   * Get the required headers for requests
   * @returns No headers needed
   */
  private headers(): Record<string, string> {
    return {};
  }

  /**
   * Create a URL using the configured base URL.
   *
   * @param path Path to append to base URL
   * @returns Correctly formatted URL
   */
  public constructUrl(path: string): URL {
    // Handle when base URL is set to relative path
    if (!this.baseUrl.startsWith("http")) {
      this.baseUrl = new URL(this.baseUrl, window.location.origin).toString();
    }
    return new URL(path, this.baseUrl);
  }
}
