import { useCallback, useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConfigProvider, App as AntdApp, theme, Spin, message } from "antd";
import loadable from "@loadable/component";
import { isEqual, isNull } from "lodash-es";
import { Session } from "@supabase/supabase-js";

import { AppContext } from "./appContext";
import { axiosInstance, supabase } from "./config";

import { useQuery } from "react-query";
import { Profile } from "./types/profile";
import { getLocalData, UserLocalData, saveLocalData } from "./shared/services/user-local-data";
import { getUserConfig, updateUserConfig, UserConfig } from "./shared/services/user-config";
import { MainLayout } from "./shared/MainLayout";
import { profileService } from "./features/Profile/services/profile-service";
import { ProtectedRoute } from "./shared/components/Protectroute";

const Home = loadable(() => import("./features/Home/pages/Home"), {
  resolveComponent: (component) => component.Home,
  fallback: <Spin />,
});

const CreateCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.CreateCharacter,
  fallback: <Spin />,
});
const EditCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.EditCharacter,
  fallback: <Spin />,
});
const MyCharacters = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.MyCharacters,
  fallback: <Spin />,
});
const ViewCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.ViewCharacter,
  fallback: <Spin />,
});
const SearchCharacter = loadable(() => import("./features/Character"), {
  resolveComponent: (component) => component.SearchCharacter,
  fallback: <Spin />,
});

const Register = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Register,
  fallback: <Spin />,
});
const Login = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Login,
  fallback: <Spin />,
});
const PublicProfile = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.PublicProfile,
  fallback: <Spin />,
});
const Blocks = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Blocks,
  fallback: <Spin />,
});
const ProfilePage = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.Profile,
  fallback: <Spin />,
});
const ResetPassword = loadable(() => import("./features/Profile"), {
  resolveComponent: (component) => component.ResetPassword,
  fallback: <Spin />,
});

const MyChats = loadable(() => import("./features/Chat"), {
  resolveComponent: (component) => component.MyChats,
  fallback: <Spin />,
});
const ChatPage = loadable(() => import("./features/Chat"), {
  resolveComponent: (component) => component.ChatPage,
  fallback: <Spin />,
});

const TermOfUse = loadable(() => import("./features/ToC"), {
  resolveComponent: (component) => component.TermOfUse,
  fallback: <Spin />,
});
const PrivatePolicy = loadable(() => import("./features/ToC"), {
  resolveComponent: (component) => component.PrivatePolicy,
  fallback: <Spin />,
});
const FAQ = loadable(() => import("./features/ToC"), {
  resolveComponent: (component) => component.FAQ,
  fallback: <Spin />,
});

const Pricing = loadable(() => import("./features/ToC"), {
  resolveComponent: (component) => component.Pricing,
  fallback: <Spin />,
});

const Account = loadable(() => import("./features/ToC"), {
  resolveComponent: (component) => component.Account,
  fallback: <Spin />,
});

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <MainLayout />,
//     children: [
//       {
//         path: "/",
//         element: <Home />,
//       },
//       {
//         path: "/register",
//         element: <Register />,
//       },
//       {
//         path: "/login",
//         element: <Login />,
//       },
//       {
//         path: "/reset_password",
//         element: <ResetPassword />,
//       },

//       // Profile and Public Profile
//       {
//         path: "/profile",
//         element: <ProfilePage />,
//       },
//       {
//         path: "/profiles/:profileId",
//         element: <PublicProfile />,
//       },
//       {
//         path: "/blocks",
//         element: <Blocks />,
//       },

//       // Characters
//       {
//         path: "/search",
//         element: <SearchCharacter />,
//       },
//       {
//         path: "/tags/:tagName",
//         element: <SearchCharacter />,
//       },
//       {
//         path: "/create_character",
//         element: <CreateCharacter />,
//       },
//       {
//         path: "/edit_character/:characterId",
//         element: <EditCharacter />,
//       },
//       {
//         path: "/my_characters",
//         element: <MyCharacters />,
//       },
//       {
//         path: "/characters/:characterId",
//         element: <ViewCharacter />,
//       },

//       // Chat related
//       {
//         path: "/my_chats",
//         element: <MyChats />,
//       },

//       // Toc
//       {
//         path: "/term",
//         element: <TermOfUse />,
//       },
//       {
//         path: "/policy",
//         element: <PrivatePolicy />,
//       },
//       {
//         path: "/faq",
//         element: <FAQ />,
//       },
//       {
//         path: "/Pricing",
//         element: <Pricing />,
//       },

