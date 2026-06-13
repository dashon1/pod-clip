import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Home, 
  Upload, 
  Scissors, 
  Heart, 
  User as UserIcon, 
  Radio,
  Headphones,
  Share2,
  TrendingUp,
  LogIn,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Discover",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Upload Episode",
    url: createPageUrl("Upload"),
    icon: Upload,
  },
  {
    title: "Create Clip",
    url: createPageUrl("CreateClip"),
    icon: Scissors,
  },
  {
    title: "My Favorites",
    url: createPageUrl("Favorites"),
    icon: Heart,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [stats, setStats] = useState({
    totalClips: 0,
    totalFavorites: 0,
    totalShares: 0
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
    checkAuthentication();
  }, []);

  const loadStats = async () => {
    try {
      const [clips, episodes] = await Promise.all([
        base44.entities.Clip.list("-created_date", 100),
        base44.entities.Episode.list("-created_date", 50)
      ]);
      
      const totalFavorites = clips.reduce((sum, clip) => sum + (clip.favorite_count || 0), 0);
      const totalShares = clips.reduce((sum, clip) => sum + (clip.share_count || 0), 0);
      
      setStats({
        totalClips: clips.length,
        totalFavorites,
        totalShares
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const checkAuthentication = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    try {
      await base44.auth.redirectToLogin(window.location.href);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <Sidebar className="border-r border-violet-200/50 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-violet-200/50 p-6">
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900">PodClip</h2>
                <p className="text-xs text-violet-600 font-medium">Share Your Favorite Moments</p>
              </div>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-violet-50 hover:text-violet-700 transition-all duration-200 rounded-xl ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md' 
                            : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                Community Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Scissors className="w-4 h-4 text-violet-500" />
                    <span className="text-gray-600">Total Clips</span>
                    <span className="ml-auto font-bold text-violet-600">{stats.totalClips}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="text-gray-600">Favorites</span>
                    <span className="ml-auto font-bold text-pink-600">{stats.totalFavorites}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">Shares</span>
                    <span className="ml-auto font-bold text-blue-600">{stats.totalShares}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Growing</span>
                    <span className="ml-auto font-bold text-green-600">+{Math.floor(stats.totalClips / 7)}/week</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-violet-200/50 p-4">
            {isLoading ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/30">
                <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-20"></div>
                  <div className="h-2 bg-gray-200 animate-pulse rounded w-16"></div>
                </div>
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200/30">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {currentUser?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-violet-600 truncate">
                      {currentUser?.email || 'Clip Creator'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* Mobile header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-violet-200/50 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-violet-50 p-2 rounded-lg transition-colors duration-200" />
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
                <Headphones className="w-6 h-6 text-violet-600" />
                <h1 className="text-xl font-bold text-gray-900">PodClip</h1>
              </Link>
            </div>
          </header>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}