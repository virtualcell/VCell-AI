"use client"

import { Search, FileText, Code, BarChart3Icon as Diagram3, MessageSquare, History, Database, Sparkles, FlaskConical, UserPlus, LogIn } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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

const navigationItems = [
  {
    title: "Biomodel Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "SBML & BNGL Files",
    url: "/sbml",
    icon: Code,
  },
  {
    title: "VCML Files",
    url: "/vcml",
    icon: FileText,
  },
  {
    title: "Diagrams",
    url: "/diagrams",
    icon: Diagram3,
  },
  {
    title: "AI Chat",
    url: "/chat",
    icon: MessageSquare,
  },
]

const historyItems = [
  "Calcium Biomodel Comparison",
  "Protein Details on Tutorial Models",
  "Biomodels authored by ModelBrick",
  "Count of Rule-based models",
  "VCML File Analysis of Calcium Models",
]

export function AppSidebar() {
  const pathname = usePathname()

  if (pathname == "/") {
    return null;
  }

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">VCell Platform</h2>
            <p className="text-sm text-slate-600">Model Explorer Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* AI Explorer Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-700 font-medium flex items-center gap-2">
            AI Explorer
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
                    <span>Biomodel Analysis</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Analysis Tools Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-700 font-medium">API Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.filter(item => item.url !== "/chat").map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-r-2 data-[active=true]:border-blue-600"
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 flex items-center gap-2">
              <UserPlus className="h-3 w-3" />
              Sign Up
            </Button>
            <Button variant="default" size="sm" className="flex-1 flex items-center gap-2">
              <LogIn className="h-3 w-3" />
              Sign In
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