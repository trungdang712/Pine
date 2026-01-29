import { createTRPCRouter, createCallerFactory } from "./trpc";
import { userRouter } from "./routers/user";
import { taskRouter } from "./routers/task";
import { proposalRouter } from "./routers/proposal";
import { calendarRouter } from "./routers/calendar";
import { analyticsRouter } from "./routers/analytics";
import { budgetRouter } from "./routers/budget";
import { gamificationRouter } from "./routers/gamification";
import { externalRouter } from "./routers/external";
import { performanceRouter } from "./routers/performance";
import { libraryRouter } from "./routers/library";
import { alertsRouter } from "./routers/alerts";
import { redditRouter } from "./routers/reddit";
import { integrationRouter } from "./routers/integration";
import { dashboardRouter } from "./routers/dashboard";

export const appRouter = createTRPCRouter({
  user: userRouter,
  task: taskRouter,
  proposal: proposalRouter,
  calendar: calendarRouter,
  analytics: analyticsRouter,
  budget: budgetRouter,
  gamification: gamificationRouter,
  external: externalRouter,
  performance: performanceRouter,
  library: libraryRouter,
  alerts: alertsRouter,
  reddit: redditRouter,
  integration: integrationRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
