import { TaskPriority, TaskStatus } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; className: string }> = {
    [TaskPriority.low]: { label: "Low", className: "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300" },
    [TaskPriority.medium]: { label: "Medium", className: "bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
    [TaskPriority.high]: { label: "High", className: "bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
    [TaskPriority.critical]: { label: "Critical", className: "bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-900/30 dark:text-red-400" },
  };

  const config = map[priority] || { label: priority, className: "bg-slate-100 text-slate-700" };

  return (
    <Badge variant="outline" className={cn("font-medium border-0 px-2 py-0.5", config.className)}>
      {config.label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    [TaskStatus.pending]: { label: "Pending", className: "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
    [TaskStatus.in_progress]: { label: "In Progress", className: "bg-indigo-50 text-indigo-700 hover:bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
    [TaskStatus.completed]: { label: "Completed", className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  };

  const config = map[status] || { label: status, className: "bg-slate-100 text-slate-700 border-slate-200" };

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
