import { Navigate, Route, Routes } from "react-router-dom";
import { PhoneFrame, TabLayout } from "./components/Layout";
import Chat from "./pages/Chat";
import Learn from "./pages/Learn";
import Lesson from "./pages/Lesson";
import LessonDone from "./pages/LessonDone";
import Me from "./pages/Me";
import { Placement, Result, Welcome } from "./pages/Onboarding";
import People from "./pages/People";
import Pulse from "./pages/Pulse";

export default function App() {
  return (
    <PhoneFrame>
      <Routes>
        <Route element={<TabLayout />}>
          <Route path="/learn" element={<Learn />} />
          <Route path="/pulse" element={<Pulse />} />
          <Route path="/people" element={<People />} />
          <Route path="/me" element={<Me />} />
        </Route>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/placement" element={<Placement />} />
        <Route path="/result" element={<Result />} />
        <Route path="/lesson/:id" element={<Lesson />} />
        <Route path="/lesson/:id/done" element={<LessonDone />} />
        <Route path="/chat/:postId" element={<Chat />} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Routes>
    </PhoneFrame>
  );
}
