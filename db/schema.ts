import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  int,
  decimal,
  timestamp,
  index,
  unique,
  check,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const students = mysqlTable(
  "students",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: varchar("student_id", { length: 20 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    major: varchar("major", { length: 100 }).notNull(),
    enrollmentYear: int("enrollment_year").notNull(),
    status: mysqlEnum("status", ["active", "inactive", "probation"]).notNull().default("active"),
    currentGpa: decimal("current_gpa", { precision: 3, scale: 2 }).default("0.00"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_students_student_id").on(table.studentId),
    index("idx_students_email").on(table.email),
    index("idx_students_status").on(table.status),
    index("idx_students_major").on(table.major),
    unique("unq_students_student_id").on(table.studentId),
    unique("unq_students_email").on(table.email),
  ]
);

export const courses = mysqlTable(
  "courses",
  {
    id: int("id").autoincrement().primaryKey(),
    courseCode: varchar("course_code", { length: 20 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    credits: int("credits").notNull().default(3),
    maxCapacity: int("max_capacity").notNull().default(30),
    currentEnrollment: int("current_enrollment").notNull().default(0),
    department: varchar("department", { length: 100 }).notNull(),
    semester: varchar("semester", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_courses_course_code").on(table.courseCode),
    index("idx_courses_department").on(table.department),
    index("idx_courses_semester").on(table.semester),
    unique("unq_courses_course_code").on(table.courseCode),
  ]
);

export const prerequisites = mysqlTable(
  "prerequisites",
  {
    id: int("id").autoincrement().primaryKey(),
    courseId: int("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    prereqCourseId: int("prereq_course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("unq_prereq_pair").on(table.courseId, table.prereqCourseId),
    check("chk_no_self_prereq", sql`${table.courseId} <> ${table.prereqCourseId}`),
  ]
);

export const enrollments = mysqlTable(
  "enrollments",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    courseId: int("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    semester: varchar("semester", { length: 20 }).notNull(),
    enrollmentDate: timestamp("enrollment_date").defaultNow(),
    status: mysqlEnum("status", ["enrolled", "completed", "dropped"]).notNull().default("enrolled"),
    finalGrade: decimal("final_grade", { precision: 5, scale: 2 }),
  },
  (table) => [
    index("idx_enrollments_student").on(table.studentId),
    index("idx_enrollments_course").on(table.courseId),
    index("idx_enrollments_status").on(table.status),
    index("idx_enrollments_semester").on(table.semester),
    unique("unq_enrollment").on(table.studentId, table.courseId, table.semester),
  ]
);