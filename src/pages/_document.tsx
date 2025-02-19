import Document, { Html, Head, Main, NextScript } from "next/document"

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* 加载 favicon */}
          <link rel="icon" href="/favicon.ico" />
          {/* 加载 Google Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
            rel="stylesheet"
          />
          {/* 如果有其他图标资源，也可以在这里加入 meta 标签 */}
          <meta name="theme-color" content="#FFF4D2" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument 