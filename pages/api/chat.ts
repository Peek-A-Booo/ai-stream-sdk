import { GPTTokens } from 'gpt-tokens'
import OpenAI from 'openai'

import { OpenAIStream } from '@core/index'

export const runtime = 'edge'

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
// const openai = new OpenAI({
//   // apiKey: process.env.NEXT_API_KEY, // This is the default and can be omitted
//   baseURL: 'https://api.nextapi.fun/v1/',
// })

export default async function handler(req: Request) {
  try {
    if (req.method === 'POST') {
      const { messages, model } = await req.json()

      const Authorization = req.headers.get('Authorization')
      const apiKey = Authorization?.replace('Bearer ', '')

      // openai.apiKey = apiKey

      // const response = await openai.chat.completions.create({
      //   model,
      //   messages,
      //   stream: true,
      // })

      // const response = await fetch(
      //   'https://api.nextapi.fun/v1/chat/completions',
      //   {
      //     headers: {
      //       'Content-Type': 'application/json',
      //       Authorization: `Bearer ${apiKey || process.env.NEXT_API_KEY}`,
      //     },
      //     method: 'POST',
      //     body: JSON.stringify({
      //       stream: true,
      //       model,
      //       messages,
      //     }),
      //   },
      // )

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          method: 'POST',
          body: JSON.stringify({
            stream: true,
            model,
            messages,
          }),
        },
      )

      const stream = OpenAIStream(response, {
        onStart: () => {
          console.log(messages, 'onStart')
        },
        onCompletion: (completion) => {
          console.log(completion, 'completion')

          const usageInfo = new GPTTokens({
            model: 'gpt-3.5-turbo-1106',
            messages: [
              {
                role: 'system',
                content:
                  'You are a helpful, pattern-following assistant that translates corporate jargon into plain English.',
              },
              {
                role: 'user',
                content:
                  "This late pivot means we don't have time to boil the ocean for the client deliverable.",
              },
            ],
          })

          console.info('Used tokens: ', usageInfo.usedTokens)
          console.info('Used USD: ', usageInfo.usedUSD)
        },
      })

      return new Response(stream, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*',
        },
      })
    } else {
      // Handle any other HTTP method
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*',
        },
      })
    }
  } catch (error) {
    console.log(error)
  }
}
