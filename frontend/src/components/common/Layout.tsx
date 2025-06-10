import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/common/AppSidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 w-full overflow-auto bg-gray-200 z-10">{children}</main>
      </div>
    </SidebarProvider>
  )
}