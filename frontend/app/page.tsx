"use client";

import {
  ArrowRight,
  MessageSquare,
  Wrench,
  Shield,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              <Image
                src="/VCellLogo.png"
                alt="VCell Logo"
                width={64}
                height={64}
                className="rounded-lg h-10 w-auto sm:h-14 sm:w-auto object-contain"
              />
              <span className="text-sm sm:text-lg md:text-xl font-semibold text-slate-900">
                AI Explorer
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <Button variant="outline" size="sm" asChild className="px-2 sm:px-3">
                <Link href="/signin" className="flex items-center gap-1 sm:gap-2">
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Sign In</span>
                </Link>
              </Button>
              <Button size="sm" asChild className="px-2 sm:px-3">
                <Link href="/signup" className="flex items-center gap-1 sm:gap-2">
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Sign Up</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col items-center justify-center">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-6">
              <Image
                src="/VCellLogo.png"
                alt="VCell Logo"
                width={318}
                height={120}
                className="rounded-lg w-48 h-18 sm:w-56 sm:h-20 md:w-64 md:h-24 lg:w-80 lg:h-30"
              />
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight">
                VCell Models
                <br />
                <span className="text-blue-600">AI Explorer</span>
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Discover, analyze, and explore biomodels with the power of AI.
              Comprehensive platform for scientific model research.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full px-4 sm:px-0">
              <Link href="/chat" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Start Exploring
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-all duration-200"
                >
                  Join Now!
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 w-full px-4 sm:px-0">
            {/* AI Chatbot Feature */}
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  AI-Powered Chatbot
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 leading-relaxed">
                  Ask questions in natural language and get intelligent
                  responses. The Chatbot can retrieve, and analyze biomodels
                  using LLMs with Tool Calling.
                </p>
              </CardContent>
            </Card>

            {/* All-in-One Tools Feature */}
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Wrench className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Everything in One Place
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2">
                  <p className="text-slate-600 leading-relaxed mb-2">
                    All essential tools in one platform
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-700">
                        Biomodel Database Search
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-700">
                        VCML and SBML File Retrieval
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-700">Biomodels Diagrams</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Private Access Feature */}
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Private Model Access
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 leading-relaxed">
                  Access private and restricted biomodels with secure Auth0
                  authentication.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center border-t border-slate-200 text-sm">
        <p className="text-slate-500 my-4">VCell AI Model Explorer</p>
      </footer>
    </div>
  );
}
