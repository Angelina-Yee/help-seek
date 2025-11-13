import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  matchPath,
} from "react-router-dom";

import Landing from "./pages/landing";
import Signup1 from "./pages/signup1";
import Signup2 from "./pages/signup2";
import Signup3 from "./pages/signup3";
import EditProfile from "./pages/editProfile";
import Profile from "./pages/profile";
import Sidebar from "./components/sidebar";
import Login from "./pages/login";
import ForgotPassword from "./pages/forgotpassword";
import ForgetPassword2 from "./pages/forgetpassword2";
import EditPP from "./pages/editPP";
import AccSettings from "./components/accSettings";
import NewPost from "./components/newPost";
import Choice from "./components/choice";
import Others from "./pages/others";
import Home from "./pages/home";
import LossFind from "./pages/lossFind";
import FindLoss from "./pages/findLoss";
import CategAll from "./components/categAll";
import ForgotPassword3 from "./pages/forgotpassword3";
import Inbox from "./pages/inbox";
import Category from "./pages/category";
import HowItWorks from "./pages/howItWorks";
import HowItWorks2 from "./pages/howItWorks2";
import Search from "./pages/search";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import { initAuth } from "./api";

const TITLE_MAP = [
  { path: "/", title: "Help N Seek - Landing" },
  { path: "/home", title: "Help N Seek - Home" },
  { path: "/lossFind", title: "Help N Seek - Losses" },
  { path: "/findLoss", title: "Help N Seek - Finds" },
  { path: "/choice", title: "Help N Seek - Choice" },
  { path: "/login", title: "Help N Seek - Login" },
  { path: "/signup1", title: "Help N Seek - Sign Up" },
  { path: "/signup2", title: "Help N Seek - Sign Up" },
  { path: "/signup3", title: "Help N Seek - Sign Up" },
  { path: "/newPost", title: "Help N Seek - New Post" },
  { path: "/inbox", title: "Help N Seek - Inbox" },
  { path: "/search", title: "Help N Seek - Search" },
  { path: "/categAll", title: "Help N Seek - Categories" },
  { path: "/category", title: "Help N Seek - Category" },
  { path: "/howitworks", title: "Help N Seek - How It Works" },
  { path: "/instructions", title: "Help N Seek - Instructions" },
  { path: "/accSettings", title: "Help N Seek - Account Settings" },
  { path: "/editProfile", title: "Help N Seek - Edit Profile" },
  { path: "/editPP", title: "Help N Seek - Edit Picture" },
  { path: "/profile", title: "Help N Seek - My Profile" },
  { path: "/users/:id", title: "Help N Seek - Profile" },
  { path: "/terms", title: "Help N Seek - Terms of Service" },
  { path: "/terms-of-service", title: "Help N Seek - Terms of Service" },
  { path: "/privacy", title: "Help N Seek - Privacy Policy" },
  { path: "/privacy-policy", title: "Help N Seek - Privacy Policy" },
  { path: "/forgot-password", title: "Help N Seek - Forgot Password" },
  { path: "/forgotpassword2", title: "Help N Seek - Verify Code" },
  { path: "/forgotpassword3", title: "Help N Seek - Reset Password" },
];

function Layout() {
  return (
    <>
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    let title = "Help N Seek";
    for (const entry of TITLE_MAP) {
      if (
        matchPath(
          {
            path: entry.path,
            end: true,
          },
          pathname
        )
      ) {
        title = entry.title;
        break;
      }
    }
    document.title = title;
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <TitleUpdater />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup1" element={<Signup1 />} />
        <Route path="/signup2" element={<Signup2 />} />
        <Route path="/signup3" element={<Signup3 />} />
        <Route element={<Layout />}>
          <Route path="/editProfile" element={<EditProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/editPP" element={<EditPP />} />
          <Route path="/accSettings" element={<AccSettings />} />
          <Route path="/home" element={<Home />} />
          <Route path="/newPost" element={<NewPost />} />
          <Route path="/choice" element={<Choice />} />
          <Route path="/lossFind" element={<LossFind />} />
          <Route path="/findLoss" element={<FindLoss />} />
          <Route path="/categAll" element={<CategAll />} />
          <Route path="/users/:id" element={<Others />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/howitworks" element={<HowItWorks2 />} />
          <Route path="/category" element={<Category />} />
          <Route path="/search" element={<Search />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgotpassword2" element={<ForgetPassword2 />} />
        <Route path="/forgotpassword3" element={<ForgotPassword3 />} />
        <Route path="/instructions" element={<HowItWorks />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
