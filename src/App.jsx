import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CampingList from "./pages/CampingList";
import CampingDetail from "./pages/CampingDetail";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.REACT_APP_KAKAO_JS_KEY);
      console.log("Kakao SDK Initialized");
    }
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CampingList />} />
        <Route path="/detail/:id" element={<CampingDetail />} />
      </Routes>
    </Router>
  );
}
