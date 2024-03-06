import React from 'react'
import { useRouter } from 'next/router'
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span className="text-lg font-bold">AI Stream SDK</span>,
  project: {
    link: 'https://github.com/Peek-A-Booo/ai-stream-sdk',
  },
  useNextSeoProps() {
    return { titleTemplate: '%s – AI Stream SDK' }
  },
  head: function useHead() {
    const { title } = useConfig()

    return (
      <>
        <meta name="og:title" content={title ? title + ' – LX-UI' : 'LX-UI'} />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
        {/* {!!process.env.UMAMI_WEBSITE_ID && (
          <script
            async
            src="https://umami.ltopx.com/script.js"
            data-website-id={process.env.UMAMI_WEBSITE_ID}
          ></script>
        )} */}
      </>
    )
  },
  editLink: { text: null },
  feedback: { content: null },
  footer: {
    text: (
      <p className="text-xs">© {new Date().getFullYear()} AI Stream SDK</p>
    ),
  },
  search: {
    placeholder: () => {
      const router = useRouter()
      if (router.locale === 'zh-CN') return '搜索文档...'
      return 'Search documentation…'
    },
  },
  i18n: [
    { locale: 'en', text: 'English' },
    { locale: 'zh-CN', text: '中文' },
  ],
}

export default config
