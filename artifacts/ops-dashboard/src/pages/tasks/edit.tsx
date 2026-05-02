import { useGetTask, useUpdateTask, getGetTaskQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { TaskForm } from "./form";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: task, isLoading: isFetching } = useGetTask(id || "", {
    query: {
      enabled: !!id,
      queryKey: getGetTaskQueryKey(id || "")
    }
  });

  const updateTask = useUpdateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(id || "") });
        queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
        toast.success("Task updated successfully");
        setLocation("/tasks");
      },
      onError: () => {
        toast.error("Failed to update task");
      }
    }
  });

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900">Task not found</h2>
        <p className="text-slate-500 mt-2">The task you're trying to edit does not exist.</p>
        <Link href="/tasks" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tasks" className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Edit Task</h1>
          <p className="text-slate-500 mt-1">Update details for {task.title}.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <TaskForm 
          initialData={task}
          onSubmit={(data) => updateTask.mutate({ id: id as string, data })} 
          isLoading={updateTask.isPending} 
        />
      </div>
    </div>
  );
}
