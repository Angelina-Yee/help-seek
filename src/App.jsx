import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Landing from "./pages/landing";
import Instructions from "./pages/instructions";
import Signup1 from "./pages/signup1";
import Signup2 from "./pages/signup2";
import Signup3 from "./pages/signup3";
import EditProfile from "./pages/editProfile";
import Profile from "./pages/profile";
import Sidebar from "./components/sidebar";

function Layout(){
  return(
    <>
      <Sidebar/>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function App() {
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
