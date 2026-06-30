import { z } from "zod";
import { createRouter, publicQuery } from "../_middleware";
import { getDb } from "../_queries/connection";
import { students, enrollments, courses } from "../../db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";

export const studentRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        major: z.string().optional(),
        status: z.enum(["active", "inactive", "probation"]).optional(),
        sortBy: z.enum(["lastName", "enrollmentYear", "currentGpa"]).optional().default("lastName"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
        page: z.number().min(1).optional().default(1),
        limit: z.number().min(1).max(100).optional().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input || { page: 1, limit: 20, sortBy: "lastName", sortOrder: "asc" };
      const page = params.page || 1;
      const limit = params.limit || 20;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (params.search) {
        const s = params.search;
        conditions.push(
          sql`(${students.firstName} LIKE ${"%" + s + "%"} OR ${students.lastName} LIKE ${"%" + s + "%"} OR ${students.studentId} LIKE ${"%" + s + "%"})`
        );
      }
      if (params.major) {
        conditions.push(eq(students.major, params.major));
      }
      if (params.status) {
        conditions.push(eq(students.status, params.status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const totalResult = await db
        .select({ count: count() })
        .from(students)
        .where(whereClause);
      const total = totalResult[0]?.count || 0;

      let orderByCol;
      const sortBy = params.sortBy || "lastName";
      const sortOrder = params.sortOrder || "asc";

      if (sortBy === "currentGpa") {
        orderByCol = sortOrder === "asc" ? students.currentGpa : desc(students.currentGpa);
      } else if (sortBy === "enrollmentYear") {
        orderByCol = sortOrder === "asc" ? students.enrollmentYear : desc(students.enrollmentYear);
      } else {
        orderByCol = sortOrder === "desc" ? desc(students.lastName) : students.lastName;
      }

      const results = await db
        .select()
        .from(students)
        .where(whereClause)
        .orderBy(orderByCol)
        .limit(limit)
        .offset(offset);

      return { students: results, total, page, limit };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const student = await db
        .select()
        .from(students)
        .where(eq(students.id, input.id))
        .limit(1);

      if (!student[0]) return null;

      const studentEnrollments = await db
        .select({
          enrollmentId: enrollments.id,
          courseId: courses.id,
          courseCode: courses.courseCode,
          courseTitle: courses.title,
          credits: courses.credits,
          semester: enrollments.semester,
          status: enrollments.status,
          finalGrade: enrollments.finalGrade,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.studentId, input.id))
        .orderBy(desc(enrollments.semester));

      return { ...student[0], enrollments: studentEnrollments };
    }),

  create: publicQuery
    .input(
      z.object({
        studentId: z.string().min(1).max(20),
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        email: z.string().email().max(255),
        major: z.string().min(1).max(100),
        enrollmentYear: z.number().min(2000).max(2030),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(students).values({
        ...input,
        status: "active",
        currentGpa: "0.00",
      });
      return { id: Number(result[0].insertId), ...input, status: "active" as const, currentGpa: "0.00" };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        email: z.string().email().max(255).optional(),
        major: z.string().min(1).max(100).optional(),
        status: z.enum(["active", "inactive", "probation"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(students).set(updates).where(eq(students.id, id));
      const updated = await db.select().from(students).where(eq(students.id, id)).limit(1);
      return updated[0];
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(students).where(eq(students.id, input.id));
      return { success: true };
    }),

  getTranscript: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const student = await db
        .select()
        .from(students)
        .where(eq(students.id, input.id))
        .limit(1);

      if (!student[0]) return null;

      const transcriptData = await db
        .select({
          enrollmentId: enrollments.id,
          courseId: courses.id,
          courseCode: courses.courseCode,
          courseTitle: courses.title,
          credits: courses.credits,
          department: courses.department,
          semester: enrollments.semester,
          status: enrollments.status,
          finalGrade: enrollments.finalGrade,
          enrollmentDate: enrollments.enrollmentDate,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.studentId, input.id))
        .orderBy(desc(enrollments.semester), courses.courseCode);

      const completedCourses = transcriptData.filter((t) => t.status === "completed" && t.finalGrade);
      const totalCredits = completedCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
      const gpa = student[0].currentGpa;

      return {
        student: student[0],
        courses: transcriptData,
        summary: {
          totalCredits,
          gpa,
          coursesAttempted: transcriptData.length,
          coursesCompleted: completedCourses.length,
        },
      };
    }),

  getTranscriptByStudentId: publicQuery
    .input(z.object({ studentId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const student = await db
        .select()
        .from(students)
        .where(eq(students.studentId, input.studentId))
        .limit(1);

      if (!student[0]) return null;

      const transcriptData = await db
        .select({
          enrollmentId: enrollments.id,
          courseId: courses.id,
          courseCode: courses.courseCode,
          courseTitle: courses.title,
          credits: courses.credits,
          department: courses.department,
          semester: enrollments.semester,
          status: enrollments.status,
          finalGrade: enrollments.finalGrade,
          enrollmentDate: enrollments.enrollmentDate,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.studentId, student[0].id))
        .orderBy(desc(enrollments.semester), courses.courseCode);

      const completedCourses = transcriptData.filter(
        (t) => t.status === "completed" && t.finalGrade
      );
      const totalCredits = completedCourses.reduce(
        (sum, c) => sum + (c.credits || 0),
        0
      );

      return {
        student: student[0],
        courses: transcriptData,
        summary: {
          totalCredits,
          gpa: student[0].currentGpa,
          coursesAttempted: transcriptData.length,
          coursesCompleted: completedCourses.length,
        },
      };
    }),

  getDistinctMajors: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .selectDistinct({ major: students.major })
      .from(students)
      .orderBy(students.major);
    return result.map((r) => r.major);
  }),
});
