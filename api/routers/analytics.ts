import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { students, courses, enrollments } from "@db/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import { z } from "zod";

export const analyticsRouter = createRouter({
  dashboard: publicQuery.query(async () => {
    const db = getDb();

    const totalStudentsResult = await db
      .select({ count: count() })
      .from(students);
    const totalStudents = totalStudentsResult[0]?.count || 0;

    const activeStudentsResult = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.status, "active"));
    const activeStudents = activeStudentsResult[0]?.count || 0;

    const totalCoursesResult = await db
      .select({ count: count() })
      .from(courses);
    const totalCourses = totalCoursesResult[0]?.count || 0;

    const avgGpaResult = await db.execute(
      sql`SELECT AVG(current_gpa) as avg_gpa FROM students WHERE current_gpa > 0`
    );
    const avgGpaRows = avgGpaResult as unknown as Array<{ avg_gpa: string | null }>;
    const avgGpa = parseFloat(avgGpaRows[0]?.avg_gpa || "0").toFixed(2);

    const totalEnrollmentsResult = await db
      .select({ count: count() })
      .from(enrollments);
    const totalEnrollments = totalEnrollmentsResult[0]?.count || 0;

    const enrolledCountResult = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "enrolled"));
    const enrolledCount = enrolledCountResult[0]?.count || 0;

    const completedCountResult = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "completed"));
    const completedCount = completedCountResult[0]?.count || 0;

    const recentEnrollments = await db
      .select({
        enrollmentId: enrollments.id,
        studentName: students.firstName,
        studentLastName: students.lastName,
        studentIdCode: students.studentId,
        courseCode: courses.courseCode,
        courseTitle: courses.title,
        semester: enrollments.semester,
        status: enrollments.status,
        enrollmentDate: enrollments.enrollmentDate,
      })
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .orderBy(desc(enrollments.enrollmentDate))
      .limit(10);

    const studentsByMajor = await db.execute(
      sql`SELECT major, COUNT(*) as count FROM students GROUP BY major ORDER BY count DESC`
    );

    const topCourses = await db.execute(
      sql`SELECT course_code, title, current_enrollment, max_capacity FROM courses ORDER BY current_enrollment DESC LIMIT 5`
    );

    return {
      totalStudents,
      activeStudents,
      totalCourses,
      avgGpa,
      totalEnrollments,
      enrolledCount,
      completedCount,
      droppedCount: totalEnrollments - enrolledCount - completedCount,
      recentEnrollments,
      studentsByMajor: (studentsByMajor as unknown as Array<{ major: string; count: number }>),
      topCourses: (topCourses as unknown as Array<{ course_code: string; title: string; current_enrollment: number; max_capacity: number }>),
    };
  }),

  courseAnalytics: publicQuery
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const statusCounts = await db.execute(
        sql`SELECT status, COUNT(*) as count FROM enrollments WHERE course_id = ${input.courseId} GROUP BY status`
      );

      const gradeDistribution = await db.execute(
        sql`SELECT 
          CASE 
            WHEN final_grade >= 90 THEN 'A'
            WHEN final_grade >= 80 THEN 'B'
            WHEN final_grade >= 70 THEN 'C'
            WHEN final_grade >= 60 THEN 'D'
            ELSE 'F'
          END as letter_grade,
          COUNT(*) as count,
          AVG(final_grade) as avg_grade
        FROM enrollments 
        WHERE course_id = ${input.courseId} AND final_grade IS NOT NULL
        GROUP BY letter_grade
        ORDER BY FIELD(letter_grade, 'A', 'B', 'C', 'D', 'F')`
      );

      const avgGradeResult = await db.execute(
        sql`SELECT AVG(final_grade) as avg_grade FROM enrollments WHERE course_id = ${input.courseId} AND final_grade IS NOT NULL`
      );

      const avgRows = avgGradeResult as unknown as Array<{ avg_grade: string | null }>;

      return {
        statusCounts: (statusCounts as unknown as Array<{ status: string; count: number }>),
        gradeDistribution: (gradeDistribution as unknown as Array<{ letter_grade: string; count: number; avg_grade: string }>),
        avgGrade: parseFloat(avgRows[0]?.avg_grade || "0").toFixed(2),
      };
    }),

  studentPerformance: publicQuery
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const creditsResult = await db.execute(
        sql`SELECT SUM(c.credits) as total_credits
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.student_id = ${input.studentId} AND e.status = 'completed' AND e.final_grade >= 60`
      );

      const creditRows = creditsResult as unknown as Array<{ total_credits: string | null }>;
      const totalCredits = parseInt(creditRows[0]?.total_credits || "0");

      const gpaBySemester = await db.execute(
        sql`SELECT 
          e.semester,
          SUM(
            CASE 
              WHEN e.final_grade >= 90 THEN 4.0 * c.credits
              WHEN e.final_grade >= 80 THEN 3.0 * c.credits
              WHEN e.final_grade >= 70 THEN 2.0 * c.credits
              WHEN e.final_grade >= 60 THEN 1.0 * c.credits
              ELSE 0.0
            END
          ) / SUM(c.credits) as semester_gpa
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ${input.studentId} AND e.status = 'completed' AND e.final_grade IS NOT NULL
        GROUP BY e.semester
        ORDER BY e.semester`
      );

      return {
        totalCredits,
        gpaBySemester: (gpaBySemester as unknown as Array<{ semester: string; semester_gpa: string }>),
      };
    }),
});
