declare function createEmptyReadableStream(): ReadableStream;
declare function createEventStreamTransformer(): TransformStream<Uint8Array, string | {
    isText: false;
    content: string;
}>;
declare function createCallbacksTransformer(): TransformStream<string | {
    isText: false;
    content: string;
}, Uint8Array>;

export { createCallbacksTransformer, createEmptyReadableStream, createEventStreamTransformer };
