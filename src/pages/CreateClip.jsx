import React, { useState, useEffect, useRef } from "react";
import { Clip, Episode } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Scissors, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function CreateClipPage() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [clipData, setClipData] = useState({
    title: "",
    description: "",
    start_time: 0,
    end_time: 30,
    tags: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEpisodes();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const onEnded = () => setIsPlaying(false);
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
      };
    }
  }, [selectedEpisode]);

  const loadEpisodes = async () => {
    setIsLoading(true);
    try {
      const data = await Episode.list("-created_date");
      setEpisodes(data);
      if (data.length === 0) {
        setError("No episodes found. Please upload an episode first.");
      }
    } catch (error) {
      setError("Error loading episodes. Please try again.");
    }
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setClipData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleEpisodeSelect = (episodeId) => {
    const episode = episodes.find(e => e.id === episodeId);
    setSelectedEpisode(episode);
    setCurrentTime(0);
    setIsPlaying(false);
    
    // Reset clip times when selecting new episode
    setClipData(prev => ({
      ...prev,
      start_time: 0,
      end_time: Math.min(30, episode?.duration || 30)
    }));
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setClipStart = () => {
    const newStartTime = Math.floor(currentTime);
    setClipData(prev => ({
      ...prev,
      start_time: newStartTime,
      end_time: Math.max(prev.end_time, newStartTime + 10) // Ensure end is after start
    }));
  };

  const setClipEnd = () => {
    const newEndTime = Math.floor(currentTime);
    setClipData(prev => ({
      ...prev,
      end_time: newEndTime,
      start_time: Math.min(prev.start_time, newEndTime - 10) // Ensure start is before end
    }));
  };

  const previewClip = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = clipData.start_time;
      audioRef.current.play();
      
      // Stop at end time
      const checkTime = () => {
        if (audioRef.current.currentTime >= clipData.end_time) {
          audioRef.current.pause();
          audioRef.current.currentTime = clipData.start_time;
        } else if (isPlaying) {
          requestAnimationFrame(checkTime);
        }
      };
      requestAnimationFrame(checkTime);
    }
  };

  const validateClip = () => {
    if (!selectedEpisode) {
      setError("Please select an episode");
      return false;
    }
    if (!clipData.title.trim()) {
      setError("Please enter a clip title");
      return false;
    }
    if (clipData.start_time >= clipData.end_time) {
      setError("End time must be after start time");
      return false;
    }
    if (clipData.end_time - clipData.start_time < 5) {
      setError("Clip must be at least 5 seconds long");
      return false;
    }
    if (clipData.end_time - clipData.start_time > 300) {
      setError("Clips cannot be longer than 5 minutes");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateClip()) {
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const tags = clipData.tags ? 
        clipData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : 
        [];
      
      const newClip = await Clip.create({
        ...clipData,
        episode_id: selectedEpisode.id,
        duration: clipData.end_time - clipData.start_time,
        tags,
        audio_url: selectedEpisode.audio_url // In a real app, this would be the clipped audio
      });

      setSuccess(`Clip "${clipData.title}" created successfully!`);
      
      // Reset form
      setClipData({
        title: "",
        description: "",
        start_time: 0,
        end_time: 30,
        tags: ""
      });

      // Redirect after success
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);

    } catch (error) {
      setError("Error creating clip. Please try again.");
      console.error("Create clip error:", error);
    }

    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-violet-50 border-violet-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Clip</h1>
            <p className="text-gray-600 mt-1">Extract your favorite moments from podcast episodes</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {episodes.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border border-violet-200/50 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Episodes Found</h3>
              <p className="text-gray-600 mb-6">You need to upload a podcast episode before creating clips.</p>
              <Button
                onClick={() => navigate(createPageUrl("Upload"))}
                className="bg-gradient-to-r from-violet-500 to-purple-600"
              >
                Upload Episode First
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Audio Player & Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Audio Player */}
              {selectedEpisode && (
                <Card className="bg-white/80 backdrop-blur-sm border border-violet-200/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-violet-600" />
                      Audio Player
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <audio
                      ref={audioRef}
                      src={selectedEpisode.audio_url}
                      preload="metadata"
                      className="hidden"
                    />
                    
                    {/* Playback Controls */}
                    <div className="flex items-center gap-4 justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => seekTo(Math.max(0, currentTime - 10))}
                      >
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="lg"
                        onClick={handlePlayPause}
                        className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={(e) => seekTo(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        {/* Clip markers */}
                        <div
                          className="absolute top-0 h-2 bg-violet-500/50 rounded"
                          style={{
                            left: `${(clipData.start_time / duration) * 100}%`,
                            width: `${((clipData.end_time - clipData.start_time) / duration) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Clip Controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={setClipStart}
                          className="w-full"
                        >
                          Set Start ({formatTime(clipData.start_time)})
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={setClipEnd}
                          className="w-full"
                        >
                          Set End ({formatTime(clipData.end_time)})
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={previewClip}
                      variant="outline"
                      className="w-full border-violet-200 hover:bg-violet-50"
                    >
                      Preview Clip ({formatTime(clipData.end_time - clipData.start_time)})
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Clip Creation Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border border-violet-200/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scissors className="w-5 h-5 text-violet-600" />
                      Clip Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Episode Selection */}
                      <div className="space-y-2">
                        <Label>Select Episode *</Label>
                        <Select onValueChange={handleEpisodeSelect} value={selectedEpisode?.id || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an episode to clip from" />
                          </SelectTrigger>
                          <SelectContent>
                            {episodes.map((episode) => (
                              <SelectItem key={episode.id} value={episode.id}>
                                <div className="flex flex-col text-left">
                                  <span className="font-medium">{episode.title}</span>
                                  <span className="text-xs text-gray-500">
                                    {episode.podcast_name} • {formatTime(episode.duration)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Clip Information */}
                      <div className="space-y-2">
                        <Label htmlFor="title">Clip Title *</Label>
                        <Input
                          id="title"
                          value={clipData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Give your clip a catchy title"
                          required
                          disabled={isCreating}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={clipData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe what makes this moment special..."
                          rows={3}
                          disabled={isCreating}
                        />
                      </div>

                      {/* Manual Timing Controls */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="start_time">Start Time (seconds)</Label>
                          <Input
                            id="start_time"
                            type="number"
                            min="0"
                            max={duration}
                            step="0.1"
                            value={clipData.start_time}
                            onChange={(e) => handleInputChange('start_time', parseFloat(e.target.value) || 0)}
                            disabled={isCreating}
                          />
                          <p className="text-xs text-gray-500">
                            {formatTime(clipData.start_time)}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_time">End Time (seconds)</Label>
                          <Input
                            id="end_time"
                            type="number"
                            min="0"
                            max={duration}
                            step="0.1"
                            value={clipData.end_time}
                            onChange={(e) => handleInputChange('end_time', parseFloat(e.target.value) || 0)}
                            disabled={isCreating}
                          />
                          <p className="text-xs text-gray-500">
                            {formatTime(clipData.end_time)}
                          </p>
                        </div>
                      </div>

                      {/* Duration Display */}
                      <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-violet-900">
                              Clip Duration: {formatTime(clipData.end_time - clipData.start_time)}
                            </p>
                            <p className="text-xs text-violet-600">
                              From {formatTime(clipData.start_time)} to {formatTime(clipData.end_time)}
                            </p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={
                              clipData.end_time - clipData.start_time > 180 
                                ? "bg-orange-100 text-orange-800" 
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {clipData.end_time - clipData.start_time > 180 ? "Long clip" : "Good length"}
                          </Badge>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags (Optional)</Label>
                        <Input
                          id="tags"
                          value={clipData.tags}
                          onChange={(e) => handleInputChange('tags', e.target.value)}
                          placeholder="funny, insights, quotes, ai, technology"
                          disabled={isCreating}
                        />
                        <p className="text-xs text-gray-500">Separate tags with commas</p>
                      </div>

                      <Button
                        type="submit"
                        disabled={isCreating || !selectedEpisode}
                        className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg text-lg py-6"
                      >
                        {isCreating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Creating Clip...
                          </>
                        ) : (
                          <>
                            <Scissors className="w-5 h-5 mr-2" />
                            Create Clip
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Episode Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {selectedEpisode ? (
                <Card className="bg-white/80 backdrop-blur-sm border border-violet-200/50 shadow-lg sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Episode</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedEpisode.cover_image_url && (
                      <img 
                        src={selectedEpisode.cover_image_url}
                        alt={selectedEpisode.title}
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedEpisode.title}</h4>
                      <p className="text-sm text-violet-600 font-medium">{selectedEpisode.podcast_name}</p>
                      {selectedEpisode.episode_number && (
                        <p className="text-sm text-gray-500">{selectedEpisode.episode_number}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {formatTime(selectedEpisode.duration)}
                      </p>
                    </div>
                    {selectedEpisode.description && (
                      <p className="text-sm text-gray-600 line-clamp-4">
                        {selectedEpisode.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-xl sticky top-6">
                  <CardContent className="p-8 text-center">
                    <Scissors className="w-16 h-16 mx-auto mb-4 opacity-80" />
                    <h3 className="font-semibold mb-2 text-lg">Select an Episode</h3>
                    <p className="text-sm text-violet-100">
                      Choose an episode from your library to start creating clips with precise timing controls
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        )}
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 0 2px 0 #555;
          transition: background .15s ease-in-out;
        }
        
        .slider::-webkit-slider-thumb:hover {
          background: #7c3aed;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}