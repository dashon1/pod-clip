import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Star, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";
import ClipCard from "../components/dashboard/ClipCard";

export default function TrendingPage() {
  const [trendingClips, setTrendingClips] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("today");

  useEffect(() => {
    loadTrending();
  }, [timeRange]);

  const loadTrending = async () => {
    setIsLoading(true);
    try {
      const [clips, eps] = await Promise.all([
        base44.entities.Clip.list("-created_date", 100),
        base44.entities.Episode.list("-created_date")
      ]);

      // Sort by engagement (favorites + shares)
      const sorted = clips.sort((a, b) => {
        const scoreA = (a.favorite_count || 0) + (a.share_count || 0) * 2;
        const scoreB = (b.favorite_count || 0) + (b.share_count || 0) * 2;
        return scoreB - scoreA;
      });

      setTrendingClips(sorted);
      setEpisodes(eps);

      // Calculate top creators
      const creatorStats = {};
      clips.forEach(clip => {
        const creator = clip.created_by || "unknown";
        if (!creatorStats[creator]) {
          creatorStats[creator] = { clips: 0, totalFavorites: 0, totalShares: 0 };
        }
        creatorStats[creator].clips++;
        creatorStats[creator].totalFavorites += (clip.favorite_count || 0);
        creatorStats[creator].totalShares += (clip.share_count || 0);
      });

      const creators = Object.entries(creatorStats)
        .map(([email, stats]) => ({ email, ...stats }))
        .sort((a, b) => (b.totalFavorites + b.totalShares) - (a.totalFavorites + a.totalShares))
        .slice(0, 10);

      setTopCreators(creators);
    } catch (error) {
      console.error("Error loading trending:", error);
    }
    setIsLoading(false);
  };

  const filterByTimeRange = (clips) => {
    const now = new Date();
    return clips.filter(clip => {
      const clipDate = new Date(clip.created_date);
      const hoursDiff = (now - clipDate) / (1000 * 60 * 60);
      
      if (timeRange === "today") return hoursDiff <= 24;
      if (timeRange === "week") return hoursDiff <= 168;
      if (timeRange === "month") return hoursDiff <= 720;
      return true;
    });
  };

  const filteredClips = filterByTimeRange(trendingClips);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Flame className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-black mb-4">Trending Now</h1>
            <p className="text-xl text-orange-100">Discover the hottest clips everyone's talking about</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8 justify-center">
          <button
            onClick={() => setTimeRange("today")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              timeRange === "today" 
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Today
          </button>
          <button
            onClick={() => setTimeRange("week")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              timeRange === "week" 
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              timeRange === "month" 
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange("all")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              timeRange === "all" 
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Time
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Trending Clips */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              Trending Clips
            </h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Card>
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredClips.slice(0, 12).map((clip, index) => (
                  <div key={clip.id} className="relative">
                    {index < 3 && (
                      <Badge className="absolute -top-2 -left-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        #{index + 1}
                      </Badge>
                    )}
                    <ClipCard 
                      clip={clip} 
                      episodes={episodes}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Top Creators */}
          <div>
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Top Creators
                </h3>
                <div className="space-y-3">
                  {topCreators.map((creator, index) => (
                    <motion.div
                      key={creator.email}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className={`font-bold text-lg ${index < 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                        #{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{creator.email}</p>
                        <p className="text-xs text-gray-600">{creator.clips} clips</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-violet-600">{creator.totalFavorites}</p>
                        <p className="text-xs text-gray-600">favorites</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}