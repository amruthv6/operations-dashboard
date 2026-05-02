import { Router, type IRouter } from "express";
import { db, tasksTable } from "@workspace/db";
import { eq, ilike, and, lt, ne, desc, count, SQL } from "drizzle-orm";
import {
  CreateTaskBody,
  UpdateTaskBody,
  GetTaskParams,
  UpdateTaskParams,
  DeleteTaskParams,
  ListTasksQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toApiTask(task: typeof tasksTable.$inferSelect) {
  const now = new Date();
  const isOverdue =
    task.dueDate != null &&
    task.dueDate < now &&
    task.status !== "completed";
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    assignee: task.assignee ?? null,
    tags: task.tags,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    isOverdue,
  };
}

router.get("/tasks", async (req, res): Promise<void> => {
  const parsed = ListTasksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params", message: parsed.error.message });
    return;
  }

  const { status, priority, search, page = 1, limit = 20 } = parsed.data;

  const conditions: SQL[] = [];
  if (status) conditions.push(eq(tasksTable.status, status));
  if (priority) conditions.push(eq(tasksTable.priority, priority));
  if (search) conditions.push(ilike(tasksTable.title, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [allRows, tasks] = await Promise.all([
    db.select({ count: count() }).from(tasksTable).where(where),
    db
      .select()
      .from(tasksTable)
      .where(where)
      .orderBy(desc(tasksTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  const total = Number(allRows[0]?.count ?? 0);

  res.json({
    tasks: tasks.map(toApiTask),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", message: parsed.error.message });
    return;
  }

  const { dueDate, ...rest } = parsed.data;

  const [task] = await db
    .insert(tasksTable)
    .values({
      ...rest,
      dueDate: dueDate ? new Date(dueDate as unknown as string) : null,
      tags: rest.tags ?? [],
    })
    .returning();

  res.status(201).json(toApiTask(task));
});

router.get("/tasks/:id", async (req, res): Promise<void> => {
  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, params.data.id));

  if (!task) {
    res.status(404).json({ error: "Not found", message: "Task not found" });
    return;
  }

  res.json(toApiTask(task));
});

router.put("/tasks/:id", async (req, res): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", message: parsed.error.message });
    return;
  }

  const { dueDate, ...rest } = parsed.data;
  const updateData: Partial<typeof tasksTable.$inferInsert> = {
    ...rest,
    updatedAt: new Date(),
  };

  if (dueDate !== undefined) {
    updateData.dueDate = dueDate ? new Date(dueDate as unknown as string) : null;
  }

  const [task] = await db
    .update(tasksTable)
    .set(updateData)
    .where(eq(tasksTable.id, params.data.id))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Not found", message: "Task not found" });
    return;
  }

  res.json(toApiTask(task));
});

router.delete("/tasks/:id", async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params", message: params.error.message });
    return;
  }

  const [task] = await db
    .delete(tasksTable)
    .where(eq(tasksTable.id, params.data.id))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Not found", message: "Task not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
