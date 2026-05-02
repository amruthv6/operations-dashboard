import { Router, type IRouter } from "express";
import { db, tasksTable } from "@workspace/db";
import { eq, lt, ne, and, count, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/analytics/summary", async (_req, res): Promise<void> => {
  const now = new Date();

  const [totalRow] = await db.select({ count: count() }).from(tasksTable);
  const [pendingRow] = await db
    .select({ count: count() })
    .from(tasksTable)
    .where(eq(tasksTable.status, "pending"));
  const [inProgressRow] = await db
    .select({ count: count() })
    .from(tasksTable)
    .where(eq(tasksTable.status, "in_progress"));
  const [completedRow] = await db
    .select({ count: count() })
    .from(tasksTable)
    .where(eq(tasksTable.status, "completed"));
  const [overdueRow] = await db
    .select({ count: count() })
    .from(tasksTable)
    .where(
      and(
        ne(tasksTable.status, "completed"),
        lt(tasksTable.dueDate, now),
        sql`${tasksTable.dueDate} IS NOT NULL`,
      ),
    );

  const total = Number(totalRow?.count ?? 0);
  const completed = Number(completedRow?.count ?? 0);

  res.json({
    total,
    pending: Number(pendingRow?.count ?? 0),
    inProgress: Number(inProgressRow?.count ?? 0),
    completed,
    overdue: Number(overdueRow?.count ?? 0),
    completionRate: total > 0 ? Math.round((completed / total) * 100) / 100 : 0,
  });
});

router.get("/analytics/by-priority", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ priority: tasksTable.priority, count: count() })
    .from(tasksTable)
    .groupBy(tasksTable.priority);

  res.json(rows.map((r) => ({ priority: r.priority, count: Number(r.count) })));
});

router.get("/analytics/by-status", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ status: tasksTable.status, count: count() })
    .from(tasksTable)
    .groupBy(tasksTable.status);

  res.json(rows.map((r) => ({ status: r.status, count: Number(r.count) })));
});

router.get("/analytics/completion-trend", async (_req, res): Promise<void> => {
  const now = new Date();
  const days: Array<{ date: string; completed: number; created: number }> = [];

  for (let i = 13; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const [completedRow] = await db
      .select({ count: count() })
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.status, "completed"),
          gte(tasksTable.updatedAt, start),
          lt(tasksTable.updatedAt, end),
        ),
      );

    const [createdRow] = await db
      .select({ count: count() })
      .from(tasksTable)
      .where(
        and(
          gte(tasksTable.createdAt, start),
          lt(tasksTable.createdAt, end),
        ),
      );

    days.push({
      date: start.toISOString().split("T")[0],
      completed: Number(completedRow?.count ?? 0),
      created: Number(createdRow?.count ?? 0),
    });
  }

  res.json(days);
});

router.get("/analytics/overdue", async (_req, res): Promise<void> => {
  const now = new Date();
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        ne(tasksTable.status, "completed"),
        lt(tasksTable.dueDate, now),
        sql`${tasksTable.dueDate} IS NOT NULL`,
      ),
    );

  const result = tasks.map((task) => ({
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
    isOverdue: true,
  }));

  res.json(result);
});

export default router;
