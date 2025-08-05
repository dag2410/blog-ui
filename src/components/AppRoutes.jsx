import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout/AppLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import FullscreenLayout from "../layouts/FullscreenLayout/FullscreenLayout";
import ErrorBoundary from "./ErrorBoundary/ErrorBoundary";
import Loading from "./Loading/Loading";

// Lazy load pages for better performance
const Home = lazy(() => import("../pages/Home/Home"));
const Topic = lazy(() => import("../pages/Topic/Topic"));
const TopicsListing = lazy(() =>
  import("../pages/TopicsListing/TopicsListing")
);
const BlogDetail = lazy(() => import("../pages/BlogDetail/BlogDetail"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const EditProfile = lazy(() => import("../pages/EditProfile/EditProfile"));
const MyPosts = lazy(() => import("../pages/MyPosts/MyPosts"));
const WritePost = lazy(() => import("../pages/WritePost/WritePost"));
const Bookmarks = lazy(() => import("../pages/Bookmarks/Bookmarks"));
const DirectMessages = lazy(() =>
  import("../pages/DirectMessages/DirectMessages")
);
const Settings = lazy(() => import("../pages/Settings/Settings"));
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));
const ForgotPassword = lazy(() =>
  import("../pages/ForgotPassword/ForgotPassword")
);
const ResetPassword = lazy(() =>
  import("../pages/ResetPassword/ResetPassword")
);
const VerifyEmail = lazy(() => import("../pages/VerifyEmail/VerifyEmail"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading fullscreen />}>
        <Routes>
          {/* App Layout Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="topics" element={<TopicsListing />} />
            <Route path="topics/:slug" element={<Topic />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="profile/:id/edit" element={<EditProfile />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* Fullscreen Layout Routes */}
          <Route path="/" element={<FullscreenLayout />}>
            <Route path="write" element={<WritePost />} />
            <Route path="write/:slug" element={<WritePost />} />
            <Route path="messages" element={<DirectMessages />} />
          </Route>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthLayout>
                <ResetPassword />
              </AuthLayout>
            }
          />
          <Route
            path="/verify-email"
            element={
              <AuthLayout>
                <VerifyEmail />
              </AuthLayout>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
