import {
  createParser,
  type EventSourceParser,
  type ParsedEvent,
  type ReconnectInterval,
} from "eventsource-parser";

interface AIStreamParserOptions {
  event?: string;
}

interface AIStreamParser {
  (
    data: string,
    options: AIStreamParserOptions
  ): string | void | { isText: false; content: string };
}

interface AIStreamCallbacksAndOptions {
  /** `onStart`: Called once when the stream is initialized. */
  onStart?: () => Promise<void> | void;
  /** `onCompletion`: Called for each tokenized message. */
  onCompletion?: (completion: string) => Promise<void> | void;
  /** `onFinal`: Called once when the stream is closed with the final completion message. */
  onFinal?: (completion: string) => Promise<void> | void;
  /** `onToken`: Called for each tokenized message. */
  onToken?: (token: string) => Promise<void> | void;
  /** `onText`: Called for each text chunk. */
  onText?: (text: string) => Promise<void> | void;
  /**
   * A flag for enabling the experimental_StreamData class and the new protocol.
   * @see https://github.com/vercel-labs/ai/pull/425
   *
   * When StreamData is rolled out, this will be removed and the new protocol will be used by default.
   */
  experimental_streamData?: boolean;
}

export function createEmptyReadableStream(): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.close();
    },
  });
}

// customParser?: AIStreamParser
export function createEventStreamTransformer(): TransformStream<
  Uint8Array,
  string | { isText: false; content: string }
> {
  const textDecoder = new TextDecoder();
  let eventSourceParser: EventSourceParser;

  return new TransformStream({
    async start(controller): Promise<void> {
      eventSourceParser = createParser(
        (event: ParsedEvent | ReconnectInterval) => {
          if (
            ("data" in event &&
              event.type === "event" &&
              event.data === "[DONE]") ||
            // Replicate doesn't send [DONE] but does send a 'done' event
            // @see https://replicate.com/docs/streaming
            (event as any).event === "done"
          ) {
            controller.terminate();
            return;
          }

          if ("data" in event) {
            const parsedMessage = event.data;
            if (parsedMessage) controller.enqueue(parsedMessage);
          }
        }
      );
    },

    // transform(chunk) {
    //   eventSourceParser.feed(textDecoder.decode(chunk));
    // },
  });
}

export function createCallbacksTransformer(): TransformStream<
  string | { isText: false; content: string },
  Uint8Array
> {
  const textEncoder = new TextEncoder();
  let aggregatedResponse = "";
  const callbacks: AIStreamCallbacksAndOptions = {};

  return new TransformStream({
    async start(): Promise<void> {
      if (callbacks.onStart) await callbacks.onStart();
    },

    // async transform(message, controller): Promise<void> {
    //   const content = typeof message === "string" ? message : message.content;

    //   controller.enqueue(textEncoder.encode(content));

    //   aggregatedResponse += content;

    //   if (callbacks.onToken) await callbacks.onToken(content);
    //   if (callbacks.onText && typeof message === "string") {
    //     await callbacks.onText(message);
    //   }
    // },

    async flush(): Promise<void> {
      // const isOpenAICallbacks = isOfTypeOpenAIStreamCallbacks(callbacks);
      // If it's OpenAICallbacks, it has an experimental_onFunctionCall which means that the createFunctionCallTransformer
      // will handle calling onComplete.
      if (callbacks.onCompletion) {
        await callbacks.onCompletion(aggregatedResponse);
      }

      if (callbacks.onFinal) {
        await callbacks.onFinal(aggregatedResponse);
      }
    },
  });
}
