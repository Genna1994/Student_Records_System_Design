import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Users, BookOpen, GitBranch, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || "0");
  const [showPrereqDialog, setShowPrereqDialog] = useState(false);

  const { data: course, isLoading, refetch } = trpc.course.getById.useQuery(
    { id: courseId },
    { enabled: courseId > 0 }
  );

  const { data: availablePrereqs } = trpc.course.getAvailableAsPrerequisite.useQuery(
    { courseId },
    { enabled: courseId > 0 }
  );

  const addPrereq = trpc.course.addPrerequisite.useMutation({
    onSuccess: () => {
      refetch();
      setShowPrereqDialog(false);
    },
  });

  const removePrereq = trpc.course.removePrerequisite.useMutation({
    onSuccess: () => refetch(),
  });

  const capacityPct = course
    ? Math.min(100, (course.currentEnrollment / course.maxCapacity) * 100)
    : 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Link
          to="/courses"
          className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] text-[#9CA3AF] hover:border-[#4B5563] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
        </Link>
        <h1 className="font-mono text-xl font-bold text-white">COURSE DETAIL</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-48 bg-[#1A1A1A] animate-pulse" />
          <div className="h-48 bg-[#1A1A1A] animate-pulse" />
        </div>
      ) : !course ? (
        <div className="text-center py-12 text-[#4B5563] font-mono">COURSE NOT FOUND</div>
      ) : (
        <div className="space-y-4">
          {/* Course Info */}
          <div className="bg-[#0D0D0D] border border-[#2A2A2A] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="font-mono text-xs text-blue-400">{course.courseCode}</span>
                <h2 className="text-lg text-white mt-1">{course.title}</h2>
                {course.description && (
                  <p className="text-xs text-[#4B5563] mt-1">{course.description}</p>
                )}
              </div>
              <span className="px-2 py-1 rounded-full text-[10px] uppercase font-mono bg-[#1A1A1A] text-[#9CA3AF] border border-[#2A2A2A]">
                {course.department} | {course.semester}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-[#1A1A1A] p-3">
                <div className="flex items-center gap-1 text-[10px] text-[#4B5563] mb-1">
                  <BookOpen className="w-3 h-3" /> CREDITS
                </div>
                <span className="font-mono text-lg text-white">{course.credits}</span>
              </div>
              <div className="bg-[#1A1A1A] p-3">
                <div className="flex items-center gap-1 text-[10px] text-[#4B5563] mb-1">
                  <Users className="w-3 h-3" /> ENROLLED
                </div>
                <span className="font-mono text-lg text-white">
                  {course.currentEnrollment}/{course.maxCapacity}
                </span>
              </div>
              <div className="bg-[#1A1A1A] p-3">
                <div className="text-[10px] text-[#4B5563] mb-1">CAPACITY</div>
                <span className={`font-mono text-lg ${
                  capacityPct >= 90 ? "text-red-400" : capacityPct >= 70 ? "text-yellow-400" : "text-emerald-400"
                }`}>
                  {capacityPct.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="w-full h-2 bg-[#1A1A1A]">
              <div
                className={`h-full ${
                  capacityPct >= 90 ? "bg-red-500" : capacityPct >= 70 ? "bg-yellow-500" : "bg-emerald-500"
                }`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#2A2A2A]">
            {/* Prerequisites */}
            <div className="bg-[#0D0D0D] p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[#4B5563]" />
                  <h3 className="font-mono text-xs uppercase tracking-widest text-[#9CA3AF]">
                    Prerequisites
                  </h3>
                </div>
                <Dialog open={showPrereqDialog} onOpenChange={setShowPrereqDialog}>
                  <DialogTrigger asChild>
                    <button className="px-2 py-1 text-[10px] font-mono text-[#9CA3AF] border border-[#2A2A2A] hover:border-[#4B5563] hover:text-white transition-colors">
                      + ADD
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-none max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="font-mono text-sm uppercase tracking-widest">
                        Add Prerequisite
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 mt-2">
                      {availablePrereqs && availablePrereqs.length > 0 ? (
                        availablePrereqs.map((prereq: { id: number; courseCode: string; title: string }) => (
                          <button
                            key={prereq.id}
                            onClick={() =>
                              addPrereq.mutate({ courseId, prereqCourseId: prereq.id })
                            }
                            className="w-full text-left px-3 py-2 bg-[#0D0D0D] border border-[#2A2A2A] hover:border-blue-500 transition-colors"
                          >
                            <span className="font-mono text-xs text-blue-400">{prereq.courseCode}</span>
                            <span className="text-xs text-[#9CA3AF] ml-2">{prereq.title}</span>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-[#4B5563] text-center py-4">
                          No available prerequisites
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {course.prerequisites.length === 0 ? (
                <div className="text-center py-4 text-[#4B5563] font-mono text-xs">
                  NO PREREQUISITES
                </div>
              ) : (
                <div className="space-y-2">
                  {course.prerequisites.map((pr) => (
                    <div
                      key={pr.prereqId}
                      className="flex items-center justify-between px-3 py-2 bg-[#1A1A1A]"
                    >
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3 h-3 text-blue-400" />
                        <span className="font-mono text-xs text-blue-400">{pr.courseCode}</span>
                        <span className="text-xs text-[#9CA3AF]">{pr.courseTitle}</span>
                      </div>
                      <button
                        onClick={() => removePrereq.mutate({ id: pr.prereqId })}
                        className="text-[#4B5563] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Prerequisite For */}
              {course.prerequisiteFor.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#4B5563] mb-2">
                    Required By
                  </h4>
                  <div className="space-y-2">
                    {course.prerequisiteFor.map((pr) => (
                      <div key={pr.prereqId} className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A]">
                        <GitBranch className="w-3 h-3 text-yellow-400" />
                        <span className="font-mono text-xs text-yellow-400">{pr.courseCode}</span>
                        <span className="text-xs text-[#9CA3AF]">{pr.courseTitle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enrolled Students */}
            <div className="bg-[#0D0D0D] p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#4B5563]" />
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#9CA3AF]">
                  Enrolled Students ({course.enrollments.length})
                </h3>
              </div>

              {course.enrollments.length === 0 ? (
                <div className="text-center py-4 text-[#4B5563] font-mono text-xs">
                  NO ENROLLMENTS
                </div>
              ) : (
                <div className="space-y-px max-h-80 overflow-y-auto">
                  {course.enrollments.map((enr, idx) => (
                    <div
                      key={enr.enrollmentId}
                      className={`data-row flex items-center justify-between px-3 py-2 ${
                        idx % 2 === 0 ? "bg-[#0D0D0D]" : "bg-[#111111]"
                      }`}
                    >
                      <Link
                        to={`/students/${enr.studentId}`}
                        className="flex items-center gap-2 flex-1"
                      >
                        <span className="text-xs text-white">
                          {enr.studentName} {enr.studentLastName}
                        </span>
                        <span className="font-mono text-[10px] text-[#4B5563]">
                          {enr.studentIdCode}
                        </span>
                      </Link>
                      <div className="flex items-center gap-2">
                        {enr.finalGrade && (
                          <span className={`font-mono text-xs ${
                            parseFloat(enr.finalGrade) >= 90 ? "text-emerald-400"
                            : parseFloat(enr.finalGrade) >= 70 ? "text-[#9CA3AF]"
                            : "text-red-400"
                          }`}>
                            {enr.finalGrade}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-mono status-${enr.status}`}>
                          {enr.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
