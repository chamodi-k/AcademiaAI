import { Request, Response } from 'express';
import { db } from '../models/dbAdapter.js';

export class DashboardController {
  static async getDashboardSummary(req: Request, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        res.status(404).json({ success: false, message: 'Student profile not found.' });
        return;
      }

      const student = db.getStudentById(studentId);
      const subjects = db.getSubjects(studentId);
      const timetable = db.getTimetable(studentId);
      const assignments = db.getAssignments(studentId);
      const exams = db.getExams(studentId);
      const attendance = db.getAttendance(studentId);
      const grades = db.getGrades(studentId);
      const studyPlans = db.getStudyPlans(studentId);
      const quizzes = db.getQuizzes(studentId);

      // 1. Determine Today's Classes
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayDayName = days[new Date().getDay()];
      const todaysClasses = timetable
        .filter(t => t.day_of_week === todayDayName)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

      // 2. Upcoming Assignments (status !== 'Completed')
      const now = new Date().getTime();
      const upcomingAssignments = assignments
        .filter(a => a.status !== 'Completed')
        .map(a => {
          const diffMs = new Date(a.due_date).getTime() - now;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          return {
            ...a,
            daysRemaining: diffDays,
            isOverdue: diffDays < 0,
            isDueToday: diffDays === 0
          };
        })
        .slice(0, 5);

      // 3. Upcoming Exams with Live Countdown Info
      const upcomingExams = exams
        .filter(e => e.status === 'Upcoming' && new Date(e.exam_date).getTime() > now)
        .map(e => {
          const diffMs = new Date(e.exam_date).getTime() - now;
          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          return {
            ...e,
            daysRemaining: days,
            hoursRemaining: hours,
            countdownLabel: `${days}d ${hours}h remaining`
          };
        })
        .slice(0, 4);

      // 4. Overall Attendance Percentage & Status
      let totalClassesAll = 0;
      let attendedClassesAll = 0;
      attendance.forEach(a => {
        totalClassesAll += a.total_classes;
        attendedClassesAll += a.attended_classes;
      });
      const overallAttendancePct = totalClassesAll > 0 
        ? Math.round((attendedClassesAll / totalClassesAll) * 100 * 10) / 10 
        : 100;
      
      const attendanceRisk = overallAttendancePct >= 80 ? 'Safe' : overallAttendancePct >= 75 ? 'Warning' : 'Critical';

      // 5. GPA Calculation (Semester GPA and Overall GPA)
      let totalQualityPoints = 0;
      let totalCredits = 0;
      let currentSemesterPoints = 0;
      let currentSemesterCredits = 0;

      const currentSemNum = student?.current_semester || 1;

      grades.forEach(g => {
        totalQualityPoints += g.grade_point * g.credits;
        totalCredits += g.credits;
        if (g.semester === currentSemNum) {
          currentSemesterPoints += g.grade_point * g.credits;
          currentSemesterCredits += g.credits;
        }
      });

      const overallGPA = totalCredits > 0 ? Math.round((totalQualityPoints / totalCredits) * 100) / 100 : 3.50;
      const semesterGPA = currentSemesterCredits > 0 ? Math.round((currentSemesterPoints / currentSemesterCredits) * 100) / 100 : overallGPA;

      // 6. Today's AI Study Plan Tasks
      const activePlan = studyPlans.find(p => p.status === 'ACTIVE') || studyPlans[0];
      let todayAiTasks: any[] = [];
      if (activePlan && activePlan.plan_data?.weekly_schedule) {
        const todaySchedule = activePlan.plan_data.weekly_schedule.find(
          s => s.day_name.toLowerCase() === todayDayName.toLowerCase()
        ) || activePlan.plan_data.weekly_schedule[0];
        
        if (todaySchedule) {
          todayAiTasks = todaySchedule.tasks.map(t => ({
            ...t,
            planId: activePlan.id
          }));
        }
      }

      // 7. Weekly Study Hours Breakdown (analytics mock/history)
      const weeklyStudyHours = [
        { day: 'Mon', hours: 3.5, target: 3.0 },
        { day: 'Tue', hours: 2.5, target: 3.0 },
        { day: 'Wed', hours: 4.0, target: 3.0 },
        { day: 'Thu', hours: 2.0, target: 3.0 },
        { day: 'Fri', hours: 3.0, target: 3.0 },
        { day: 'Sat', hours: 5.0, target: 4.0 },
        { day: 'Sun', hours: 4.5, target: 4.0 }
      ];

      res.json({
        success: true,
        data: {
          student,
          todayDayName,
          todaysClasses,
          upcomingAssignments,
          upcomingExams,
          attendance: {
            overallPercentage: overallAttendancePct,
            status: attendanceRisk,
            subjectBreakdown: attendance
          },
          gpa: {
            overallGPA,
            semesterGPA,
            targetGPA: student?.target_gpa || 3.80,
            totalCredits
          },
          aiStudyPlan: {
            planId: activePlan?.id,
            planTitle: activePlan?.title,
            todayTasks: todayAiTasks
          },
          weeklyStudyHours,
          quickCounts: {
            subjectsCount: subjects.length,
            pendingAssignmentsCount: upcomingAssignments.length,
            upcomingExamsCount: upcomingExams.length,
            quizzesCompletedCount: quizzes.filter(q => q.completed).length
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to build dashboard payload.', error: err.message });
    }
  }
}
