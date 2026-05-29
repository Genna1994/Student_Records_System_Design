import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { RollingDigitRoulette } from "@/components/effects/RollingDigitRoulette";
import { ArrowLeft, FileText, BookOpen } from "lucide-react";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const studentId = parseInt(id || "0");

  const { data: student, isLoading } = trpc.student.getById.useQuery(
    { id: studentId },
    { enabled: studentId > 0 }
  );

  const gpa = parseFloat(student?.currentGpa || "0");
  const gpaColor = gpa >= 3.5 ? "text-emerald-400" : gpa < 2.0 ? "text-red-400" : "text-[#9CA3AF]";

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/students"
          className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] text-[#9CA3AF] hover:border-[#4B5563] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
        </Link>
        <h1 className="font-mono text-xl font-bold text-white">STUDENT RECORD</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-48 bg-[#1A1A1A] animate-pulse" />
          <div className="h-96 bg-[#1A1A1A] animate-pulse" />
        </div>
      ) : !student ? (
        <div className="text-center py-12 text-[#4B5563] font-mono">STUDENT NOT FOUND</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[#2A2A2A]">
          {/* Left Pane: Profile Card */}
          <div className="lg:col-span-1 bg-[#0D0D0D] p-6 space-y-6">
            <div>
              <span className="font-mono text-xs text-[#4B5563] uppercase tracking-widest">
                Student ID
              </span>
              <div className="font-mono text-lg text-white mt-1">{student.studentId}</div>
            </div>

            <div>
              <span className="font-mono text-xs text-[#4B5563] uppercase tracking-widest">
                Full Name
              </span>
              <div className="text-lg text-white mt-1">
                {student.firstName} {student.lastName}
              </div>
            </div>

            <div>
              <span className="font-mono text-xs text-[#4B5563] uppercase tracking-widest">
                Major
              </span>
              <div className="font-mono text-sm text-blue-400 mt-1">{student.major}</div>
            </div>

            <div>
              <span className="font-mono text-xs text-[#4B5563] uppercase tracking-widest">
                Enrollment Year
              </span>
              <div className="font-mono text-sm text-[#9CA3AF] mt-1">{student.enrollmentYear}</div>
            </div>

            <div>
              <span className="font-mono text-xs text-[#4B5563] uppercase tracking-widest">
                Email
              </span>
              <div className="font-mono text-xs text-[#9CA3AF] mt-1">{student.email}</div>
            </div>

            <div className="pt-4 border-t border-[#2A2A2A]">
              <span className="font-mono text-xs text-[#4B5563] uppercase tracking-widest">
                Status
              </span>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-xs uppercase font-mono status-${student.status}`}>
                  {student.status}
                </span>
              </div>
            </div>

            {/* GPA Display */}
            <div className="bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
              <span className="font-mono text-[10px] text-[#4B5563] uppercase tracking-widest">
                Current GPA
              </span>
              <div className={`text-4xl font-mono font-bold mt-2 ${gpaColor}`}>
                <RollingDigitRoulette value={student.currentGpa || "0.00"} delay={300} />
              </div>
            </div>

            <Link
              to={`/transcripts?studentId=${student.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] hover:border-[#4B5563] hover:text-white transition-colors font-mono text-xs"
            >
              <FileText className="w-3 h-3" />
              VIEW TRANSCRIPT
            </Link>
          </div>

          {/* Right Pane: Academic Transcript */}
          <div className="lg:col-span-2 bg-[#0D0D0D] p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-[#4B5563]" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#9CA3AF]">
                Course History
              </h2>
            </div>

            {student.enrollments.length === 0 ? (
              <div className="text-center py-8 text-[#4B5563] font-mono text-xs">
                NO COURSE HISTORY
              </div>
            ) : (
              <div className="space-y-px">
                {/* Header */}
                <div className="grid grid-cols-[100px_1fr_60px_80px_90px_80px] bg-[#1A1A1A] px-3 py-2">
                  {["CODE", "TITLE", "CR", "SEMESTER", "STATUS", "GRADE"].map((h) => (
                    <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-[#4B5563]">
                      {h}
                    </span>
                  ))}
                </div>

                {student.enrollments.map((enr, idx) => (
                  <div
                    key={enr.enrollmentId}
                    className={`data-row grid grid-cols-[100px_1fr_60px_80px_90px_80px] px-3 py-2.5 ${
                      idx % 2 === 0 ? "bg-[#0D0D0D]" : "bg-[#111111]"
                    }`}
                  >
                    <span className="font-mono text-xs text-blue-400">{enr.courseCode}</span>
                    <span className="text-xs text-white truncate">{enr.courseTitle}</span>
                    <span className="font-mono text-xs text-[#4B5563]">{enr.credits}</span>
                    <span className="font-mono text-xs text-[#9CA3AF]">{enr.semester}</span>
                    <span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-mono status-${enr.status}`}>
                        {enr.status}
                      </span>
                    </span>
                    <span className={`font-mono text-xs ${
                      enr.finalGrade
                        ? parseFloat(enr.finalGrade) >= 90
                          ? "text-emerald-400"
                          : parseFloat(enr.finalGrade) >= 70
                          ? "text-[#9CA3AF]"
                          : "text-red-400"
                        : "text-[#4B5563]"
                    }`}>
                      {enr.finalGrade || "--"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
