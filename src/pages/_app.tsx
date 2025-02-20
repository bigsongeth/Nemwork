import '../styles/globals.css'
// import Providers from '@/providers/Providers'
import Link from 'next/link'
import { AppProps } from 'next/app'
import { WalletProvider } from '@/contexts/WalletContext'
import "src/components/Stepper.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // <Providers>

    // </Providers>
    <Component {...pageProps} />
  )
}

export default MyApp 