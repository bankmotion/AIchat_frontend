import { useContext, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { Typography, Input, Button, Form, Space, Modal, App } from "antd";
import {
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
  DisconnectOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { AppContext } from "../../../appContext";
import { SITE_NAME, supabase } from "../../../config";
import { Provider } from "@supabase/supabase-js";
import { Helmet } from "react-helmet";
import { Profile } from "../../../types/profile";

const { Title } = Typography;

interface FormValues {
  email: string;
  password: string;
}

const LoginFormContainer = styled.div`
  max-width: 440px;
  text-align: center;
  margin: 0 auto;
  padding: 1rem;
  padding-bottom: 2rem;
`;

export const Login = () => {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { setSession, setProfile } = useContext(AppContext);

  const onFinish = async ({ email, password }: FormValues) => {
    setIsSubmitting(true);

    try {
      const result = await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        // message.error(JSON.stringify(result.error, null, 2));
        message.error("Invalid login credentials.")
      } else {
        const { session } = result.data;
        if (session) {
          setSession(session);
          console.log(session.user.id);
          const profile = await supabase
            .from("user_profiles")
            .select('*')
            .eq("id", session.user.id)
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
              config: fetchedProfile.config
            };
            setProfile(validatedProfile);
          }
          else {
            console.error("Profile data is null or empty");
          }
          message.success("Logged in successfully.");
          navigate("/");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginWithProvider = async (provider: Provider) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: location.origin,
      },
    });
  };

  return (
    <LoginFormContainer>
      <Helmet>
        <title>{`${SITE_NAME} - Login`}</title>
        <meta name="description" content="Login into your account" />
      </Helmet>

      <Title level={2}>Login</Title>

      <Form form={form} onFinish={onFinish}>
        <Form.Item name="email" rules={[{ required: true, message: "Please enter your email." }]}>
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please enter your password." }]}
          help={
            <a onClick={() => setShowModal(true)} href="#">
              Forgot Password?
            </a>
          }
        >
          <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
        </Form.Item>

        <Form.Item className="pt-4">
          <Button type="primary" htmlType="submit" block loading={isSubmitting}>
            Login
          </Button>
        </Form.Item>
      </Form>

      <Space.Compact direction="vertical" className="w-100">
        <Button icon={<GoogleOutlined />} onClick={() => loginWithProvider("google")} block>
          Login with Google
        </Button>

        <Button icon={<TwitterOutlined />} onClick={() => loginWithProvider("twitter")} block>
          Login with Twitter
        </Button>

        <Button icon={<DisconnectOutlined />} onClick={() => loginWithProvider("discord")} block>
          Login with Discord
        </Button>
        <Button icon={<GithubOutlined />} onClick={() => loginWithProvider("github")} block>
          Login with Github
        </Button>
      </Space.Compact>

      <Modal
        title="Please enter your email"
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={async () => {
          try {
            setIsSubmitting(true);
            const result = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${location.origin}/reset_password`,
            });
            if (result.error) {
              message.error(JSON.stringify(result.error, null, 2));
            } else {
              message.info(
                "If your email exists in our system, you will receive an email to reset password soon!"
              );
              setShowModal(false);
            }

            return result;
          } finally {
            setIsSubmitting(false);
          }
        }}
        okText="Reset Password"
        okButtonProps={{ disabled: email.length === 0 || isSubmitting, loading: isSubmitting }}
      >
        <Input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Modal>
    </LoginFormContainer>
  );
};
