"use client";

import {
  ArrowRight,
  LogIn,
  UserPlus,
  Search,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: Search,
    title: "Discover faster",
    text: "Find relevant models and resources through a clearer exploration flow.",
  },
  {
    icon: MessageSquare,
    title: "Understand better",
    text: "Use AI-assisted interaction to make complex biological content easier to follow.",
  },
  {
    icon: ShieldCheck,
    title: "Work securely",
    text: "Support private model access with a smoother and more polished experience.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a1020] text-white">
      <div className="relative overflow-hidden">
        {/* premium background */}
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.28),transparent_25%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.26),transparent_28%),linear-gradient(180deg,#0a1020_0%,#0f172a_55%,#111827_100%)]" />
        <div className="absolute left-[-8rem] top-[-6rem] -z-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 -z-10 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        {/* header */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex items-center gap-3"
            >
              <Image
                src="/VCellLogo.png"
                alt="VCell Logo"
                width={120}
                height={120}
                className="h-auto w-auto"
              />
              <div className="hidden sm:block">
                <p className="text-lg font-semibold tracking-tight text-white">
                  AI Explorer
                </p>
                <p className="text-sm text-slate-300">
                  VCell model discovery workspace
                </p>
              </div>
            </motion.div>

            <motion.div
              custom={0.08}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex items-center gap-3"
            >
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/signin" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>

              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition-all duration-300 hover:scale-[1.03] hover:from-cyan-300 hover:via-blue-400 hover:to-indigo-400"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </motion.div>
          </div>
        </header>

        {/* hero */}
        <main className="mx-auto max-w-7xl px-6 pb-20 pt-16 lg:pt-24">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            <motion.div
              custom={0.12}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-white/5 px-4 py-2 text-sm font-medium text-cyan-300 backdrop-blur">
                AI-assisted biological model exploration
              </div>

              <h1 className="mt-8 text-5xl font-bold leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Explore VCell Models
                <span className="mt-3 block bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  through a premium AI experience
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300 lg:mx-0">
                Discover, understand, and navigate biological models with a
                cleaner visual flow built to feel faster, calmer, and more
                professional.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                <Button
                  size="lg"
                  asChild
                  className="h-13 rounded-2xl bg-white px-8 text-base font-semibold text-slate-950 shadow-[0_14px_40px_rgba(255,255,255,0.18)] transition-all duration-300 hover:scale-[1.04] hover:bg-slate-100"
                >
                  <Link href="/chat" className="flex items-center gap-2">
                    Start Exploring
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-13 rounded-2xl border-white/20 bg-white/5 px-8 text-base text-white backdrop-blur transition-all duration-300 hover:scale-[1.04] hover:bg-white/10 hover:text-white"
                >
                  <Link href="/signup">Create an Account</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              custom={0.22}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="relative mx-auto w-full max-w-xl"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-[2rem] border border-white/10 bg-white/8 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl"
              >
                <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/95 p-6 shadow-inner">
                    <Image
                      src="/VCellLogo.png"
                      alt="VCell Logo"
                      width={420}
                      height={220}
                      priority
                      className="mx-auto h-auto w-full max-w-sm"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-left backdrop-blur">
                      <p className="text-sm font-semibold text-white">
                        Cleaner discovery
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        A calmer, more intuitive model exploration flow.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-left backdrop-blur">
                      <p className="text-sm font-semibold text-white">
                        Better onboarding
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        More polished first impressions for new contributors.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* features */}
          <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  custom={0.2 + index * 0.08}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  className="rounded-[1.8rem] border border-white/10 bg-white/6 p-7 shadow-[0_10px_30px_rgba(15,23,42,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/10"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-indigo-400/20">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {feature.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>

      <footer className="border-t border-white/10 bg-[#0a1020]">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-400">
          VCell AI Model Explorer
        </div>
      </footer>
    </div>
  );
}
