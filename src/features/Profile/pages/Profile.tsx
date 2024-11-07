import { useContext } from "react";
import { Typography, Spin, Button, Popconfirm, App } from "antd";
import { AppContext } from "../../../appContext";
import { ProfileForm } from "../components/ProfileForm";
import { PageContainer } from "../../../shared/components/shared";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { SITE_NAME, supabase } from "../../../config";
import { profileUrl } from "../../../shared/services/url-utils";
import { forEach } from "lodash-es";
const { Title } = Typography;

export const Profile = () => {
  const { message } = App.useApp();
  const { profile, setSession, setProfile } = useContext(AppContext);
  const navigate = useNavigate();

  console.log(profile,"sssdfdfd")

  // Just delete profile should be enough?
  const deleteAccount = async () => {
    message.info("Deleting your account...");
    if (!profile) {
      throw new Error("profile is undefined");
    }
    await supabase.from("user_reports").delete().eq("profile_id", profile?.id);
    await supabase.from("reviews").delete().eq("user_id", profile?.id);
    const {data, error } = await supabase.from('characters').select('id').eq("creator_id", profile?.id);
    console.log(data,"data")
    for (const characterId of data || []) {
      console.log(characterId,"characterId")
      await supabase.from("character_tags").delete().eq("character_id", characterId.id);
      await supabase.from("reviews").delete().eq("character_id", profile?.id);
  }
    await supabase.from("characters").delete().eq("creator_id", profile?.id);
    // await supabase.from("user_profiles").delete().eq("id", profile?.id);
    await supabase
    .from("user_profiles")
    .update({
        about_me: '',
        avatar: '',
        block_list: '',
        config: '',
        name: '',
        user_name: '',
        profile: ''
    })
    .eq("id", profile?.id);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);

    navigate("/");
    message.success("Account sucessfully deleted!");
  };

  console.log(profile,"profile")

  return (
    <PageContainer>
      <Helmet>
        <title>{SITE_NAME} - Profile</title>
      </Helmet>

      <Title level={2}>
        My Profile{" "}
        <Link to={profile ? profileUrl(profile.id, profile.user_name || profile.name) : "/"}>
          (Public Profile)
        </Link>
      </Title>

      {profile ? <ProfileForm values={profile} /> : <Spin />}

      <div className="text-right mt-10">
        <Popconfirm
          title="Delete your profile!"
          description="Are you sure you want to delete your profile? This will delete all your chats and characters!"
          onConfirm={deleteAccount}
        >
          <Button type="dashed" size="small" danger>
            Delete Profile
          </Button>
        </Popconfirm>
      </div>
    </PageContainer>
  );
};
