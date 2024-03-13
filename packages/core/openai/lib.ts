import { createParser } from 'eventsource-parser'
import type {
  EventSourceParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser'

import { StreamCallbacksOptions } from './type'

function getFinishReason(event: ParsedEvent | ReconnectInterval) {
  try {
    return JSON.parse((event as ParsedEvent).data).choices[0].finish_reason
  } catch {
    return null
  }
}

function getContent(message: string) {
  try {
    return JSON.parse(message).choices[0].delta.content
  } catch {
    return ''
  }
}

// Has the response been completed?
function getStreamEnd(event: ParsedEvent | ReconnectInterval) {
  return (
    ('data' in event && event.type === 'event' && event.data === '[DONE]') ||
    // Replicate doesn't send [DONE] but does send a 'done' event
    // @see https://replicate.com/docs/streaming
    (event as any).event === 'done' ||
    getFinishReason(event) === 'stop'
  )
}

export function createEmptyReadableStream(): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.close()
    },
  })
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

  return new TransformStream({
    async start(): Promise<void> {
      if (callbacks?.onStart) await callbacks.onStart()
    },

    async transform(message, controller): Promise<void> {
      controller.enqueue(textEncoder.encode(`data: ${message}\n\n`))

      const content = getContent(message)
      streamContent += content
    },

    async flush(): Promise<void> {
      if (callbacks?.onCompletion) {
        await callbacks.onCompletion(streamContent)
      }
    },
  })
}
