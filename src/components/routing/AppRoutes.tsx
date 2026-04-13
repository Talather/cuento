import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Story from "@/pages/Story";
import Library from "@/pages/Library";
import Search from "@/pages/Search";
import LikedStories from "@/pages/LikedStories";
import TaggedStories from "@/pages/TaggedStories";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Contact from "@/pages/Contact";
import Dashboard from "@/pages/Dashboard";
import { StoryGenerator } from "@/components/StoryGenerator";
import PaymentSuccess from "@/pages/PaymentSuccess";
import AuthCallback from "@/pages/AuthCallback";
import Profile from "@/pages/Profile";

const RestrictedStoryPaths = ({ children }: { children: React.ReactNode }) => {
  const { title } = useParams();
  
  if (!title || title === 'login') {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

export const AppRoutes = () => (
  <div className="flex flex-col min-h-screen">
    <Nav />
    <div className="flex-grow">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route path="/library" element={<Library />} />
        <Route
          path="/liked"
          element={
            <ProtectedRoute>
              <LikedStories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tagged/:tag"
          element={
            <ProtectedRoute>
              <TaggedStories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/story/new"
          element={
            <ProtectedRoute>
              <StoryGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/story/:title/:id?"
          element={
            <ProtectedRoute>
              <RestrictedStoryPaths>
                <Story />
              </RestrictedStoryPaths>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
    <Footer />
  </div>
);