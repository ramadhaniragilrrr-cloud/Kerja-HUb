"use client";

import { useAuthStore } from "@/lib/store/useAuthStore";
import { useChatStore } from "@/lib/store/useChatStore";
import { useLMSStore } from "@/lib/store/useLMSStore";
import { useCalendarStore } from "@/lib/store/useCalendarStore";
import { useTaskStore } from "@/lib/store/useTaskStore";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MessageSquare, Calendar, CheckSquare, BookOpen, Clock, ArrowRight, Bell } from "lucide-react";
import { format } from "date-fns";

export default function HomePage() {
  const { user } = useAuthStore();
  const { chats, loadChats } = useChatStore();
  const { courses, assignments, loadCourses, loadCourseContent } = useLMSStore();
  const { events } = useCalendarStore();
  const { tasks } = useTaskStore();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      await Promise.all([
        loadChats(),
        loadCourses()
      ]);
      // Load content for courses to get assignments
      // Note: In a real large app this might be too heavy, but for MVP it's fine
      const courseIds = useLMSStore.getState().courses.map(c => c.id);
      await Promise.all(courseIds.map(id => loadCourseContent(id)));

      setIsLoading(false);
    };
    initDashboard();
  }, [loadChats, loadCourses, loadCourseContent]);

  // 1. Unread Chats (Simulated by recent chats for now as we don't have unread_count in DB yet)
  // We'll filter chats that have a lastMessage
  const recentChats = chats
    .filter(c => c.lastMessage)
    .slice(0, 3);

  // 2. Upcoming Assignments (Flatten and Sort)
  const allAssignments = Object.values(assignments).flat();
  const upcomingAssignments = allAssignments
    .filter(a => new Date(a.due_date).getTime() > Date.now())
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  // 3. Upcoming Events
  const upcomingEvents = events
    .filter(e => e.start > Date.now())
    .sort((a, b) => a.start - b.start)
    .slice(0, 3);

  // 4. Pending Tasks
  const pendingTasks = tasks
    .filter(t => !t.completed)
    .slice(0, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-slate-500 mt-1">Here is what's happening today.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {format(new Date(), "EEEE, d MMMM yyyy")}
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* 1. Chats Widget */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Recent Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
                {recentChats.length > 0 ? (
                  recentChats.map(chat => (
                    <div key={chat.id} className="flex items-center justify-between group cursor-pointer" onClick={() => router.push(`/messenger/${chat.id}`)}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {chat.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium truncate group-hover:text-blue-600 transition-colors">{chat.name}</p>
                          <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                        </div>
                      </div>
                      {/* Mock Unread Dot */}
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No recent messages.</p>
                )}
              </div>
              <Button variant="link" className="w-full mt-4 h-auto p-0 text-xs text-slate-500" onClick={() => router.push('/messenger')}>
                View all messages <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* 2. Tasks Widget */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-2">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full border border-slate-400 bg-transparent shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 line-through-none">{task.title}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No pending tasks. Great job!</p>
                )}
              </div>
              <Button variant="link" className="w-full mt-4 h-auto p-0 text-xs text-slate-500" onClick={() => router.push('/tasks')}>
                Go to Tasks <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* 3. Assignments Widget */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Upcoming Assignments</CardTitle>
              <BookOpen className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
                {upcomingAssignments.length > 0 ? (
                  upcomingAssignments.map(assign => (
                    <div key={assign.id} className="group cursor-pointer" onClick={() => router.push(`/lms/${assign.course_id}/assignments`)}>
                      <p className="text-sm font-medium group-hover:text-blue-600 transition-colors">{assign.title}</p>
                      <div className="flex items-center text-xs text-red-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Due {format(new Date(assign.due_date), "MMM d")}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No upcoming assignments.</p>
                )}
              </div>
              <Button variant="link" className="w-full mt-4 h-auto p-0 text-xs text-slate-500" onClick={() => router.push('/lms')}>
                View LMS <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* 4. Events Widget */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => (
                    <div key={event.id} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center bg-blue-50 dark:bg-blue-900/20 rounded p-1 min-w-[3rem]">
                        <span className="text-[10px] uppercase font-bold text-blue-600">{format(event.start, "MMM")}</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{format(event.start, "d")}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">{event.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{format(event.start, "h:mm a")}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No upcoming events.</p>
                )}
              </div>
              <Button variant="link" className="w-full mt-4 h-auto p-0 text-xs text-slate-500" onClick={() => router.push('/calendar')}>
                Open Calendar <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Quick Actions / Getting Started */}
        <div className="pt-8 border-t">
          <h2 className="text-lg font-semibold mb-4">Quick Shortcuts</h2>
          <div className="flex gap-4 flex-wrap">
            <Button variant="outline" onClick={() => router.push('/messenger')} className="gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" /> Start Chat
            </Button>
            <Button variant="outline" onClick={() => router.push('/tasks')} className="gap-2">
              <CheckSquare className="h-4 w-4 text-green-500" /> Create Task
            </Button>
            <Button variant="outline" onClick={() => router.push('/calendar')} className="gap-2">
              <Calendar className="h-4 w-4 text-purple-500" /> Schedule Event
            </Button>
            <Button variant="outline" onClick={() => router.push('/lms')} className="gap-2">
              <BookOpen className="h-4 w-4 text-orange-500" /> Browse Courses
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
