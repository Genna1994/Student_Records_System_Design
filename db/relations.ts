import { relations } from "drizzle-orm";
import { students, courses, prerequisites, enrollments } from "./schema";

// Students have many enrollments
export const studentsRelations = relations(students, ({ many }) => ({
  enrollments: many(enrollments),
}));

// Courses have many enrollments, many prerequisites (as course), and many reverse prerequisites (as prereq)
export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
  prerequisites: many(prerequisites, { relationName: "coursePrereqs" }),
  prereqFor: many(prerequisites, { relationName: "prereqCourse" }),
}));

// Prerequisites link two courses
export const prerequisitesRelations = relations(prerequisites, ({ one }) => ({
  course: one(courses, {
    fields: [prerequisites.courseId],
    references: [courses.id],
    relationName: "coursePrereqs",
  }),
  prereqCourse: one(courses, {
    fields: [prerequisites.prereqCourseId],
    references: [courses.id],
    relationName: "prereqCourse",
  }),
}));

// Enrollments link students and courses
export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));