//       {
//         path: "/account",
//         element: <Account />,
//       },
//     ],
//   },
//   {
//     path: "/chats/:chatId",
//     element: <ChatPage />,
//   },
// ]);

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
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
        path: "/reset_password",
        element: <ResetPassword />,
      },

      // Protected Profile Routes
      {
        path: "/profile",
        element:<ProfilePage />,
      },
      {
        path: "/profiles/:profileId",
        element: <PublicProfile />,
      },
      {
        path: "/blocks",
        element: <ProtectedRoute><Blocks /></ProtectedRoute>,
      },

      // Characters - Protected and Public Routes
      {
        path: "/search",
        element: <SearchCharacter />,
      },
      {
        path: "/tags/:tagName",
        element: <SearchCharacter />,
      },
      {
        path: "/create_character",
        element: <ProtectedRoute><CreateCharacter /></ProtectedRoute>,
      },
      {
        path: "/edit_character/:characterId",
        element: <ProtectedRoute><EditCharacter /></ProtectedRoute>,
      },
      {
        path: "/my_characters",
        element: <ProtectedRoute><MyCharacters /></ProtectedRoute>,
      },
      {
        path: "/characters/:characterId",
        element: <ViewCharacter />,
      },

      // Protected Chat Routes - only protect my_chats
      {
        path: "/my_chats",
        element: <MyChats />,
      },

      // Public ToC Routes
      {
        path: "/term",
        element: <TermOfUse />,
      },
      {
        path: "/policy",
        element: <PrivatePolicy />,
      },
      {
        path: "/faq",
        element: <FAQ />,
      },
      {
        path: "/pricing",
        element: <ProtectedRoute><Pricing /></ProtectedRoute>,
      },
      {
        path: "/account",
        element: <ProtectedRoute><Account /></ProtectedRoute>,
      },
    ],
  },
  // Chat page is public
  {
    path: "/chats/:chatId",
    element: <ChatPage />,
  },
]);

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [config, setConfig] = useState<UserConfig | undefined>();
  const [localData, setLocalData] = useState<UserLocalData>(getLocalData());

  const updateLocalData = useCallback(
    (newData: Partial<UserLocalData>) => {
      setLocalData((oldData) => {
        const mergedData = { ...oldData, ...newData };
        saveLocalData(mergedData);

        return mergedData;
      });
    },
    [setLocalData]
  );

  const updateConfig = useCallback(
    (newConfig: Partial<UserConfig>) => {
      setConfig((oldConfig) => {
        if (!oldConfig) {
          return getUserConfig(newConfig);
        }

        if (!isEqual(oldConfig, newConfig) && profile) {

          console.log(oldConfig, "old", newConfig, "new")
          return updateUserConfig(newConfig, profile.id);
        }

        return getUserConfig(newConfig);
      });
    },
    [setConfig]
  );

  useEffect(() => {
    async function run() {
      const response = await supabase.auth.getSession();

      if (response.data.session) {
        console.log(response.data.session, "response.data.session")
        setSession(response.data.session);

        // Insert profile data into the profile table
        const profileData = {
          // Specify your profile data fields here
          id: response.data.session.user.id,
          block_list: { bots: [], creators: [], tags: [] }, // Default empty block list
          is_verified: false,
          config: {}, // Default configuration
        };

        const { data, error: profileInsertError } = await supabase
          .from("user_profiles")
          .insert([profileData]);

        // Retrieve the newly created profile
        const { data: profileDataFetched, error: profileFetchError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", response.data.session.user.id);

        if (profileFetchError) {
          console.error("Error fetching profile:", profileFetchError);
          return;
        }

        if (profileDataFetched && profileDataFetched.length > 0) {
          const fetchedProfile = profileDataFetched[0];

          // Type guard to check if block_list is in the expected format
          const isValidBlockList = (blockList: any): blockList is Profile["block_list"] => {
            return (
              blockList &&
              Array.isArray(blockList.bots) &&
              blockList.bots.every((bot: any) => typeof bot === "string") &&
              Array.isArray(blockList.creators) &&
              blockList.creators.every((creator: any) => typeof creator === "string") &&
              Array.isArray(blockList.tags) &&
              blockList.tags.every((tag: any) => typeof tag === "number")
            );
          };

          // Validate and assign block_list
          const blockList = isValidBlockList(fetchedProfile.block_list)
            ? fetchedProfile.block_list
            : { bots: [], creators: [], tags: [] };

          // Create a new profile object ensuring types align
          const validatedProfile: Profile = {
            about_me: fetchedProfile.about_me,
            avatar: fetchedProfile.avatar,
            block_list: blockList,
            id: fetchedProfile.id,
            is_verified: fetchedProfile.is_verified,
            name: fetchedProfile.name,
            profile: fetchedProfile.profile,
            user_name: fetchedProfile.user_name,
            config: fetchedProfile.config,
            is_nsfw: fetchedProfile.is_nsfw,
            is_blur: fetchedProfile.is_blur,
            user_type: fetchedProfile.user_type,
            admin_api_usage_count: fetchedProfile.admin_api_usage_count,
          };

          // Update the profile state
          setProfile(validatedProfile);
          updateConfig(getUserConfig(validatedProfile.config));
          console.log(getUserConfig(JSON.stringify(validatedProfile.config)));
        }
        else {
          console.error("Profile data is null or empty");
        }
      }
    }

    run();
  }, []);

  useEffect(() => {
    if (session) {
      axiosInstance.defaults.headers.common = { Authorization: `Bearer ${session.access_token}` };
    }
  }, [session]);

  // Maybe just replace this with usePromise lol
  const { data, isLoading: isProfileLoading } = useQuery(
    "profile",
    async () => {
      return await profileService.getOwnProfile();
    },
    {
      enabled: !!session,
      onSuccess: (result) => {
        const profileData = result;

        if (session && profileData == null) {
          message.error("Profile not found! Please try login again!");
          return;
        }

        if (profileData) {
          setProfile(profileData);
          console.log("sdfewfwewwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww")
          updateConfig(getUserConfig(profileData.config));
        }
      },
    }
  );

  return (
    <AppContext.Provider
      value={{
        session,
        setSession,
        profile,
        setProfile,
        isProfileLoading,
        config,
        updateConfig,
        localData,
        updateLocalData,
      }}
    >
      <ConfigProvider
        theme={{
          algorithm: [
            theme.darkAlgorithm,
          ],
          token: {
            fontSize: 16,
          },
        }}
      >
        <AntdApp className="global-css-override">
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </AppContext.Provider>
  );
};

export default App;
