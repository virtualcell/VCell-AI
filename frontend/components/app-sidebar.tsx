"use client"

import { Search, History, Sparkles, FlaskConical, UserPlus, LogIn } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const historyItems = [
  "Calcium Biomodel Comparison",
  "Protein Details on Tutorial Models",
  "Biomodels authored by ModelBrick",
  "Count of Rule-based models",
  "VCML File Analysis of Calcium Models",
]

export function AppSidebar() {
  const pathname = usePathname()

  if ((pathname == "/") || (pathname == "/signin") || (pathname == "/signup")) {
    return null;
  }

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <Image src="/VCellLogo.png" alt="VCell Logo" width={80} height={80} className="rounded" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">AI Platform</h2>
            <p className="text-sm text-slate-600">The Model Explorer</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* AI Tools Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-700 font-medium flex items-center gap-2">
            AI tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="Chatbot">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/chat"}
                  className="data-[active=true]:bg-yellow-50 data-[active=true]:text-yellow-700 data-[active=true]:border-r-2 data-[active=true]:border-yellow-500"
                >
                  <Link href="/chat" className="flex items-center gap-3">
                    <span className="relative flex items-center">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                    </span>
                    <span>Database Explorer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="BiomodelAnalysis">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/analyze"}
                  className="data-[active=true]:bg-yellow-50 data-[active=true]:text-yellow-700 data-[active=true]:border-r-2 data-[active=true]:border-yellow-500"
                >
                  <Link href="/analyze" className="flex items-center gap-3">
                    <span className="relative flex items-center">
                      <FlaskConical className="h-4 w-4 text-yellow-400" />
                    </span>
                    <span>Biomodel Explorer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Database Tools Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-700 font-medium">Database tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="BiomodelSearch">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/search"}
                  className="data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-r-2 data-[active=true]:border-blue-600"
                >
                  <Link href="/search" className="flex items-center gap-3">
                    <Search className="h-4 w-4" />
                    <span>Biomodel Search</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-700 font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent History
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {historyItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                    <span className="truncate">{item}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4">
        <div className="space-y-3">
          {/* Usage Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Daily Usage</span>
              <span>20 remaining</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: '20%' }}
              ></div>
            </div>
            <div className="text-xs text-slate-500 text-center">
              4 of 24 requests used today
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 flex items-center gap-2" asChild>
              <Link href="/signup">
                <UserPlus className="h-3 w-3" />
                Sign Up
              </Link>
            </Button>
            <Button variant="default" size="sm" className="flex-1 flex items-center gap-2" asChild>
              <Link href="/signin">
                <LogIn className="h-3 w-3" />
                Sign In
              </Link>
            </Button>
          </div>
          <div className="text-xs text-slate-500 text-center">
            <p>VCell Model Explorer Platform</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}