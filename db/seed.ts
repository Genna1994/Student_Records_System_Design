// @ts-nocheck
import { getDb } from "../api/queries/connection";
import { students, courses, prerequisites, enrollments } from "./schema";
import { eq, sql, inArray } from "drizzle-orm";

const db = getDb();

const MAJORS = ["CS", "ENG", "MAT", "ART", "PHY", "BIO", "ECO", "PSY"];
const DEPARTMENTS = ["CS", "ENG", "MAT", "ART", "PHY", "BIO", "ECO", "PSY"];
const SEMESTERS = ["Fall 2024", "Spring 2025", "Fall 2025"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randGrade(): number {
  const r = Math.random();
  if (r < 0.15) return randInt(55, 69);
  if (r < 0.35) return randInt(70, 79);
  if (r < 0.65) return randInt(80, 89);
  return randInt(90, 100);
}

async function seed() {
  console.log("🌱 Seeding database...");

  await db.delete(enrollments);
  await db.delete(prerequisites);
  await db.delete(students);
  await db.delete(courses);
  console.log("  Cleared existing data");

  // ============================================
  // Seed Courses
  // ============================================
  const courseData = [
    { courseCode: "CS-101", title: "Intro to Programming", credits: 4, department: "CS", description: "Fundamentals of programming using Python" },
    { courseCode: "CS-201", title: "Data Structures", credits: 4, department: "CS", description: "Arrays, linked lists, trees, graphs, and hashing" },
    { courseCode: "CS-202", title: "Algorithms", credits: 3, department: "CS", description: "Algorithm design, analysis, and complexity" },
    { courseCode: "CS-301", title: "Database Systems", credits: 3, department: "CS", description: "Relational databases, SQL, normalization" },
    { courseCode: "CS-302", title: "Operating Systems", credits: 3, department: "CS", description: "Process management, memory, file systems" },
    { courseCode: "CS-401", title: "Machine Learning", credits: 4, department: "CS", description: "Supervised and unsupervised learning" },
    { courseCode: "CS-402", title: "Computer Networks", credits: 3, department: "CS", description: "TCP/IP, routing, application protocols" },
    { courseCode: "ENG-101", title: "English Composition", credits: 3, department: "ENG", description: "Writing skills and rhetorical strategies" },
    { courseCode: "ENG-201", title: "Technical Writing", credits: 3, department: "ENG", description: "Professional communication and documentation" },
    { courseCode: "MAT-101", title: "Calculus I", credits: 4, department: "MAT", description: "Limits, derivatives, and integrals" },
    { courseCode: "MAT-201", title: "Calculus II", credits: 4, department: "MAT", description: "Series, multivariable calculus" },
    { courseCode: "MAT-301", title: "Linear Algebra", credits: 3, department: "MAT", description: "Vector spaces, matrices, eigenvalues" },
    { courseCode: "ART-101", title: "Art History", credits: 3, department: "ART", description: "Survey of Western art from antiquity to modern" },
    { courseCode: "ART-201", title: "Digital Design", credits: 3, department: "ART", description: "Principles of digital visual communication" },
    { courseCode: "PHY-101", title: "Physics I", credits: 4, department: "PHY", description: "Mechanics, thermodynamics, waves" },
    { courseCode: "PHY-201", title: "Physics II", credits: 4, department: "PHY", description: "Electricity, magnetism, optics" },
    { courseCode: "BIO-101", title: "General Biology", credits: 4, department: "BIO", description: "Cell biology, genetics, evolution" },
    { courseCode: "ECO-101", title: "Microeconomics", credits: 3, department: "ECO", description: "Supply, demand, market structures" },
    { courseCode: "ECO-201", title: "Macroeconomics", credits: 3, department: "ECO", description: "GDP, inflation, fiscal policy" },
    { courseCode: "PSY-101", title: "Intro to Psychology", credits: 3, department: "PSY", description: "Behavior, cognition, and mental processes" },
  ];

  await db.insert(courses).values(
    courseData.map((c) => ({
      ...c,
      maxCapacity: randInt(20, 40),
      semester: rand(SEMESTERS),
      currentEnrollment: 0,
    }))
  );

  const allCourses = await db.select().from(courses);
  console.log(`  Inserted ${allCourses.length} courses`);

  // ============================================
  // Seed Prerequisites
  // ============================================
  const courseCodeToId = new Map(allCourses.map((c) => [c.courseCode, c.id]));
  const prereqPairs = [
    ["CS-201", "CS-101"],
    ["CS-202", "CS-201"],
    ["CS-301", "CS-201"],
    ["CS-302", "CS-201"],
    ["CS-401", "CS-202"],
    ["CS-401", "CS-301"],
    ["CS-402", "CS-302"],
    ["MAT-201", "MAT-101"],
    ["MAT-301", "MAT-201"],
    ["ENG-201", "ENG-101"],
    ["PHY-201", "PHY-101"],
    ["ECO-201", "ECO-101"],
  ];

  const prereqValues = [];
  for (const [courseCode, prereqCode] of prereqPairs) {
    const courseId = courseCodeToId.get(courseCode);
    const prereqCourseId = courseCodeToId.get(prereqCode);
    if (courseId && prereqCourseId) {
      prereqValues.push({ courseId, prereqCourseId });
    }
  }
  await db.insert(prerequisites).values(prereqValues);
  console.log(`  Inserted ${prereqValues.length} prerequisite relationships`);

  // ============================================
  // Seed Students
  // ============================================
  const firstNames = [
    "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia",
    "Mason", "Isabella", "Lucas", "Mia", "Oliver", "Charlotte", "Elijah",
    "Amelia", "Aiden", "Harper", "Jackson", "Evelyn", "Logan", "Abigail",
    "Carter", "Emily", "Benjamin", "Elizabeth", "Alexander", "Sofia",
    "Daniel", "Avery", "Matthew", "Ella", "Henry", "Madison", "Sebastian",
    "Scarlett", "Jack", "Victoria", "Samuel", "Chloe", "David", "Grace",
    "Joseph", "Zoey", "Wyatt", "Nora", "Luke", "Lily", "Gabriel", "Hannah",
  ];
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
    "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
    "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
    "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
    "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts",
  ];

  const studentValues = [];
  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const major = rand(MAJORS);
    const enrollmentYear = randInt(2021, 2025);
    const studentId = `STU-${String(1000 + i).padStart(4, "0")}`;
    const r = Math.random();
    const status = r < 0.85 ? "active" : (r < 0.93 ? "probation" : "inactive") as "active" | "probation" | "inactive";

    studentValues.push({
      studentId,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 99)}@nexus.edu`,
      major,
      enrollmentYear,
      status,
      currentGpa: "0.00",
    });
  }

  await db.insert(students).values(studentValues);
  const allStudents = await db.select().from(students);
  console.log(`  Inserted ${allStudents.length} students`);

  // ============================================
  // Seed Enrollments (batch in small chunks)
  // ============================================
  const enrollmentValues = [];
  const usedKeys = new Set<string>();

  for (let i = 0; i < 120; i++) {
    const student = rand(allStudents);
    const course = rand(allCourses);
    const semester = rand(SEMESTERS);
    const key = `${student.id}-${course.id}-${semester}`;

    if (usedKeys.has(key)) continue;
    usedKeys.add(key);

    const status = semester === "Fall 2025"
      ? (Math.random() < 0.8 ? "enrolled" : "dropped")
      : (Math.random() < 0.85 ? "completed" : "dropped");

    const finalGrade = status === "completed" ? String(randGrade()) : null;

    enrollmentValues.push({
      studentId: student.id,
      courseId: course.id,
      semester,
      status,
      finalGrade,
    });
  }

  // Batch insert in chunks of 15
  for (let i = 0; i < enrollmentValues.length; i += 15) {
    const chunk = enrollmentValues.slice(i, i + 15);
    await db.insert(enrollments).values(chunk);
  }
  console.log(`  Inserted ${enrollmentValues.length} enrollments`);

  // ============================================
  // Update course enrollment counts via SQL
  // ============================================
  await db.execute(sql`
    UPDATE courses c
    SET current_enrollment = (
      SELECT COUNT(*) FROM enrollments e
      WHERE e.course_id = c.id AND e.status != 'dropped'
    )
  `);
  console.log("  Updated course enrollment counts");

  // ============================================
  // Calculate and update student GPAs via SQL
  // ============================================
  // First, compute GPA for each student
  const gpaResults = await db.execute(sql`
    SELECT 
      e.student_id,
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
    WHERE e.status = 'completed' AND e.final_grade IS NOT NULL
    GROUP BY e.student_id
  `);

  // Update each student's GPA
  for (const row of gpaResults[0] as any[]) {
    const gpaVal = parseFloat(row.gpa);
    const gpaStr = gpaVal.toFixed(2);
    const status = gpaVal < 2.0 ? "probation" as const : undefined;
    
    await db.update(students)
      .set(status ? { currentGpa: gpaStr, status } : { currentGpa: gpaStr })
      .where(eq(students.id, row.student_id));
  }
  console.log("  Updated student GPAs");

  console.log("✅ Seed complete!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
