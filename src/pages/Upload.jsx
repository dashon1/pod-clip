import React, { useState } from "react";
import { Episode } from "@/entities/all";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, FileAudio, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function UploadPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    podcast_name: "",
    description: "",
    episode_number: "",
    published_date: "",
    cover_image_url: ""
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleAudioFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        setError(null);
        // Auto-fill title if empty
        if (!formData.title) {
          const fileName = file.name.replace(/\.[^/.]+$/, "");
          setFormData(prev => ({ ...prev, title: fileName }));
        }
      } else {
        setError("Please select a valid audio file (MP3, WAV, M4A, etc.)");
      }
    }
  };

  const handleCoverFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setCoverFile(file);
        setError(null);
      } else {
        setError("Please select a valid image file (PNG, JPG, etc.)");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setError(null);
      // Auto-fill title if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    } else {
      setError("Please drop a valid audio file");
    }
  };

  const validateForm = () => {
    if (!audioFile) {
      setError("Please select an audio file");
      return false;
    }
    if (!formData.title.trim()) {
      setError("Please enter an episode title");
      return false;
    }
    if (!formData.podcast_name.trim()) {
      setError("Please enter the podcast name");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload audio file
      const { file_url: audioUrl } = await UploadFile({ file: audioFile });
      
      // Upload cover image if provided
      let coverUrl = "";
      if (coverFile) {
        const { file_url } = await UploadFile({ file: coverFile });
        coverUrl = file_url;
      }

      setUploadProgress(95);

      // Estimate duration (in a real app, you'd extract this from the audio file)
      const estimatedDuration = Math.round(audioFile.size / 16000); // Rough estimate

      // Create episode
      const newEpisode = await Episode.create({
        ...formData,
        audio_url: audioUrl,
        cover_image_url: coverUrl,
        duration: estimatedDuration
      });

      setUploadProgress(100);
      setSuccess(true);

      // Auto-redirect after success
      setTimeout(() => {
        navigate(createPageUrl("CreateClip"));
      }, 2000);

    } catch (error) {
      setError("Error uploading episode. Please check your connection and try again.");
      console.error("Upload error:", error);
    }

    setIsUploading(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      podcast_name: "",
      description: "",
      episode_number: "",
      published_date: "",
      cover_image_url: ""
    });
    setAudioFile(null);
    setCoverFile(null);
    setSuccess(false);
    setError(null);
    setUploadProgress(0);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center"
        >
          <Card className="bg-white/80 backdrop-blur-sm border border-green-200/50 shadow-xl">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your episode "{formData.title}" has been uploaded successfully. 
                Redirecting to create your first clip...
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => navigate(createPageUrl("CreateClip"))}
                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  Create Clip Now
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  Upload Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Upload Episode</h1>
            <p className="text-gray-600 mt-1">Add a new podcast episode to create clips from</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isUploading && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="font-medium">Uploading your episode...</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-gray-600 mt-2">{uploadProgress}% complete</p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border border-violet-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileAudio className="w-5 h-5 text-violet-600" />
                  Episode Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Audio File Upload */}
                  <div className="space-y-2">
                    <Label>Audio File *</Label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                        dragActive 
                          ? "border-violet-400 bg-violet-50 scale-105" 
                          : "border-violet-200 hover:border-violet-300 hover:bg-violet-50/50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileAudio className="w-8 h-8 text-white" />
                        </div>
                        {audioFile ? (
                          <div>
                            <p className="font-medium text-gray-900">{audioFile.name}</p>
                            <p className="text-sm text-gray-500">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAudioFile(null)}
                              className="mt-2"
                            >
                              Remove File
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-700 mb-2">
                              {dragActive ? "Drop your audio file here" : "Drop your audio file here or"}
                            </p>
                            {!dragActive && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('audio-upload').click()}
                              >
                                Browse Files
                              </Button>
                            )}
                            <p className="text-xs text-gray-500 mt-2">Supports MP3, WAV, M4A, AAC files up to 100MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Episode Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Episode Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g. The Future of AI"
                        required
                        disabled={isUploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="podcast_name">Podcast Name *</Label>
                      <Input
                        id="podcast_name"
                        value={formData.podcast_name}
                        onChange={(e) => handleInputChange('podcast_name', e.target.value)}
                        placeholder="e.g. Tech Talk Weekly"
                        required
                        disabled={isUploading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what this episode is about..."
                      rows={4}
                      disabled={isUploading}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="episode_number">Episode Number</Label>
                      <Input
                        id="episode_number"
                        value={formData.episode_number}
                        onChange={(e) => handleInputChange('episode_number', e.target.value)}
                        placeholder="e.g. S01E05 or #42"
                        disabled={isUploading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="published_date">Published Date</Label>
                      <Input
                        id="published_date"
                        type="date"
                        value={formData.published_date}
                        onChange={(e) => handleInputChange('published_date', e.target.value)}
                        disabled={isUploading}
                      />
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="space-y-2">
                    <Label>Cover Image (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileSelect}
                        className="text-sm flex-1"
                        disabled={isUploading}
                      />
                      {coverFile && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {coverFile.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isUploading || !audioFile}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg text-lg py-6"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Uploading... {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Episode
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-xl sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Upload Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Audio Quality</h4>
                  <p className="text-sm text-violet-100">Higher quality audio makes for better clips. Aim for at least 128kbps MP3 or equivalent.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">File Size</h4>
                  <p className="text-sm text-violet-100">Keep files under 100MB for faster uploads. Compress if needed without losing quality.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Metadata</h4>
                  <p className="text-sm text-violet-100">Complete episode details help others discover your clips and improve searchability.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cover Images</h4>
                  <p className="text-sm text-violet-100">Square images (1:1 ratio) work best. Use high-quality images for professional appearance.</p>
                </div>
                <div className="pt-4 border-t border-violet-400">
                  <p className="text-xs text-violet-200">
                    💡 Pro tip: Upload episodes you own or have permission to share
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}