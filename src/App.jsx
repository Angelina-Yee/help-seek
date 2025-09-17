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
import Login from "./pages/login";
import ForgotPassword from "./pages/forgotpassword";
<<<<<<< HEAD
import ForgetPassword2 from "./pages/forgetpassword2"; // added
=======
import EditPP from "./pages/editPP";
>>>>>>> 52fff2bdd304b697ff0e42f306f1c4a4559bf73a

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
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgotpassword2" element={<ForgetPassword2 />} />{" "}
        {/* added */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
