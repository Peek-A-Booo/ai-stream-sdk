import {
  createEmptyReadableStream,
  createEventStreamTransformer,
  createCallbacksTransformer,
} from "./lib";

export default function OpenAIStream(response: Response) {
  const responseBodyReadableStream =
    response.body || createEmptyReadableStream();

  const stream = responseBodyReadableStream
    .pipeThrough(createEventStreamTransformer())
    .pipeThrough(createCallbacksTransformer())
    .pipeThrough(
      new TransformStream({
        transform: async (chunk, controller) => {
          controller.enqueue(chunk);
        },
      })
    );

  return stream;
}
