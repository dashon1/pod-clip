import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Scissors, 
  Heart,
  Plus,
  Settings,
  UserPlus,
  UserMinus
} from "lucide-react";
import { motion } from "framer-motion";
import ClipCard from "../components/dashboard/ClipCard";

export default function ProfilePage() {
  const location = useLocation();
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userClips, setUserClips] = useState([]);
  const [favoriteClips, setFavoriteClips] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClips: 0,
    totalFavorites: 0,
    totalPlays: 0,
    totalFollowers: 0
  });

  useEffect(() => {
    loadProfile();
  }, [location]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // Get current logged in user
      const currentUserData = await base44.auth.me();
      setCurrentUser(currentUserData);

      // Get profile user email from URL or use current user
      const urlParams = new URLSearchParams(location.search);
      const profileEmail = urlParams.get('user') || currentUserData.email;
      
      setIsOwnProfile(profileEmail === currentUserData.email);

      // Load profile user data
      const [clips, allEpisodes, allPlaylists, allFavorites, allFollows] = await Promise.all([
        base44.entities.Clip.filter({ created_by: profileEmail }),
        base44.entities.Episode.list("-created_date"),
        base44.entities.Playlist.filter({ user_email: profileEmail }),
        base44.entities.Favorite.filter({ user_email: profileEmail }),
        base44.entities.Follow.list()
      ]);

      setUserClips(clips);
      setEpisodes(allEpisodes);
      setPlaylists(allPlaylists);

      // Get favorite clips
      const favoriteClipIds = allFavorites.map(f => f.clip_id);
      const allClips = await base44.entities.Clip.list();
      setFavoriteClips(allClips.filter(c => favoriteClipIds.includes(c.id)));

      // Calculate followers and following
      const userFollowers = allFollows.filter(f => f.following_email === profileEmail);
      const userFollowing = allFollows.filter(f => f.follower_email === profileEmail);
      setFollowers(userFollowers);
      setFollowing(userFollowing);

      // Check if current user is following this profile
      setIsFollowing(userFollowers.some(f => f.follower_email === currentUserData.email));

      // Calculate stats
      const totalFavorites = clips.reduce((sum, clip) => sum + (clip.favorite_count || 0), 0);
      setStats({
        totalClips: clips.length,
        totalFavorites,
        totalPlays: 0,
        totalFollowers: userFollowers.length
      });

      setProfileUser({ email: profileEmail, full_name: "User" });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setIsLoading(false);
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        // Unfollow
        const followToRemove = followers.find(f => f.follower_email === currentUser.email);
        if (followToRemove) {
          await base44.entities.Follow.delete(followToRemove.id);
        }
      } else {
        // Follow
        await base44.entities.Follow.create({
          follower_email: currentUser.email,
          following_email: profileUser.email
        });
      }
      loadProfile();
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {profileUser?.full_name || profileUser?.email}
              </h1>
              <p className="text-violet-100 mb-4">{profileUser?.email}</p>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.totalClips}</p>
                  <p className="text-sm text-violet-200">Clips</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.totalFollowers}</p>
                  <p className="text-sm text-violet-200">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{following.length}</p>
                  <p className="text-sm text-violet-200">Following</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.totalFavorites}</p>
                  <p className="text-sm text-violet-200">Total Favorites</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Button className="bg-white text-violet-600 hover:bg-violet-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  onClick={handleFollow}
                  className={isFollowing ? "bg-white/20 hover:bg-white/30" : "bg-white text-violet-600 hover:bg-violet-50"}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="clips" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="clips">Clips ({userClips.length})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favoriteClips.length})</TabsTrigger>
            <TabsTrigger value="playlists">Playlists ({playlists.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="clips">
            {userClips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userClips.map((clip, index) => (
                  <ClipCard 
                    key={clip.id} 
                    clip={clip} 
                    episodes={episodes}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Scissors className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No clips yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Start creating your first clip!" : "This user hasn't created any clips yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {favoriteClips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteClips.map((clip, index) => (
                  <ClipCard 
                    key={clip.id} 
                    clip={clip} 
                    episodes={episodes}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Start favoriting clips you love!" : "This user hasn't favorited any clips yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="playlists">
            {playlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist, index) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="w-5 h-5 text-violet-600" />
                          {playlist.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">{playlist.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{playlist.clip_ids.length} clips</Badge>
                          {playlist.is_public && <Badge className="bg-green-100 text-green-800">Public</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No playlists yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile ? "Create your first playlist to organize clips!" : "This user hasn't created any playlists yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}