import { createParser } from 'eventsource-parser'
import type {
  EventSourceParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser'

import { getStreamEnd } from '../lib'
import { StreamCallbacksOptions } from '../type'

function getContent(message: string) {
  try {
    return (
      JSON.parse(message).content_block?.text ||
      JSON.parse(message).delta?.text ||
      ''
    )
  } catch {
    return ''
  }
}

export function createEventStreamTransformer(
  isAsyncIterable: boolean,
): TransformStream<Uint8Array, string> {
  const prefix = isAsyncIterable ? 'data: ' : ''
  const splitLine = isAsyncIterable ? '\n' : ''

  const textDecoder = new TextDecoder()
  let eventSourceParser: EventSourceParser
  let hasStreamEnd = false

  return new TransformStream({
    async start(controller) {
      eventSourceParser = createParser(
        (event: ParsedEvent | ReconnectInterval) => {
          // All pending tasks are uniformly processed as "[DONE]" and only returned once.
          try {
            const isStreamEnd = getStreamEnd(event)

            // Discard incomplete event data
            if (!isStreamEnd && 'data' in event) JSON.parse(event.data)

            if (isStreamEnd) {
              // pipeThrough the usage data before [DONE]
              if (JSON.parse((event as any).data).usage) {
                controller.enqueue((event as any).data)
              }
              if (!hasStreamEnd) controller.enqueue('[DONE]')

              hasStreamEnd = true
              controller.terminate()
              return
            }

            if ('data' in event) {
              const parsedMessage = event.data
              if (parsedMessage) controller.enqueue(parsedMessage)
            }
          } catch {}
        },
      )
    },
    transform(chunk) {
      const value = `${prefix}${textDecoder.decode(chunk)}${splitLine}`
      eventSourceParser.feed(value)
    },
  })
}

export function createCallbacksTransformer(
  callbacks?: StreamCallbacksOptions,
): TransformStream<string, Uint8Array> {
  const textEncoder = new TextEncoder()

  let streamContent = ''
  let input_tokens = 0
  let output_tokens = 0

  return new TransformStream({
    async start(): Promise<void> {
      if (callbacks?.onStart) await callbacks.onStart()
    },

    async transform(message, controller): Promise<void> {
      try {
        const usage =
          JSON.parse(message).usage || JSON.parse(message).message.usage
        input_tokens += usage?.input_tokens || 0
        output_tokens += usage?.output_tokens || 0
      } catch {}
      controller.enqueue(textEncoder.encode(`data: ${message}\n\n`))

      const content = getContent(message)
      streamContent += content
    },

    async flush(): Promise<void> {
      if (callbacks?.onUsage) {
        await callbacks.onUsage({ input_tokens, output_tokens })
      }

      if (callbacks?.onCompletion) {
        await callbacks.onCompletion(streamContent)
      }
    },
  })
}
