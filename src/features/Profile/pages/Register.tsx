import { useContext, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Typography, Input, Button, Form, Space, App, Alert } from "antd";
import {
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
  DisconnectOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { Provider } from "@supabase/supabase-js";
import { AppContext } from "../../../appContext";
import { SITE_NAME, supabase } from "../../../config";
import { Helmet } from "react-helmet";
import { Profile } from "../../../types/profile";

const { Title } = Typography;

interface FormValues {
  email: string;
  password: string;
}

const RegisterFormContainer = styled.div`
  max-width: 440px;
  text-align: center;
  margin: 0 auto;
  padding: 1rem;
`;

export const Register = () => {
  const { setSession, setProfile, updateLocalData, setIsActivateModalVisible, setLoginUserEmail } = useContext(AppContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [form] = Form.useForm<FormValues>();

  const onSubmit = async ({ email, password }: FormValues) => {
    try {
      setIsSubmitting(true);
      const result = await supabase.auth.signUp({
        email,
        password,
      });

      if (result.error) {
        const { data: user, error: userError } = await supabase
          .from("user_profiles")
          .select("id, is_able, user_email")
          .eq("user_email", email)
          .single();

        if (user && !user?.is_able) {
            message.error("Your account is disabled. Please contact support.");
            console.log("sdfsfsdfdsfdsfds")
            setIsActivateModalVisible(true); // Show the modal
            setLoginUserEmail(user.user_email);
            navigate('/');
        }
        else
          message.error(result.error.code);
        } else {
          const { user } = result.data; // Session is null, but can request lol
          if (user) {
            console.log(user, "user")
            const profileData = {
              id: user.id, // Assuming the profile table has an 'id' field matching the user ID
              block_list: { bots: [], creators: [], tags: [] }, // Default empty block list
              is_verified: false,
              config: {}, // Default configuration
              is_nsfw: false,
              is_blur: true,
              user_type: 1,
              admin_api_usage_count: 0,
              is_able: true,
              user_email: email
              // Add any other profile fields needed
            };

            // Insert profile data into the profile table
            const { data, error } = await supabase
              .from('user_profiles')
              .insert([profileData]);

            // Check for errors during profile creation
            if (error) {
              console.error('Error creating profile:', error);
              return;
            }

            const profile = await supabase
              .from("user_profiles")
              .select('*')
              .eq("id", user.id)
            console.log(profile, "profile")
            const sessionData = await supabase.auth.getSession();
            if (sessionData.data.session) {
              setSession(sessionData.data.session);
              console.log(sessionData.data.session, "sessionData.data.session")
              if (profile.data && profile.data.length > 0) {
                const fetchedProfile = profile.data[0];
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
                  is_able: fetchedProfile.is_able
                };
                setProfile(validatedProfile);
              }
              else {
                console.error("Profile data is null or empty");
              }
            }

            updateLocalData({ is_signIn: true });

            message.success("Account created successfully. Please set your username.");
            // navigate("/profile");
            navigate("/");
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    // const registerWithProvider = (provider: Provider) => {
    //   return supabase.auth.signInWithOAuth({
    //     provider,
    //     options: {
    //       redirectTo: `${location.origin}/profile`,
    //     },
    //   });
    // };

    const registerWithProvider = async (provider: Provider) => {
      // Initiate OAuth sign-in
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
      });
      console.log("sdfdsfffsdfd")
      if (signInError) {
        console.error("Error during sign-in:", signInError);
        return;
      }

      // Retrieve the session data
      const sessionData = await supabase.auth.getSession();
      if (sessionData.data.session) {
        const session = sessionData.data.session;
        setSession(session);
        console.log(session, "sessionData.data.session");
        // Insert profile data into the profile table
        const profileData = {
          // Specify your profile data fields here
          id: session.user.id,
          block_list: { bots: [], creators: [], tags: [] }, // Default empty block list
          is_verified: false,
          config: {}, // Default configuration
          is_nsfw: false,
          is_blur: true,
          user_type: 1,
          admin_api_usage_count: 0,
          is_able: true,
          user_email: session.user.email
        };

        const { data, error: profileInsertError } = await supabase
          .from("user_profiles")
          .insert([profileData]);

        // Check for errors during profile creation
        if (profileInsertError) {
          console.error("Error creating profile:", profileInsertError);
          return;
        }

        // Retrieve the newly created profile
        const { data: profileDataFetched, error: profileFetchError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id);

        console.log(profileDataFetched, "profileDataFetched")

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
            is_able: fetchedProfile.is_able
          };

          // Update the profile state
          setProfile(validatedProfile);

          updateLocalData({ is_signIn: true });

          // Show success message and navigate
          message.success("Account created successfully. Please set your username.");
          navigate("/profile");
        }
        else {
          console.error("Profile data is null or empty");
        }
      }
    }

    return (
      <RegisterFormContainer>
        <Helmet>
          <title>{`${SITE_NAME} - Register`}</title>
          <meta name="description" content="Register a new account" />
        </Helmet>

        <Form form={form} onFinish={onSubmit}>
          <Title level={2}>Register</Title>

          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please enter your email." }]}
            help=""
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password." }]}
          >
            <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>

          <Alert
            className="mb-4"
            message="We do not confirm your email, but it will be used for password recovery. Feel free to use your real or temporary email"
            type="info"
            showIcon
          />

          <p>
            {" "}
            By registering, you agree with our{" "}
            <a href="/policy" target="_blank">
              📜 Content & Private Policy
            </a>
            <span> and </span>
            <a href="/term" target="_blank">
              🤝 Term of Use.
            </a>
          </p>

          <Alert
            className="mb-4"
            message="This site is not for minor. Please do not register if you are less than 18 years old."
            type="warning"
            showIcon
          />

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        <Space.Compact direction="vertical" className="w-100">
          {/* <p>
          We recommend register using third party. Our email sending might not working properly lol
          so you can't reset password.
        </p> */}

          <Button icon={<GoogleOutlined />} onClick={() => registerWithProvider("google")} block>
            Register with Google
          </Button>

          <Button icon={<TwitterOutlined />} onClick={() => registerWithProvider("twitter")} block>
            Register with Twitter
          </Button>

          <Button icon={<DisconnectOutlined />} onClick={() => registerWithProvider("discord")} block>
            Register with Discord
          </Button>

          <Button icon={<GithubOutlined />} onClick={() => registerWithProvider("github")} block>
            Register with Github
          </Button>
        </Space.Compact>
      </RegisterFormContainer>
    );
  };
