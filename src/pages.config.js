import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import CreateClip from './pages/CreateClip';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Playlists from './pages/Playlists';
import Trending from './pages/Trending';
import Notifications from './pages/Notifications';
import __Layout from './Layout.jsx';
import Login from './pages/Login';


export const PAGES = {
    "Dashboard": Dashboard,
    "Upload": Upload,
    "CreateClip": CreateClip,
    "Favorites": Favorites,
    "Profile": Profile,
    "Analytics": Analytics,
    "Playlists": Playlists,
    "Trending": Trending,
    "Notifications": Notifications,
    "Login": Login,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};