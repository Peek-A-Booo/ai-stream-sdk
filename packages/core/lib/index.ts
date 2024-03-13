import type { ParsedEvent, ReconnectInterval } from 'eventsource-parser'

export function createEmptyReadableStream(): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.close()
    },
  })
}

function getFinishReason(event: ParsedEvent | ReconnectInterval) {
  try {
    return (
      // OpenAI
      JSON.parse((event as ParsedEvent).data)?.choices?.[0]?.finish_reason ||
      // Claude
      JSON.parse((event as ParsedEvent).data)?.delta?.stop_reason
    )
  } catch {
    return null
  }
}

// Has the response been completed?
export function getStreamEnd(event: ParsedEvent | ReconnectInterval) {
  try {
    return (
      ('data' in event &&
        event.type === 'event' &&
        (event.data === '[DONE]' ||
          // Claude
          event.data === JSON.stringify({ type: 'message_stop' }))) ||
      // Replicate doesn't send [DONE] but does send a 'done' event
      // @see https://replicate.com/docs/streaming
      (event as any).event === 'done' ||
      (event as any).event === 'message_stop' ||
      getFinishReason(event) === 'stop' ||
      // Claude
      getFinishReason(event) === 'end_turn'
    )
  } catch {
    return false
  }
}
