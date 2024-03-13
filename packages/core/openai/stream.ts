import {
  createCallbacksTransformer,
  createEmptyReadableStream,
  createEventStreamTransformer,
} from './lib'
import { StreamCallbacksOptions, StreamChatCompletionResponse } from './type'

export default function OpenAIStream(
  response: Response | StreamChatCompletionResponse,
  callbacks?: StreamCallbacksOptions,
) {
  const isAsyncIterable = Symbol.asyncIterator in response

  const responseBodyReadableStream: ReadableStream =
    (isAsyncIterable ? response.toReadableStream() : response.body) ||
    createEmptyReadableStream()

  const stream = responseBodyReadableStream
    .pipeThrough(createEventStreamTransformer(isAsyncIterable))
    .pipeThrough(createCallbacksTransformer(callbacks))

  return stream
}
