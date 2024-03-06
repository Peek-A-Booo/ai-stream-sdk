import { GPTTokens } from 'gpt-tokens'
import OpenAI from 'openai'
import type { NextApiRequest } from 'next'

import { OpenAIStream } from '@core/index'

export const runtime = 'edge'

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAI({
  apiKey: process.env.NEXT_API_KEY, // This is the default and can be omitted
  baseURL: 'https://api.nextapi.fun/v1/',
})

export default async function handler(req: NextApiRequest) {
  if (req.method === 'POST') {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say this is a test' }],
      stream: true,
    })
    // const response = await fetch(
    //   'https://api.nextapi.fun/v1/chat/completions',
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${process.env.NEXT_API_KEY}`,
    //     },
    //     method: 'POST',
    //     body: JSON.stringify({
    //       stream: true,
    //       model: 'gpt-3.5-turbo',
    //       messages: [{ role: 'user', content: 'Say this is a test' }],
    //     }),
    //   },
    // )
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    //   },
    //   method: 'POST',
    //   body: JSON.stringify({
    //     stream: true,
    //     model: 'gpt-3.5-turbo',
    //     messages: [{ role: 'user', content: 'Say this is a test' }],
    //   }),
    // })

    const stream = OpenAIStream(response, {
      onStart: () => {
        console.log('onStart')
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
}
