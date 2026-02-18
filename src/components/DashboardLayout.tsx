import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, LogOut, User, ChevronDown, Search } from "lucide-react";
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
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
        <header className="flex items-center justify-between px-4 py-3 lg:px-6 border-b border-border/50 bg-background/60 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden glass-card p-2 rounded-xl"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search trackers, devices..."
                className="glass-input w-full pl-9 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-xl hover:shadow-md transition-all">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                      {profile?.full_name || user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{roleBadge[role || "field_engineer"]}</p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-2 glass-card border-border/50" align="end">
                <div className="px-3 py-2 border-b border-border/30 mb-1">
                  <p className="text-sm font-semibold text-foreground">{profile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <span className="badge-glass text-[10px] mt-1.5 text-primary">{roleBadge[role || "field_engineer"]}</span>
                </div>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
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
