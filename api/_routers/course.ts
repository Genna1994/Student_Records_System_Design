import { z } from "zod";
import { createRouter, publicQuery } from "../_middleware";
import { getDb } from "../_queries/connection";
import { courses, prerequisites, enrollments, students } from "../../db/schema";
import { eq, and, like, count, desc } from "drizzle-orm";

export const courseRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        department: z.string().optional(),
        semester: z.string().optional(),
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input || { page: 1, limit: 20 };
      const page = params.page || 1;
      const limit = params.limit || 20;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (params.search) {
        conditions.push(like(courses.courseCode, "%" + params.search + "%"));
      }
      if (params.department) {
        conditions.push(eq(courses.department, params.department));
      }
      if (params.semester) {
        conditions.push(eq(courses.semester, params.semester));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const totalResult = await db
        .select({ count: count() })
        .from(courses)
        .where(whereClause);
      const total = totalResult[0]?.count || 0;

      const results = await db
        .select()
        .from(courses)
        .where(whereClause)
        .orderBy(courses.courseCode)
        .limit(limit)
        .offset(offset);

      return { courses: results, total, page, limit };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const course = await db
        .select()
        .from(courses)
        .where(eq(courses.id, input.id))
        .limit(1);

      if (!course[0]) return null;

      const prereqs = await db
        .select({
          prereqId: prerequisites.id,
          courseId: courses.id,
          courseCode: courses.courseCode,
          courseTitle: courses.title,
        })
        .from(prerequisites)
        .innerJoin(courses, eq(prerequisites.prereqCourseId, courses.id))
        .where(eq(prerequisites.courseId, input.id));

      const prereqFor = await db
        .select({
          prereqId: prerequisites.id,
          courseId: courses.id,
          courseCode: courses.courseCode,
          courseTitle: courses.title,
        })
        .from(prerequisites)
        .innerJoin(courses, eq(prerequisites.courseId, courses.id))
        .where(eq(prerequisites.prereqCourseId, input.id));

      const courseEnrollments = await db
        .select({
          enrollmentId: enrollments.id,
          studentId: students.id,
          studentName: students.firstName,
          studentLastName: students.lastName,
          studentIdCode: students.studentId,
          status: enrollments.status,
          finalGrade: enrollments.finalGrade,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .where(eq(enrollments.courseId, input.id))
        .orderBy(desc(enrollments.enrollmentDate));

      return {
        ...course[0],
        prerequisites: prereqs,
        prerequisiteFor: prereqFor,
        enrollments: courseEnrollments,
      };
    }),

  create: publicQuery
    .input(
      z.object({
        courseCode: z.string().min(1).max(20),
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        credits: z.number().min(1).max(6).default(3),
        maxCapacity: z.number().min(1).max(200).default(30),
        department: z.string().min(1).max(100),
        semester: z.string().min(1).max(20),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(courses).values({
        ...input,
        currentEnrollment: 0,
      });
      return { id: Number(result[0].insertId), ...input, currentEnrollment: 0 };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().max(200).optional(),
        description: z.string().optional(),
        credits: z.number().min(1).max(6).optional(),
        maxCapacity: z.number().min(1).max(200).optional(),
        department: z.string().max(100).optional(),
        semester: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(courses).set(updates).where(eq(courses.id, id));
      const updated = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
      return updated[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(courses).where(eq(courses.id, input.id));
      return { success: true };
    }),

  addPrerequisite: publicQuery
    .input(
      z.object({
        courseId: z.number(),
        prereqCourseId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(prerequisites).values(input);
      return { id: Number(result[0].insertId), ...input };
    }),

  removePrerequisite: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(prerequisites).where(eq(prerequisites.id, input.id));
      return { success: true };
    }),

  getDistinctDepartments: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .selectDistinct({ department: courses.department })
      .from(courses)
      .orderBy(courses.department);
    return result.map((r) => r.department);
  }),

  getDistinctSemesters: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .selectDistinct({ semester: courses.semester })
      .from(courses)
      .orderBy(courses.semester);
    return result.map((r) => r.semester);
  }),

  getAvailableAsPrerequisite: publicQuery
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const allCourses = await db
        .select({ id: courses.id, courseCode: courses.courseCode, title: courses.title })
        .from(courses)
        .orderBy(courses.courseCode);

      const existing = await db
        .select({ prereqCourseId: prerequisites.prereqCourseId })
        .from(prerequisites)
        .where(eq(prerequisites.courseId, input.courseId));

      const existingIds = new Set(existing.map((e) => e.prereqCourseId));

      return allCourses
        .filter((c) => c.id !== input.courseId && !existingIds.has(c.id))
        .map((c) => ({ id: c.id, courseCode: c.courseCode, title: c.title }));
    }),
});
