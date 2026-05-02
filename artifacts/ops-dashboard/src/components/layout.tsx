import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-slate-900">
        <div className="flex h-14 items-center px-4 font-semibold text-lg text-slate-900 dark:text-white tracking-tight border-b">
          <div className="size-6 bg-blue-600 rounded-md mr-3 flex items-center justify-center">
            <span className="text-white text-xs font-bold">Op</span>
          </div>
          OpsCenter
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-100 text-blue-700 dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mr-3">
              <span className="text-xs">JD</span>
            </div>
            <div>
              <p className="text-slate-900 dark:text-white">John Doe</p>
              <p className="text-xs text-slate-500 font-normal">Ops Manager</p>
            </div>
          </div>
        </div>
      </div>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden h-14 border-b bg-white dark:bg-slate-900 flex items-center px-4">
          <span className="font-semibold text-lg text-slate-900 dark:text-white">OpsCenter</span>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
