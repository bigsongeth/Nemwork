import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
const WalletConnect = dynamic(() => import('@/components/Wallet/WalletConnect'), { ssr: false })
import PetSelection from '@/components/Pet/PetSelection'

export default function Home() {
  return (
    <div className="min-h-screen bg-egg-yellow">
      <Head>
        <title>Nemo Advisor - Your Personal Pet Advisor</title>
        <meta name="description" content="Choose your personal pet to be your advisor and friend" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </Head>

      <header className="w-full py-6 bg-deep-purple shadow-lg">
        <h1 className="text-5xl font-bold text-egg-yellow text-center title-font">
          Nemwork
        </h1>
      </header>

      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-deep-purple text-center mb-16 pixel-font leading-relaxed">
          <span className="block">Choose your personal pet</span>
          <span className="block">to be your advisor and friend</span>
        </h2>

        <div className="w-full max-w-6xl">
          <WalletConnect />
          <PetSelection />
        </div>

        <Link href="/check-price">
          <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-800">
            Check Price
          </button>
        </Link>
      </main>
    </div>
  )
} 