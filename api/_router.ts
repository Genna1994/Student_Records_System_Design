import { createRouter, publicQuery } from "./_middleware";
import { studentRouter } from "./_routers/student";
import { courseRouter } from "./_routers/course";
import { enrollmentRouter } from "./_routers/enrollment";
import { analyticsRouter } from "./_routers/analytics";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  student: studentRouter,
  course: courseRouter,
  enrollment: enrollmentRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
