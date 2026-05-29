import { trpc } from "@/providers/trpc";
import { TerminalDecode } from "@/components/effects/TerminalDecode";
import { RollingDigitRoulette } from "@/components/effects/RollingDigitRoulette";
import { Users, BookOpen, GraduationCap, TrendingUp, Activity } from "lucide-react";

export default function Dashboard() {
  const { data, isLoading } = trpc.analytics.dashboard.useQuery();

  return (
    <div className="p-6 space-y-6">
      {/* Hero: System Status */}
      <div className="border border-[#E5E7EB] bg-[#0D0D0D] p-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-mono text-3xl font-bold text-white tracking-tight">
            <TerminalDecode text="NEXUS RECORDS SYSTEM" duration={1.5} />
          </h1>
          <span className="w-3 h-6 bg-white cursor-blink" />
        </div>
        <p className="font-mono text-xs text-[#4B5563] uppercase tracking-widest">
          Enrollment Window: <span className="text-emerald-400">ACTIVE</span>
          {" | "}
          Secure Connection: <span className="text-blue-400">MYSQL-Drizzle</span>
          {" | "}
          Transaction Engine: <span className="text-cyan-400">ONLINE</span>
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#2A2A2A]">
        <MetricCard
          label="TOTAL STUDENTS"
          value={data?.totalStudents ?? 0}
          active={data?.activeStudents ?? 0}
          icon={Users}
          color="text-blue-400"
          isLoading={isLoading}
        />
        <MetricCard
          label="TOTAL COURSES"
          value={data?.totalCourses ?? 0}
          icon={BookOpen}
          color="text-cyan-400"
          isLoading={isLoading}
        />
        <MetricCard
          label="AVG GPA"
          value={data?.avgGpa ?? "0.00"}
          icon={TrendingUp}
          color="text-emerald-400"
          isLoading={isLoading}
          isDecimal
        />
        <MetricCard
          label="ACTIVE ENROLLMENTS"
          value={data?.enrolledCount ?? 0}
          icon={GraduationCap}
          color="text-yellow-400"
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[#2A2A2A]">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 bg-[#0D0D0D] p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-[#9CA3AF]">
              Recent Activity Log
            </h2>
            <Activity className="w-3 h-3 text-[#4B5563]" />
          </div>
          <div className="space-y-px">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-8 bg-[#1A1A1A] animate-pulse" />
              ))
            ) : data?.recentEnrollments.length === 0 ? (
              <div className="text-center py-8 text-[#4B5563] font-mono text-xs">
                NO RECENT ACTIVITY
              </div>
            ) : (
              data?.recentEnrollments.map((enr) => (
                <div
                  key={enr.enrollmentId}
                  className="data-row flex items-center justify-between px-3 py-2 bg-[#0D0D0D] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#4B5563]">
                      {enr.enrollmentDate ? new Date(enr.enrollmentDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "--:--"}
                    </span>
                    <span className="text-white">
                      {enr.studentName} {enr.studentLastName}
                    </span>
                    <span className="text-[#4B5563]">{"->"}</span>
                    <span className="font-mono text-blue-400">{enr.courseCode}</span>
                    <span className="text-[#4B5563]">{enr.courseTitle}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono ${
                      enr.status === "enrolled"
                        ? "status-enrolled"
                        : enr.status === "completed"
                        ? "status-completed"
                        : "status-dropped"
                    }`}
                  >
                    {enr.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-[#0D0D0D] p-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#9CA3AF] mb-4">
            Top Enrolled Courses
          </h2>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-[#1A1A1A] animate-pulse" />
              ))
            ) : (
              data?.topCourses.map((course, idx) => (
                <div key={idx} className="bg-[#1A1A1A] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-white">
                      {course.course_code}
                    </span>
                    <span className="font-mono text-xs text-[#4B5563]">
                      {course.current_enrollment}/{course.max_capacity}
                    </span>
                  </div>
                  <div className="text-xs text-[#4B5563] mb-2">{course.title}</div>
                  <div className="w-full h-1 bg-[#2A2A2A]">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (course.current_enrollment / course.max_capacity) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Enrollment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#2A2A2A]">
        <div className="bg-[#0D0D0D] p-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#9CA3AF] mb-4">
            Students by Major
          </h2>
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 bg-[#1A1A1A] animate-pulse" />
              ))
            ) : (
              data?.studentsByMajor.map((item, idx) => {
                const max = Math.max(...(data?.studentsByMajor.map((s) => s.count) || [1]));
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#9CA3AF] w-8">
                      {item.major}
                    </span>
                    <div className="flex-1 h-4 bg-[#1A1A1A]">
                      <div
                        className="h-full bg-blue-500/30"
                        style={{ width: `${(item.count / max) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-white w-6 text-right">
                      {item.count}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-[#0D0D0D] p-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#9CA3AF] mb-4">
            Enrollment Distribution
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <StatBlock
              label="ENROLLED"
              value={data?.enrolledCount ?? 0}
              color="text-blue-400"
              isLoading={isLoading}
            />
            <StatBlock
              label="COMPLETED"
              value={data?.completedCount ?? 0}
              color="text-emerald-400"
              isLoading={isLoading}
            />
            <StatBlock
              label="DROPPED"
              value={data?.droppedCount ?? 0}
              color="text-red-400"
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  active,
  icon: Icon,
  color,
  isLoading,
  isDecimal,
}: {
  label: string;
  value: string | number;
  active?: number;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
  isDecimal?: boolean;
}) {
  return (
    <div className="bg-[#0D0D0D] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#4B5563]">
          {label}
        </span>
        <Icon className={`w-3 h-3 ${color}`} />
      </div>
      <div className={`text-3xl font-mono font-bold ${color}`}>
        {isLoading ? (
          <span className="text-[#2A2A2A]">---</span>
        ) : isDecimal ? (
          <RollingDigitRoulette value={value} delay={200} className="text-3xl" />
        ) : (
          <RollingDigitRoulette value={value} delay={200} className="text-3xl" />
        )}
      </div>
      {active !== undefined && (
        <div className="mt-2 text-[10px] font-mono text-[#4B5563]">
          ACTIVE: <span className="text-emerald-400">{active}</span>
        </div>
      )}
    </div>
  );
}

function StatBlock({
  label,
  value,
  color,
  isLoading,
}: {
  label: string;
  value: number;
  color: string;
  isLoading: boolean;
}) {
  return (
    <div className="bg-[#1A1A1A] p-4 text-center">
      <div className={`text-2xl font-mono font-bold ${color} mb-1`}>
        {isLoading ? "---" : <RollingDigitRoulette value={value} delay={300} />}
      </div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-[#4B5563]">
        {label}
      </div>
    </div>
  );
}
