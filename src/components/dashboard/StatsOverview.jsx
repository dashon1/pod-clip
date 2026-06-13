import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Scissors, Headphones, Heart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const StatCard = ({ icon: Icon, title, value, subtitle, gradient, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Card className="bg-white/80 backdrop-blur-sm border border-violet-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${gradient} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${gradient.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function StatsOverview({ clips, episodes }) {
  const totalFavorites = clips.reduce((sum, clip) => sum + (clip.favorite_count || 0), 0);
  const totalShares = clips.reduce((sum, clip) => sum + (clip.share_count || 0), 0);
  const totalDuration = clips.reduce((sum, clip) => sum + (clip.duration || 0), 0);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const stats = [
    {
      icon: Scissors,
      title: "Total Clips",
      value: clips.length,
      subtitle: `${formatDuration(totalDuration)} of content`,
      gradient: "bg-violet-500"
    },
    {
      icon: Headphones,
      title: "Episodes",
      value: episodes.length,
      subtitle: "Available for clipping",
      gradient: "bg-blue-500"
    },
    {
      icon: Heart,
      title: "Total Favorites",
      value: totalFavorites,
      subtitle: "Community favorites",
      gradient: "bg-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Shares",
      value: totalShares,
      subtitle: "Times shared",
      gradient: "bg-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  );
}