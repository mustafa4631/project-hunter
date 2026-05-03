import Link from 'next/link'
import { Button } from '@/features/ui/components/Button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-earth-dark text-parchment">
      <main className="flex flex-col items-center gap-8 max-w-2xl text-center">
        <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tight text-parchment">
          Project Hunt
        </h1>
        <p className="text-xl md:text-2xl text-parchment-dark">
          Av Sahasına Hoş Geldin
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/game">
            <Button size="lg" className="w-full sm:w-auto">
              Solo Oyun
            </Button>
          </Link>
          <Link href="/game">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Çok Oyunculu
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
