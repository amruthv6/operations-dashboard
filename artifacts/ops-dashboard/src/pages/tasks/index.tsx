import { useState } from "react";
import { useListTasks, useUpdateTask, useDeleteTask, getListTasksQueryKey, Task, TaskStatus, TaskPriority } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { Search, Plus, MoreHorizontal, AlertCircle, Edit, Trash2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

export default function Tasks() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const queryClient = useQueryClient();

  const { data, isLoading } = useListTasks({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    priority: priorityFilter !== "all" ? priorityFilter as any : undefined,
    limit: 50
  });

  const updateTask = useUpdateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
        toast.success("Task updated successfully");
      },
      onError: () => toast.error("Failed to update task")
    }
  });

  const deleteTask = useDeleteTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
        toast.success("Task deleted");
      },
      onError: () => toast.error("Failed to delete task")
    }
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateTask.mutate({ id, data: { status: newStatus as any } });
  };

  const tasks = data?.tasks || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-slate-500 mt-1">Manage and track operational tasks.</p>
        </div>
        <Link href="/tasks/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search tasks by title..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[40%]">Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">No tasks found</p>
                    <p className="text-sm mb-4">Create a new task to get started.</p>
                    <Link href="/tasks/new">
                      <Button variant="outline">Create Task</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id} className={task.isOverdue && task.status !== 'completed' ? "bg-red-50/30" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {task.isOverdue && task.status !== 'completed' && (
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium text-slate-900 line-clamp-1">{task.title}</div>
                        {task.assignee && (
                          <div className="text-xs text-slate-500 mt-1">Assignee: {task.assignee}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none">
                        <div className="cursor-pointer hover:opacity-80 transition-opacity">
                          <StatusBadge status={task.status} />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'pending')}>Pending</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'in_progress')}>In Progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'completed')}>Completed</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm ${task.isOverdue && task.status !== 'completed' ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                      {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/tasks/${task.id}/edit`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit details
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 cursor-pointer focus:text-red-600"
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this task?")) {
                              deleteTask.mutate({ id: task.id });
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
