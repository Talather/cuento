import { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line } from "recharts";
import { Loader2 } from "lucide-react";
import { subDays, startOfDay, endOfDay, format, eachDayOfInterval } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopCountriesCard } from "@/components/admin/TopCountriesCard";

// Lazy load the AdminUsersTable to avoid fetching users on initial load
const AdminUsersTable = lazy(() => import("@/components/admin/AdminUsersTable").then(m => ({ default: m.AdminUsersTable })));

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("analytics");

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const now = new Date();
      const today = startOfDay(now);
      const tomorrow = endOfDay(now);
      const yesterday = startOfDay(subDays(now, 1));
      const yesterdayEnd = endOfDay(subDays(now, 1));
      const weekAgo = startOfDay(subDays(now, 7));

      // Get total counts
      const { count: totalStories } = await supabase
        .from("stories")
        .select("*", { count: "exact", head: true });

      const { count: totalLikes } = await supabase
        .from("story_likes")
        .select("*", { count: "exact", head: true });

      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get today's stories count
      const { count: todayStories } = await supabase
        .from("stories")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString())
        .lte("created_at", tomorrow.toISOString());

      // Get yesterday's stories count
      const { count: yesterdayStories } = await supabase
        .from("stories")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString())
        .lte("created_at", yesterdayEnd.toISOString());

      // Get today's new users count
      const { count: todayUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString())
        .lte("created_at", tomorrow.toISOString());

      // Get yesterday's new users count
      const { count: yesterdayUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString())
        .lte("created_at", yesterdayEnd.toISOString());

      // Get most active registered users in the last week
      const { data: activeUsers } = await supabase
        .from("stories")
        .select(`
          user_id,
          profiles!inner (
            id,
            first_name,
            last_name,
            wordpress_user_id
          )
        `)
        .not("user_id", "is", null)
        .gte("created_at", weekAgo.toISOString());

      // Count stories per user
      const userStoryCount = activeUsers?.reduce((acc, story) => {
        const userId = story.user_id;
        if (userId) {
          acc[userId] = (acc[userId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Process active users data
      const processedActiveUsers = Object.entries(userStoryCount || {})
        .map(([userId, count]) => {
          const user = activeUsers?.find((u) => u.user_id === userId);
          return {
            id: userId,
            name: `${user?.profiles?.first_name || ""} ${
              user?.profiles?.last_name || ""
            }`.trim(),
            wordpressId: user?.profiles?.wordpress_user_id,
            stories: count,
          };
        })
        .sort((a, b) => b.stories - a.stories)
        .slice(0, 10);

      const { data: todayHourlyStories } = await supabase
        .from("stories")
        .select("created_at")
        .gte("created_at", today.toISOString())
        .lte("created_at", tomorrow.toISOString());

      const { data: yesterdayHourlyStories } = await supabase
        .from("stories")
        .select("created_at")
        .gte("created_at", yesterday.toISOString())
        .lte("created_at", yesterdayEnd.toISOString());

      // Process hourly data
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour: format(new Date().setHours(hour, 0, 0, 0), 'HH:mm'),
        Today: 0,
        Yesterday: 0
      }));

      todayHourlyStories?.forEach((story) => {
        const storyDate = toZonedTime(new Date(story.created_at), "America/Sao_Paulo");
        const hour = storyDate.getHours();
        hourlyData[hour].Today++;
      });

      yesterdayHourlyStories?.forEach((story) => {
        const storyDate = toZonedTime(new Date(story.created_at), "America/Sao_Paulo");
        const hour = storyDate.getHours();
        hourlyData[hour].Yesterday++;
      });

      // Get daily stories data for the past week
      const dailyRange = eachDayOfInterval({ start: weekAgo, end: now });
      const dailyData = await Promise.all(
        dailyRange.map(async (date) => {
          const startOfDayDate = startOfDay(date);
          const endOfDayDate = endOfDay(date);
          
          const { count } = await supabase
            .from("stories")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfDayDate.toISOString())
            .lte("created_at", endOfDayDate.toISOString());

          return {
            date: format(date, 'MMM dd'),
            Stories: count || 0
          };
        })
      );

      return {
        activeUsers: processedActiveUsers,
        totals: {
          stories: totalStories || 0,
          likes: totalLikes || 0,
          users: totalUsers || 0,
          todayStories: todayStories || 0,
          yesterdayStories: yesterdayStories || 0,
          todayUsers: todayUsers || 0,
          yesterdayUsers: yesterdayUsers || 0,
        },
        hourlyActivity: hourlyData,
        dailyActivity: dailyData,
      };
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          {activeTab === "users" && (
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            }>
              <AdminUsersTable />
            </Suspense>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{formatNumber(stats?.totals.stories || 0)}</p>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <div>Today: {stats?.totals.todayStories}</div>
                  <div>Yesterday: {stats?.totals.yesterdayStories}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Likes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{formatNumber(stats?.totals.likes || 0)}</p>
                <div className="text-sm text-muted-foreground mt-2">
                  <span>Engagement rate: {((stats?.totals.likes || 0) / (stats?.totals.stories || 1) * 100).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{formatNumber(stats?.totals.users || 0)}</p>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <div>Today: {stats?.totals.todayUsers}</div>
                  <div>Yesterday: {stats?.totals.yesterdayUsers}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Story Creation (GMT-3)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      Today: {
                        theme: {
                          light: "#10B981",
                          dark: "#10B981",
                        },
                      },
                      Yesterday: {
                        theme: {
                          light: "#FCD34D",
                          dark: "#FCD34D",
                        },
                      },
                    }}
                  >
                    <BarChart 
                      data={stats?.hourlyActivity} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <XAxis 
                        dataKey="hour"
                        interval={2}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        width={30}
                      />
                      <ChartTooltip />
                      <Bar 
                        dataKey="Today" 
                        fill="var(--color-Today)"
                        radius={[4, 4, 0, 0]} 
                        barSize={8}
                      />
                      <Bar 
                        dataKey="Yesterday" 
                        fill="var(--color-Yesterday)"
                        radius={[4, 4, 0, 0]} 
                        barSize={8}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Stories (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      Stories: {
                        theme: {
                          light: "#10B981",
                          dark: "#10B981",
                        },
                      },
                    }}
                  >
                    <LineChart
                      data={stats?.dailyActivity}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        width={30}
                      />
                      <ChartTooltip />
                      <Line
                        type="monotone"
                        dataKey="Stories"
                        stroke="var(--color-Stories)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-Stories)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TopCountriesCard title="Total Users by Country" functionName="get-top-countries" />
            <TopCountriesCard title="New Users by Country (Last 7 Days)" functionName="get-top-countries-last-week" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
