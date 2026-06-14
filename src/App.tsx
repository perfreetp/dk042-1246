import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CheckIn from "@/pages/CheckIn";
import CarePlan from "@/pages/CarePlan";
import Schedule from "@/pages/Schedule";
import Events from "@/pages/Events";
import Billing from "@/pages/Billing";
import Statistics from "@/pages/Statistics";
import { useStore } from "@/store";

export default function App() {
  const { initData } = useStore();

  useEffect(() => {
    initData();
  }, [initData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/care-plan" element={<CarePlan />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/events" element={<Events />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
