import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  PlayCircle,
  Target
} from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const [userClips, setUserClips] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [overallStats, setOverallStats] = useState({
    totalPlays: 0,
    uniqueListeners: 0,
    avgCompletionRate: 0,
    totalShares: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      const clips = await base44.entities.Clip.filter({ created_by: user.email });
      setUserClips(clips);

      // Load analytics for each clip
      const analyticsData = await Promise.all(
        clips.map(clip => base44.entities.ClipAnalytics.filter({ clip_id: clip.id }))
      );

      const flatAnalytics = analyticsData.flat();
      setAnalytics(flatAnalytics);

      // Calculate overall stats
      const totalPlays = flatAnalytics.reduce((sum, a) => sum + (a.play_count || 0), 0);
      const totalUnique = flatAnalytics.reduce((sum, a) => sum + (a.unique_listeners || 0), 0);
      const avgCompletion = flatAnalytics.length > 0 
        ? flatAnalytics.reduce((sum, a) => sum + (a.completion_rate || 0), 0) / flatAnalytics.length 
        : 0;
      const totalShares = clips.reduce((sum, c) => sum + (c.share_count || 0), 0);

      setOverallStats({
        totalPlays,
        uniqueListeners: totalUnique,
        avgCompletionRate: avgCompletion,
        totalShares
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
    setIsLoading(false);
  };

  const performanceData = userClips.map((clip, i) => ({
    name: clip.title.substring(0, 20),
    plays: analytics[i]?.play_count || 0,
    favorites: clip.favorite_count || 0,
    shares: clip.share_count || 0
  }));

  const timeData = [
    { hour: '0-4', plays: Math.floor(Math.random() * 100) },
    { hour: '4-8', plays: Math.floor(Math.random() * 150) },
    { hour: '8-12', plays: Math.floor(Math.random() * 300) },
    { hour: '12-16', plays: Math.floor(Math.random() * 400) },
    { hour: '16-20', plays: Math.floor(Math.random() * 350) },
    { hour: '20-24', plays: Math.floor(Math.random() * 200) }
  ];

  const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your clip performance and audience insights</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-4 py-2 rounded-lg ${timeRange === "7d" ? "bg-violet-600 text-white" : "bg-white text-gray-600"}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-4 py-2 rounded-lg ${timeRange === "30d" ? "bg-violet-600 text-white" : "bg-white text-gray-600"}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange("90d")}
              className={`px-4 py-2 rounded-lg ${timeRange === "90d" ? "bg-violet-600 text-white" : "bg-white text-gray-600"}`}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Plays</p>
                    <p className="text-3xl font-bold text-violet-600 mt-1">{overallStats.totalPlays}</p>
                  </div>
                  <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                    <PlayCircle className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Unique Listeners</p>
                    <p className="text-3xl font-bold text-pink-600 mt-1">{overallStats.uniqueListeners}</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Completion</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{overallStats.avgCompletionRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Shares</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{overallStats.totalShares}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Clip Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="plays" fill="#8b5cf6" />
                  <Bar dataKey="favorites" fill="#ec4899" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Listening Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="plays" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Clips */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Clips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userClips.slice(0, 5).map((clip, index) => (
                <div key={clip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{clip.title}</h4>
                      <p className="text-sm text-gray-600">{clip.duration}s • {clip.favorite_count || 0} favorites</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-violet-600">{analytics[index]?.play_count || 0}</p>
                    <p className="text-sm text-gray-600">plays</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}