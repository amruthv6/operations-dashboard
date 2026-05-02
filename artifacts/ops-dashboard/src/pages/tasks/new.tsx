import { useCreateTask } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { TaskForm } from "./form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NewTask() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createTask = useCreateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
        toast.success("Task created successfully");
        setLocation("/tasks");
      },
      onError: () => {
        toast.error("Failed to create task");
      }
    }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tasks" className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">New Task</h1>
          <p className="text-slate-500 mt-1">Create a new operational task.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <TaskForm 
          onSubmit={(data) => createTask.mutate({ data })} 
          isLoading={createTask.isPending} 
        />
      </div>
    </div>
  );
}
