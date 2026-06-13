import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  List, 
  Music, 
  PlayCircle,
  Trash,
  Lock,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

export default function PlaylistsPage() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [allClips, setAllClips] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    title: "",
    description: "",
    is_public: true,
    clip_ids: []
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      const [userPlaylists, clips, eps] = await Promise.all([
        base44.entities.Playlist.filter({ user_email: user.email }),
        base44.entities.Clip.list("-created_date"),
        base44.entities.Episode.list("-created_date")
      ]);
      setPlaylists(userPlaylists);
      setAllClips(clips);
      setEpisodes(eps);
    } catch (error) {
      console.error("Error loading playlists:", error);
    }
    setIsLoading(false);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.title.trim()) return;

    try {
      const user = await base44.auth.me();
      await base44.entities.Playlist.create({
        ...newPlaylist,
        user_email: user.email
      });
      setShowCreateDialog(false);
      setNewPlaylist({
        title: "",
        description: "",
        is_public: true,
        clip_ids: []
      });
      loadPlaylists();
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;
    
    try {
      await base44.entities.Playlist.delete(playlistId);
      loadPlaylists();
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  };

  const toggleClipSelection = (clipId) => {
    setNewPlaylist(prev => ({
      ...prev,
      clip_ids: prev.clip_ids.includes(clipId)
        ? prev.clip_ids.filter(id => id !== clipId)
        : [...prev.clip_ids, clipId]
    }));
  };

  const filteredClips = allClips.filter(clip =>
    clip.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Playlists</h1>
            <p className="text-gray-600 mt-1">Organize your favorite clips into collections</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Playlist Title</Label>
                  <Input
                    value={newPlaylist.title}
                    onChange={(e) => setNewPlaylist({...newPlaylist, title: e.target.value})}
                    placeholder="e.g. My Favorite Tech Insights"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                    placeholder="Describe what this playlist is about..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={newPlaylist.is_public}
                    onCheckedChange={(checked) => setNewPlaylist({...newPlaylist, is_public: checked})}
                  />
                  <Label>Make this playlist public</Label>
                </div>

                <div>
                  <Label>Select Clips</Label>
                  <Input
                    placeholder="Search clips..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-3 mt-2"
                  />
                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                    {filteredClips.map(clip => (
                      <div key={clip.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          checked={newPlaylist.clip_ids.includes(clip.id)}
                          onCheckedChange={() => toggleClipSelection(clip.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{clip.title}</p>
                          <p className="text-xs text-gray-500">{clip.duration}s</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{newPlaylist.clip_ids.length} clips selected</p>
                </div>

                <Button onClick={handleCreatePlaylist} className="w-full" disabled={!newPlaylist.title.trim()}>
                  Create Playlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <List className="w-5 h-5 text-violet-600" />
                        {playlist.title}
                      </div>
                      {playlist.is_public ? (
                        <Globe className="w-4 h-4 text-green-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-600" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{playlist.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary">{playlist.clip_ids.length} clips</Badge>
                      <Badge className={playlist.is_public ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {playlist.is_public ? "Public" : "Private"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePlaylist(playlist.id)}>
                        <Trash className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No playlists yet</h3>
              <p className="text-gray-600 mb-6">Create your first playlist to organize your favorite clips!</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-violet-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Playlist
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}