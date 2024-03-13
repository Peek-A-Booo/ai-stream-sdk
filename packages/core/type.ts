export interface StreamCallbacksOptions {
  /**
   * Called at the beginning of a streaming response
   */
  onStart?: () => Promise<void> | void
  /**
   * After the streamed response ends, call back and return the text content of the current response.
   */
  onCompletion?: (completion: string) => Promise<void> | void
}
