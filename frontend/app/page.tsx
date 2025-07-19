"use client"

import { ArrowRight, MessageSquare, Wrench, Shield, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VCell</span>
              </div>
              <span className="text-xl font-semibold text-slate-900">Models AI Explorer</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/signin" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col items-center justify-center">
          {/* Hero Section */}
          <div className="text-center mb-16"> 
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight"> 
              VCell Models
              <br />
              <span className="text-blue-600">AI Explorer</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"> 
              Discover, analyze, and explore biomodels with the power of AI. Comprehensive platform for scientific
              model research.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Start Exploring
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200"
                >
                  Join Now!
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full"> 
            {/* AI Chatbot Feature */}
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="text-center pb-2"> 
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"> 
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900">AI-Powered Chatbot</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 leading-relaxed">
                  Ask questions in natural language and get intelligent responses. The Chatbot can retrieve,
                  and analyze biomodels using LLMs with Tool Calling.
                </p>
              </CardContent>
            </Card>

            {/* All-in-One Tools Feature */}
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <CardHeader className="text-center pb-2"> 
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"> 
                  <Wrench className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-900">Everything in One Place</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2"> 
                  <p className="text-slate-600 leading-relaxed mb-2"> 
                    All essential tools in one platform
                  </p>
                  <div className="space-y-1 text-sm"> 
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-700">Biomodel Database Search</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-700">VCML and SBML File Retrieval</span>
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
                <CardTitle className="text-xl font-semibold text-slate-900">Private Model Access</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 leading-relaxed">
                  Access private and restricted biomodels with secure Auth0 authentication.
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
  )
}
