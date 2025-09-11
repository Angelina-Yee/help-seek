import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Landing from "./pages/landing";
import Instructions from "./pages/instructions";
import Signup1 from "./pages/signup1";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element= {<Landing/>} />
        <Route path="/instructions" element= {<Instructions/>} />
        <Route path="/signup1" element= {<Signup1/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;