import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Favorite, User } from "@/entities/all";
import { 
  Play, 
  Pause, 
  Heart, 
  Share2, 
  Clock,
  Headphones,
  ExternalLink,
  Volume2
} from "lucide-react";
import { format } from "date-fns";

export default function ClipCard({ clip, episodes, index, onFavoriteChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const audioRef = useRef(null);
  
  const episode = episodes.find(e => e.id === clip.episode_id);

  const loadUserAndFavoriteStatus = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Check if this clip is favorited by current user
      const favorites = await Favorite.filter({ 
        clip_id: clip.id, 
        user_email: user.email 
      });
      setIsFavorited(favorites.length > 0);
    } catch (error) {
      // User not logged in or error
      console.log("User not authenticated or error loading favorites");
    }
  }, [clip.id]);
  
  useEffect(() => {
    loadUserAndFavoriteStatus();
  }, [loadUserAndFavoriteStatus]);
  
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // In a real app, we'd set the currentTime to clip.start_time
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFavorite = async () => {
    if (!currentUser) {
      alert("Please log in to favorite clips");
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        // Remove favorite
        const favorites = await Favorite.filter({ 
          clip_id: clip.id, 
          user_email: currentUser.email 
        });
        if (favorites.length > 0) {
          await Favorite.delete(favorites[0].id);
        }
        setIsFavorited(false);
      } else {
        // Add favorite
        await Favorite.create({
          clip_id: clip.id,
          user_email: currentUser.email
        });
        setIsFavorited(true);
      }
      
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      alert("Error updating favorite. Please try again.");
    }
    setIsLoading(false);
  };

  const handleShare = async () => {
    const shareText = `Check out this clip: "${clip.title}" from ${episode?.podcast_name || 'Unknown Podcast'}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?clip=${clip.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: clip.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
        alert("Share link copied to clipboard!");
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      alert("Share link copied to clipboard!");
    }
  };

  const handleViewOriginal = () => {
    if (episode?.audio_url) {
      window.open(episode.audio_url, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border border-violet-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* Hidden audio element for playback */}
        <audio 
          ref={audioRef}
          src={clip.audio_url}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Header with Podcast Info */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {episode?.cover_image_url ? (
                  <img 
                    src={episode.cover_image_url} 
                    alt={episode.podcast_name}
                    className="w-8 h-8 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center" style={{display: episode?.cover_image_url ? 'none' : 'flex'}}>
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {episode?.podcast_name || "Unknown Podcast"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {episode?.title || "Episode"}
                  </p>
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-2">
                {clip.title}
              </h3>
              
              {clip.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {clip.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Duration and timing */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(clip.duration || 0)}</span>
            </div>
            <span>•</span>
            <span>
              {formatDuration(clip.start_time)} - {formatDuration(clip.end_time)}
            </span>
          </div>

          {/* Tags */}
          {clip.tags && clip.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {clip.tags.slice(0, 3).map((tag, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="bg-violet-100 text-violet-700 hover:bg-violet-200 text-xs"
                >
                  #{tag}
                </Badge>
              ))}
              {clip.tags.length > 3 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                  +{clip.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlay}
              className="flex-1 mr-2 hover:bg-violet-50 border-violet-200"
              disabled={!clip.audio_url}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              disabled={isLoading}
              className={`mx-1 ${isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="mx-1 text-gray-400 hover:text-blue-500"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewOriginal}
              className="ml-1 text-gray-400 hover:text-violet-600"
              disabled={!episode?.audio_url}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-violet-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {clip.favorite_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                {clip.share_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                {clip.created_by ? 'Clipped by user' : 'Community clip'}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {format(new Date(clip.created_date), "MMM d, yyyy")}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}