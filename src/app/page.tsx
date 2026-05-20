import Link from "next/link";
import { BookOpen, Search, ShoppingBag, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-zinc-50 dark:bg-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Buy & Sell Books in <span className="text-emerald-600 dark:text-emerald-500">Nepal</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-zinc-500 md:text-xl dark:text-zinc-400">
                  The #1 student thrift marketplace. Buy used textbooks for cheap, sell yours to recover costs. Fair, fast, and secure.
                </p>
              </div>
              <div className="space-x-4 flex justify-center">
                <Link href="/books" className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                  <Search className="mr-2 h-4 w-4" />
                  Find Books
                </Link>
                <Link href="/sell" className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:text-white">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Start Selling
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                  <BookOpen className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold">Student-to-Student</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Cut out the middleman. Buy directly from senior students and save up to 70% on textbook costs.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                  <ShoppingBag className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold">10% Fair Commission</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  We only take a 10% fee when you successfully sell your book. No hidden charges or listing fees.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center sm:col-span-2 lg:col-span-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                  <ArrowRight className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold">Flexible Payments</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Pay securely with eSewa, Khalti, or choose Cash on Delivery when you meet the seller on campus.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
