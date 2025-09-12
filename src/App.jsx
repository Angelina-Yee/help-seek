import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Instructions from "./pages/instructions";
import Signup1 from "./pages/signup1";
import Signup2 from "./pages/signup2";
import Signup3 from "./pages/signup3";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/signup1" element={<Signup1 />} />
        <Route path="/signup2" element={<Signup2 />} />
        <Route path="/signup3" element={<Signup3 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
