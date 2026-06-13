import React, { useState, useEffect } from "react";
import { Clip, Episode } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Clock, 
  TrendingUp,
  Plus,
  RefreshCw,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

import HeroSection from "../components/dashboard/HeroSection";
import ClipCard from "../components/dashboard/ClipCard";
import StatsOverview from "../components/dashboard/StatsOverview";

export default function Dashboard() {
  const [clips, setClips] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clipsData, episodesData] = await Promise.all([
        Clip.list("-created_date", 50),
        Episode.list("-created_date", 20)
      ]);
      setClips(clipsData);
      setEpisodes(episodesData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filteredClips = clips.filter(clip => {
    // Apply search filter
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const episode = episodes.find(e => e.id === clip.episode_id);
      matchesSearch = 
        clip.title.toLowerCase().includes(query) ||
        clip.description?.toLowerCase().includes(query) ||
        episode?.podcast_name.toLowerCase().includes(query) ||
        episode?.title.toLowerCase().includes(query) ||
        clip.tags?.some(tag => tag.toLowerCase().includes(query));
    }

    // Apply category filter
    let matchesFilter = true;
    if (filter === "popular") {
      matchesFilter = (clip.favorite_count || 0) > 0 || (clip.share_count || 0) > 0;
    } else if (filter === "recent") {
      matchesFilter = true; // Already sorted by recent
    }

    return matchesSearch && matchesFilter;
  });

  const handleFavoriteChange = () => {
    // Reload data when favorites change to update counts
    loadData();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Overview */}
        <StatsOverview clips={clips} episodes={episodes} />

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Discover Clips</h2>
            
            {/* Filter Tabs */}
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-violet-200/50">
              <Button
                variant={filter === "recent" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("recent")}
                className={filter === "recent" 
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md" 
                  : "hover:bg-violet-50"
                }
              >
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </Button>
              <Button
                variant={filter === "popular" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("popular")}
                className={filter === "popular" 
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md" 
                  : "hover:bg-violet-50"
                }
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Popular
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search clips, podcasts, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-violet-200 focus:border-violet-400"
              />
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              disabled={isLoading}
              className="hover:bg-violet-50 border-violet-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* Upload Button */}
            <Link to={createPageUrl("Upload")}>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                Upload Episode
              </Button>
            </Link>
          </div>
        </div>

        {/* Results Info */}
        {(searchQuery || filter !== "recent") && (
          <div className="mb-6 text-sm text-gray-600 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>
              Showing {filteredClips.length} clip{filteredClips.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
              {filter === "popular" && " (popular)"}
            </span>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="text-violet-600 hover:text-violet-700 h-auto p-1"
              >
                Clear search
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-200/50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-violet-200 rounded-lg"></div>
                    <div className="space-y-1">
                      <div className="h-3 bg-violet-200 rounded w-24"></div>
                      <div className="h-2 bg-violet-100 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-violet-200 rounded mb-3"></div>
                  <div className="h-3 bg-violet-100 rounded mb-2"></div>
                  <div className="h-3 bg-violet-100 rounded w-2/3 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-violet-100 rounded-full w-16"></div>
                    <div className="h-6 bg-violet-100 rounded-full w-20"></div>
                  </div>
                  <div className="h-8 bg-violet-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredClips.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              {filteredClips.map((clip, index) => (
                <ClipCard 
                  key={clip.id} 
                  clip={clip} 
                  episodes={episodes}
                  index={index}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : searchQuery ? (
          // No search results
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clips found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any clips matching "{searchQuery}". Try different keywords or browse all clips.
            </p>
            <Button
              onClick={() => setSearchQuery("")}
              variant="outline"
              className="border-violet-200 hover:bg-violet-50"
            >
              Clear search and browse all clips
            </Button>
          </motion.div>
        ) : (
          // No clips at all
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-violet-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clips yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start by uploading a podcast episode and creating your first clip to share with the community.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={createPageUrl("Upload")}>
                <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Episode
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Last Updated */}
        {lastUpdated && !isLoading && (
          <div className="text-center mt-12 text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}