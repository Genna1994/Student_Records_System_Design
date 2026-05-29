import { createRouter, publicQuery } from "./middleware";
import { studentRouter } from "./routers/student";
import { courseRouter } from "./routers/course";
import { enrollmentRouter } from "./routers/enrollment";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  student: studentRouter,
  course: courseRouter,
  enrollment: enrollmentRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
