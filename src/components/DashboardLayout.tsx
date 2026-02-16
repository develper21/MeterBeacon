import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, role, signOut } = useAuth();

  const roleBadge: Record<string, string> = {
    admin: "Admin",
    manager: "Manager",
    field_engineer: "Field Engineer",
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <AppSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="glass-sidebar flex items-center justify-between px-4 py-3 border-b border-border/30 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden glass-card-hover p-2 rounded-lg"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <NotificationBell />

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 glass-card-hover px-3 py-1.5 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                      {profile?.full_name || user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{roleBadge[role || "field_engineer"]}</p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 glass-card border-border/50" align="end">
                <div className="px-2 py-1.5 border-b border-border/30 mb-1">
                  <p className="text-xs font-medium text-foreground">{profile?.full_name || "User"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                  <span className="badge-glass text-[9px] mt-1 text-primary">{roleBadge[role || "field_engineer"]}</span>
                </div>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
