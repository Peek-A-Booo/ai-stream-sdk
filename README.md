# AI Stream SDK

**AI Stream SDK** is a plugin that can quickly implement AI API data streams. It supports various model API forwarding, allowing you to quickly build your API forwarding service.

## Features

- Data flow transmission
- Provide real-time monitoring of data stream in each stage
- _Future support for calculating token thresholds for model responses_

## Installation

```sh
pnpm add ai-stream-sdk
```

View the full documentation and examples on [ai-stream-sdk.vercel.app](https://ai-stream-sdk.vercel.app/).

## Usage

```ts
import { OpenAIStream } from 'ai-stream-sdk'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: 'sk-*****',
})

export const runtime = 'edge'

export async function POST(request: Request) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Say this is a test' }],
    stream: true,
  })

  const stream = OpenAIStream(response, {
    onStart: () => {
      console.log('onStart')
    },
    onCompletion: (completion) => {
      console.log(completion, 'completion')
    },
  })

  return new Response(stream)
}
```
