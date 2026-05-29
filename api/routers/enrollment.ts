import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { enrollments, courses, students, prerequisites } from "@db/schema";
import { eq, and, count, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const enrollmentRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        studentId: z.number().optional(),
        courseId: z.number().optional(),
        semester: z.string().optional(),
        status: z.enum(["enrolled", "completed", "dropped"]).optional(),
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
      if (params.studentId) {
        conditions.push(eq(enrollments.studentId, params.studentId));
      }
      if (params.courseId) {
        conditions.push(eq(enrollments.courseId, params.courseId));
      }
      if (params.semester) {
        conditions.push(eq(enrollments.semester, params.semester));
      }
      if (params.status) {
        conditions.push(eq(enrollments.status, params.status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const totalResult = await db
        .select({ count: count() })
        .from(enrollments)
        .where(whereClause);
      const total = totalResult[0]?.count || 0;

      const results = await db
        .select({
          enrollmentId: enrollments.id,
          studentId: students.id,
          studentName: students.firstName,
          studentLastName: students.lastName,
          studentIdCode: students.studentId,
          courseId: courses.id,
          courseCode: courses.courseCode,
          courseTitle: courses.title,
          credits: courses.credits,
          semester: enrollments.semester,
          enrollmentDate: enrollments.enrollmentDate,
          status: enrollments.status,
          finalGrade: enrollments.finalGrade,
        })
        .from(enrollments)
        .innerJoin(students, eq(enrollments.studentId, students.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(whereClause)
        .orderBy(desc(enrollments.enrollmentDate))
        .limit(limit)
        .offset(offset);

      return { enrollments: results, total, page, limit };
    }),

  enroll: publicQuery
    .input(
      z.object({
        studentId: z.number(),
        courseId: z.number(),
        semester: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      return await db.transaction(async (tx) => {
        // 1. Verify student exists and is active
        const studentList = await tx
          .select()
          .from(students)
          .where(eq(students.id, input.studentId))
          .limit(1);

        if (!studentList[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
        }
        if (studentList[0].status === "inactive") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Student is inactive and cannot enroll" });
        }

        // 2. Verify course exists
        const courseList = await tx
          .select()
          .from(courses)
          .where(eq(courses.id, input.courseId))
          .limit(1);

        if (!courseList[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
        }

        const course = courseList[0];

        // 3. RULE 1: Check course capacity
        if (course.currentEnrollment >= course.maxCapacity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Course is at maximum capacity (${course.maxCapacity}/${course.maxCapacity})`,
          });
        }

        // 4. Check for duplicate enrollment
        const existingEnrollment = await tx
          .select()
          .from(enrollments)
          .where(
            and(
              eq(enrollments.studentId, input.studentId),
              eq(enrollments.courseId, input.courseId),
              eq(enrollments.semester, input.semester)
            )
          )
          .limit(1);

        if (existingEnrollment[0]) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Student already enrolled in this course for ${input.semester}`,
          });
        }

        // 5. RULE 2: Check prerequisites
        const prereqList = await tx
          .select({ prereqCourseId: prerequisites.prereqCourseId })
          .from(prerequisites)
          .where(eq(prerequisites.courseId, input.courseId));

        if (prereqList.length > 0) {
          const prereqIds = prereqList.map((p) => p.prereqCourseId);

          for (const prereqId of prereqIds) {
            const completedPrereq = await tx
              .select()
              .from(enrollments)
              .where(
                and(
                  eq(enrollments.studentId, input.studentId),
                  eq(enrollments.courseId, prereqId),
                  eq(enrollments.status, "completed")
                )
              )
              .limit(1);

            if (!completedPrereq[0]) {
              const prereqCourse = await tx
                .select({ courseCode: courses.courseCode, title: courses.title })
                .from(courses)
                .where(eq(courses.id, prereqId))
                .limit(1);

              const prereqCode = prereqCourse[0]?.courseCode || "Unknown";
              const prereqTitle = prereqCourse[0]?.title || "";

              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Prerequisite not met: ${prereqCode} ${prereqTitle ? `- ${prereqTitle}` : ""} must be completed first`,
              });
            }

            const grade = parseFloat(completedPrereq[0].finalGrade || "0");
            if (grade < 60) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Prerequisite not passed with minimum grade (60%). Current grade: ${grade}%`,
              });
            }
          }
        }

        // 6. Insert enrollment record
        const result = await tx.insert(enrollments).values({
          studentId: input.studentId,
          courseId: input.courseId,
          semester: input.semester,
          status: "enrolled",
        });

        // 7. Increment course enrollment count
        await tx
          .update(courses)
          .set({ currentEnrollment: course.currentEnrollment + 1 })
          .where(eq(courses.id, input.courseId));

        const newEnrollmentId = Number(result[0].insertId);
        return {
          id: newEnrollmentId,
          studentId: input.studentId,
          courseId: input.courseId,
          semester: input.semester,
          status: "enrolled" as const,
          courseCode: course.courseCode,
          courseTitle: course.title,
        };
      });
    }),

  drop: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      return await db.transaction(async (tx) => {
        const enrollmentList = await tx
          .select()
          .from(enrollments)
          .where(eq(enrollments.id, input.id))
          .limit(1);

        if (!enrollmentList[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Enrollment not found" });
        }

        const enrollment = enrollmentList[0];

        if (enrollment.status !== "enrolled") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot drop a course with status: ${enrollment.status}`,
          });
        }

        await tx
          .update(enrollments)
          .set({ status: "dropped" })
          .where(eq(enrollments.id, input.id));

        const courseList = await tx
          .select()
          .from(courses)
          .where(eq(courses.id, enrollment.courseId))
          .limit(1);

        if (courseList[0]) {
          await tx
            .update(courses)
            .set({ currentEnrollment: Math.max(0, courseList[0].currentEnrollment - 1) })
            .where(eq(courses.id, enrollment.courseId));
        }

        return { success: true, id: input.id };
      });
    }),

  updateGrade: publicQuery
    .input(
      z.object({
        id: z.number(),
        finalGrade: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      return await db.transaction(async (tx) => {
        const enrollmentList = await tx
          .select()
          .from(enrollments)
          .where(eq(enrollments.id, input.id))
          .limit(1);

        if (!enrollmentList[0]) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Enrollment not found" });
        }

        const enrollment = enrollmentList[0];

        await tx
          .update(enrollments)
          .set({
            finalGrade: String(input.finalGrade),
            status: "completed",
          })
          .where(eq(enrollments.id, input.id));

        // Recalculate GPA using raw SQL for aggregate calculation
        const gpaResult = await tx.execute(
          sql`SELECT 
            SUM(
              CASE 
                WHEN e.final_grade >= 90 THEN 4.0 * c.credits
                WHEN e.final_grade >= 80 THEN 3.0 * c.credits
                WHEN e.final_grade >= 70 THEN 2.0 * c.credits
                WHEN e.final_grade >= 60 THEN 1.0 * c.credits
                ELSE 0.0
              END
            ) / SUM(c.credits) as gpa
          FROM enrollments e
          JOIN courses c ON e.course_id = c.id
          WHERE e.student_id = ${enrollment.studentId} AND e.status = 'completed' AND e.final_grade IS NOT NULL`
        );

        const rows = gpaResult as unknown as Array<{ gpa: string | null }>;
        const gpaRow = rows[0];
        const gpaVal = gpaRow?.gpa ? parseFloat(gpaRow.gpa) : 0;
        const gpaStr = gpaVal.toFixed(2);
        const status = gpaVal < 2.0 ? "probation" as const : undefined;

        await tx
          .update(students)
          .set(status ? { currentGpa: gpaStr, status } : { currentGpa: gpaStr })
          .where(eq(students.id, enrollment.studentId));

        return {
          success: true,
          id: input.id,
          finalGrade: input.finalGrade,
          gpa: gpaStr,
          studentStatus: status || "active",
        };
      });
    }),
});
