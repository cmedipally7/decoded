import { Navigate, Route, Routes } from "react-router-dom";
import { PhoneFrame, TabLayout } from "./components/Layout";
import { useApp } from "./context";
import Chat from "./pages/Chat";
import Learn from "./pages/Learn";
import Lesson from "./pages/Lesson";
import LessonDone from "./pages/LessonDone";
import Me from "./pages/Me";
import { Welcome } from "./pages/Onboarding";
import People from "./pages/People";
import Pulse from "./pages/Pulse";
import Today from "./pages/Today";

// Sends each user to the home tab for their level (or onboarding if new)
function Home() {
  const { user } = useApp();
  if (!user) return null;
  if (!user.onboarded) return <Navigate to="/welcome" replace />;
  return <Navigate to={`/${user.homeTab}`} replace />;
}

export default function App() {
  return (
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<TabLayout />}>
          <Route path="/today" element={<Today />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/pulse" element={<Pulse />} />
          <Route path="/people" element={<People />} />
          <Route path="/me" element={<Me />} />
        </Route>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/lesson/:id" element={<Lesson />} />
        <Route path="/lesson/:id/done" element={<LessonDone />} />
        <Route path="/chat/:postId" element={<Chat />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </PhoneFrame>
  );
}
