import '../styles/globals.css'
import Providers from '@/providers/Providers'
import Link from 'next/link'
import { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <header style={{ padding: '10px', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <nav>
          {/* Navigation link to the Check Price page */}
          <Link href="/check-price">
              <button style={{ padding: '10px 20px', fontSize: '16px' }}>Check Price</button>
          </Link>
        </nav>
      </header>
      <Component {...pageProps} />
    </Providers>
  )
}

export default MyApp 