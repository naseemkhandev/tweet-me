import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import RootLayout from "./layouts/RootLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/home/HomePage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";

const App = () => {
  const { data } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (data.error) return null;
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw error.message;
      }
    },
    retry: false,
  });

  // if (isLoading) {
  //   return (
  //     <div className="w-screen h-screen flex items-center justify-center">
  //       <LoadingSpinner size="lg" />
  //     </div>
  //   );
  // }

  return (
    <div className="flex max-w-6xl mx-auto">
      <Toaster />

      <Routes>
        <Route
          path="/"
          element={data?.user ? <RootLayout /> : <Navigate to="/auth/login" />}
        >
          <Route index element={<HomePage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
        </Route>

        <Route
          path="/auth"
          element={!data?.user ? <AuthLayout /> : <Navigate to="/" />}
        >
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>
      </Routes>
    </div>
  );
};
export default App;
