import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Play, Sparkles, Headphones, Upload, Scissors } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-br from-violet-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Share Your Favorite Podcast Moments</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Clip, Save & Share
              <br />
              <span className="bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                Podcast Gold
              </span>
            </h1>
            
            <p className="text-xl text-violet-100 max-w-3xl mx-auto leading-relaxed">
              Transform your favorite podcast moments into shareable clips. 
              Discover amazing insights, save memorable quotes, and build your audio library.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link to={createPageUrl("Upload")}>
              <Button size="lg" className="bg-white text-violet-900 hover:bg-violet-50 shadow-xl text-lg px-8 py-4 rounded-xl font-semibold">
                <Upload className="w-5 h-5 mr-2" />
                Upload Episode
              </Button>
            </Link>
            <Link to={createPageUrl("CreateClip")}>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm shadow-xl text-lg px-8 py-4 rounded-xl font-semibold"
              >
                <Scissors className="w-5 h-5 mr-2" />
                Create Clip
              </Button>
            </Link>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center gap-8 text-white/70"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Easy Playback</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Scissors className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Precise Clipping</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Headphones className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">High Quality</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}