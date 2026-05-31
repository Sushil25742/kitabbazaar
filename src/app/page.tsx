"use client";

import Link from "next/link";
import { BookOpen, Search, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-1 relative">
        <section className="w-full py-20 md:py-32 lg:py-48 overflow-hidden relative">
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center space-y-8 text-center"
            >
              <div className="space-y-4">
                <motion.h1 variants={itemVariants} className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Buy & Sell Books in <br className="md:hidden" />
                  <span className="text-gradient-emerald">Nepal</span>
                </motion.h1>
                <motion.p variants={itemVariants} className="mx-auto max-w-[700px] text-zinc-500 md:text-xl dark:text-zinc-400 mt-4 leading-relaxed">
                  The #1 student thrift marketplace. Buy used textbooks for cheap, sell yours to recover costs. Fair, fast, and secure.
                </motion.p>
              </div>
              <motion.div variants={itemVariants} className="space-x-4 flex justify-center pt-4">
                <Link href="/books" className="group relative inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-8 text-sm font-medium text-white transition-all hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] focus-visible:outline-none overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
                  <Search className="mr-2 h-4 w-4 relative z-10" />
                  <span className="relative z-10">Find Books</span>
                </Link>
                <Link href="/sell" className="group inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-medium transition-all hover:bg-zinc-50 hover:scale-105 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-white">
                  <ShoppingBag className="mr-2 h-4 w-4 text-emerald-600 group-hover:text-emerald-500 transition-colors" />
                  Start Selling
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t border-white/10 glass-panel">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors cursor-default">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 text-white">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Student-to-Student</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  Cut out the middleman. Buy directly from senior students and save up to 70% on textbook costs.
                </p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors cursor-default">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/30 text-white">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">10% Fair Commission</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  We only take a 10% fee when you successfully sell your book. No hidden charges or listing fees.
                </p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center space-y-4 text-center sm:col-span-2 lg:col-span-1 p-6 rounded-2xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors cursor-default">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/30 text-white">
                  <ArrowRight className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Flexible Payments</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  Pay securely with eSewa, Khalti, or choose Cash on Delivery when you meet the seller on campus.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
