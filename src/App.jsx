import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Landing from "./pages/landing";
import Instructions from "./pages/instructions";
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
import CategAll from "./components/categAll";
import ForgotPassword3 from "./pages/forgotpassword3";

import { initAuth } from "./api";

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

function App() {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/signup1" element={<Signup1 />} />
        <Route path="/signup2" element={<Signup2 />} />
        <Route path="/signup3" element={<Signup3 />} />
        <Route element={<Layout />}>
          <Route path="/editProfile" element={<EditProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/editPP" element={<EditPP />} />
          <Route path="/accSettings" element={<AccSettings />} />
          <Route path="/others" element={<Others />} />
          <Route path="/home" element={<Home />} />
          <Route path="/newPost" element={<NewPost />} />
          <Route path="/choice" element={<Choice />} />
          <Route path="/lossFind" element={<LossFind />} />
          <Route path="/categAll" element={<CategAll />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgotpassword2" element={<ForgetPassword2 />} />
        <Route path="/forgotpassword3" element={<ForgotPassword3 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
