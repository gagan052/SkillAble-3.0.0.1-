import "./app.scss";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import React from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Gigs from "./pages/gigs/Gigs";
import Gig from "./pages/gig/Gig";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Add from "./pages/add/Add";
import Orders from "./pages/orders/Orders";
import Messages from "./pages/messages/Messages";
import Message from "./pages/message/Message";
import MyGigs from "./pages/myGigs/MyGigs";
// import AddStory from "./pages/addStory/AddStory";
import Privacy from "./pages/privacy/Privacy";
import About from "./pages/about/About";
import Contact from "./pages/contact/Contact";

import Dashboard from "./pages/dashboard/Dashboard";

import Explore from "./pages/explore/Explore";
import SavedGigs from "./pages/saved/SavedGigs";
import Collaborate from "./pages/collaborate/Collaborate";
import Community from "./pages/community/Community";
import CollaborationDetail from "./pages/collaborationDetail/CollaborationDetail";
import CommunityDetail from "./pages/communityDetail/CommunityDetail";
import CollaborationRequests from "./pages/collaborationRequests/CollaborationRequests";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Pay from "./pages/pay/Pay";
import Success from "./pages/success/Success";
import VerifyEmail from "./pages/verify/VerifyEmail";
function App() {
  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <div className="app">
        <GoogleOAuthProvider clientId="412703226079-bqnsp67ptg5dgve5i6903mehia7o1bn3.apps.googleusercontent.com">
          <QueryClientProvider client={queryClient}>
            <Navbar />
            <Outlet />
            {/* <Footer /> */}
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/gigs",
          element: <Gigs />,
        },
        {
          path: "/myGigs",
          element: <MyGigs />,
        },
        {
          path: "/orders",
          element: <Orders />,
        },
        {
          path: "/messages",
          element: <Messages />,
        },
        {
          path: "/message/:id",
          element: <Message />,
        },
        {
          path: "/add",
          element: <Add />,
        },
        {
          path: "/gig/:id",
          element: <Gig />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/pay/:id",
          element: <Pay />,
        },
        {
          path: "/success",
          element: <Success />,
        },
        {
          path: "/verify-email/:userId",
          element: <VerifyEmail />,
        },
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/add-story",
          element: <AddStory />,
        },
        {
          path: "/explore",
          element: <Explore />,
        },
        {
          path: "/saved",
          element: <SavedGigs />
        },
        {
          path: "/privacy",
          element: <Privacy />
        },
        {
          path: "/about",
          element: <About />
        },
        {
          path: "/contact",
          element: <Contact />
        },
        {
          path: "/collaborate",
          element: <Collaborate />
        },
        {
          path: "/collaborate/:id",
          element: <CollaborationDetail />
        },
        {
          path: "/collaboration-requests",
          element: <CollaborationRequests />
        },
        {
          path: "/community",
          element: <Community />
        },
        {
          path: "/community/:id",
          element: <CommunityDetail />
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
