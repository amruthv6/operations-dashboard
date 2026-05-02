import { useGetAnalyticsSummary, useGetTasksByPriority, useGetTasksByStatus, useGetCompletionTrend, useListTasks } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format } from "date-fns";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Activity } from "lucide-react";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetAnalyticsSummary();
  const { data: byPriority } = useGetTasksByPriority();
  const { data: byStatus } = useGetTasksByStatus();
  const { data: trend } = useGetCompletionTrend();
  
  // Custom hook usage for overdue alerts
  // Wait, the API spec says `useGetOverdueTasks` exists but might not be correctly exported or named. Let's just use useListTasks with a filter if possible, or use the generated hook if it exists.
  // The instructions explicitly mentioned: `export function useGetOverdueTasks<...>`
  // But looking at the API schemas I don't see an explicit overduetasks endpoint exported in the read, wait, I can just use useListTasks with an assumption or check if useGetOverdueTasks was actually in the read output.
  // Actually, I will use `useListTasks` and assume the backend handles returning overdue tasks if I use a specific filter, or I will filter on the frontend for the overdue ones if `useGetOverdueTasks` isn't fully clear.
  // Oh wait, "export const getGetOverdueTasksQueryKey = () => {...}" was in the prompt!
  
  // Let's use it as if it exists.
  // I will import it from "@workspace/api-client-react" below, but actually wait, I didn't see `useGetOverdueTasks` in the read output... Oh I truncated the read output. The prompt says it exists.
  // Actually I can't import useGetOverdueTasks directly if I'm not 100% sure it's there. I'll just rely on `useListTasks({ status: 'pending' })` and filter for isOverdue on frontend to be safe if `useGetOverdueTasks` fails.
  // Actually the prompt says: "export function useGetOverdueTasks<...>" so I WILL use it.

  // To be perfectly safe, I will fetch all pending tasks and filter `isOverdue: true` if `useGetOverdueTasks` is problematic, or I'll just use it.
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of operations and task status.</p>
        </div>
      </div>

      {isSummaryLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800 h-28" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Activity className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.completed}</div>
              <p className="text-xs text-slate-500 mt-1">{(summary.completionRate * 100).toFixed(1)}% completion rate</p>
            </CardContent>
          </Card>
          <Card className={summary.overdue > 0 ? "border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${summary.overdue > 0 ? "text-red-600 dark:text-red-400" : ""}`}>Overdue</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${summary.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-slate-500"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.overdue > 0 ? "text-red-600 dark:text-red-400" : ""}`}>{summary.overdue}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Completion Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              {trend && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => format(new Date(val), "MMM d")}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      labelFormatter={(val) => format(new Date(val), "MMM d, yyyy")}
                    />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Completed" />
                    <Line type="monotone" dataKey="created" stroke="#64748b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Created" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              {byPriority && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byPriority}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="priority"
                    >
                      {byPriority.map((entry, index) => {
                        const colors: Record<string, string> = {
                          low: "#94a3b8",
                          medium: "#3b82f6",
                          high: "#f59e0b",
                          critical: "#ef4444"
                        };
                        return <Cell key={`cell-${index}`} fill={colors[entry.priority] || "#cbd5e1"} />;
                      })}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Action Required: Overdue Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OverdueTasksList />
        </CardContent>
      </Card>
    </div>
  );
}

function OverdueTasksList() {
  const { data, isLoading } = useListTasks();
  
  if (isLoading) return <div className="text-sm text-slate-500">Loading...</div>;
  
  const overdueTasks = data?.tasks?.filter(t => t.isOverdue && t.status !== 'completed') || [];
  
  if (overdueTasks.length === 0) {
    return <div className="text-sm text-slate-500 py-4 text-center">No overdue tasks. You're all caught up!</div>;
  }

  return (
    <div className="space-y-4">
      {overdueTasks.slice(0, 5).map(task => (
        <div key={task.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
          <div>
            <Link href={`/tasks/${task.id}/edit`} className="font-medium text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
              {task.title}
            </Link>
            <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "Unknown"}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>
      ))}
      {overdueTasks.length > 5 && (
        <div className="pt-2 text-center">
          <Link href="/tasks" className="text-sm text-blue-600 hover:underline">
            View all {overdueTasks.length} overdue tasks
          </Link>
        </div>
      )}
    </div>
  );
}
