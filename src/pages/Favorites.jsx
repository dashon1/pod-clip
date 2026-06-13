import React, { useState, useEffect } from "react";
import { Clip, Episode, Favorite, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, Plus, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

import ClipCard from "../components/dashboard/ClipCard";

export default function FavoritesPage() {
  const [favoriteClips, setFavoriteClips] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      let currentUser;
      try {
        currentUser = await User.me();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (authError) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // Get episodes first
      const episodesData = await Episode.list("-created_date");
      setEpisodes(episodesData);
      
      // Get user's favorites
      const favorites = await Favorite.filter({ user_email: currentUser.email });
      
      if (favorites.length === 0) {
        setFavoriteClips([]);
        setIsLoading(false);
        return;
      }
      
      const favoriteClipIds = favorites.map(f => f.clip_id);
      
      // Get all clips and filter favorites
      const allClips = await Clip.list("-created_date");
      const userFavoriteClips = allClips.filter(clip => favoriteClipIds.includes(clip.id));
      
      setFavoriteClips(userFavoriteClips);
    } catch (error) {
      console.error("Error loading favorites:", error);
      setError("Failed to load your favorites. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handleFavoriteChange = () => {
    // Reload favorites when a clip is favorited/unfavorited
    loadFavorites();
  };

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.href);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-violet-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-pink-200" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4">
                  Your Favorite Clips
                </h1>
                <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
                  Sign in to save and access all your favorite podcast moments
                </p>
                <Button
                  onClick={handleLogin}
                  size="lg"
                  className="bg-white text-violet-900 hover:bg-violet-50 shadow-xl"
                >
                  Sign In to Continue
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-violet-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-pink-200" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                Your Favorite Clips
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                All the podcast moments you've loved and saved for later
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadFavorites}
                className="ml-4 border-white hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-violet-200/50">
                  <div className="h-4 bg-violet-200 rounded mb-4"></div>
                  <div className="h-3 bg-violet-100 rounded mb-2"></div>
                  <div className="h-3 bg-violet-100 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favoriteClips.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {favoriteClips.length} Favorite Clip{favoriteClips.length !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-gray-600">Your curated collection of amazing podcast moments</p>
                </div>
                <Button
                  onClick={loadFavorites}
                  variant="outline"
                  className="hover:bg-violet-50 border-violet-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {favoriteClips.map((clip, index) => (
                <ClipCard 
                  key={clip.id} 
                  clip={clip} 
                  episodes={episodes}
                  index={index}
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-16 h-16 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No favorites yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start exploring clips and hit the heart button to save your favorite podcast moments.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={createPageUrl("Dashboard")}>
                <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Discover Clips
                </Button>
              </Link>
              <Link to={createPageUrl("CreateClip")}>
                <Button variant="outline" className="border-violet-200 hover:bg-violet-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Clip
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}