import { Search, FileText, Code, BarChart3Icon as Diagram3, MessageSquare, History, Database } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

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
    url: "/",
    icon: Search,
  },
  {
    title: "VCML Files",
    url: "/vcml",
    icon: FileText,
  },
  {
    title: "SBML Files",
    url: "/sbml",
    icon: Code,
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
  "Cardiac cell model analysis",
  "Protein interaction network",
  "Gene regulatory circuit",
  "Metabolic pathway study",
  "Signal transduction model",
]

export function AppSidebar() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <Sidebar className="border-r border-slate-200 overflow-x-hidden">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">VCell Tools</h2>
            <p className="text-sm text-slate-600">Scientific Analysis Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-700 font-medium">Analysis Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-r-2 data-[active=true]:border-blue-600"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
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
        <div className="text-xs text-slate-500">
          <p>VCell Scientific Platform</p>
          <p>Version 2.0.1</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
