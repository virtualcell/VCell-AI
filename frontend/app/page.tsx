"use client"

import { ArrowRight, MessageSquare, Wrench, Database, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12"> 
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 mb-6 leading-tight"> 
            VCell Models
            <br />
            <span className="text-blue-600">AI Explorer</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"> 
            Discover, analyze, and explore biomodels with the power of AI. Comprehensive platform for scientific
            model research.
          </p>

          <Link href="/chat">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Exploring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"> 
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
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"> 
                <Wrench className="h-8 w-8 text-green-600" />
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
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700">Biomodel Database Search</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700">VCML and SBML File Retrieval</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700">Biomodels Diagrams</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Private Access Feature */}
          <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="text-center pb-2"> 
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2"> 
                <Shield className="h-8 w-8 text-purple-600" />
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
        {/* Footer */}
        <div className="text-center pt-1 border-t border-slate-200 text-sm">
          <p className="text-slate-500">VCell AI Model Explorer</p>
        </div>
      </div>
    </div>
  )
}
