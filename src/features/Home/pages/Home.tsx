import { useQuery } from "react-query";
import styled from "styled-components";
import { Typography, Spin, Segmented, Radio, Space, Modal, Button, message } from "antd";

import { PageContainer } from "../../../shared/components/shared";
import { axiosInstance, supabase } from "../../../config";
import { ChatEntityWithCharacter } from "../../../types/backend-alias";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../../appContext";
import { ChatList } from "../../../shared/components";
import { Link, useSearchParams } from "react-router-dom";
import {
  CharacterListWrapper,
  SearchParams,
} from "../../../shared/components/CharacterListWrapper";
import { ExclamationCircleOutlined, EyeFilled, EyeInvisibleFilled, HeartFilled } from "@ant-design/icons";
import { Helmet } from "react-helmet";
import { useTags } from "../../../hooks/useTags";
import { TagLink } from "../../../shared/components/TagLink";
import { IPAD_BREAKPOINT_CSS } from "../../../css-const";
import { getPage } from "../../../shared/services/utils";
import '../../../shared/css/ViewCharacter.css'

const { Title } = Typography;

interface ReactivationModalProps {
  visible: boolean; // Boolean to control modal visibility
  onClose: () => void; // Function to handle modal close action
  onReactivate: () => Promise<void>; // Function to handle reactivation
}

type Segment =
  | "latest"
  | "trending"
  | "newcomer"
  | "popular"
  | "nsfw"
  | "female"
  | "male"
  | "anime"
  | "game"
  | "tags";

const SegmentContainer = styled.div`
  max-width: 100%;
  overflow-x: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TagContainer = styled.div`
  .ant-tag {
    font-size: 1.25rem;
    line-height: 2rem;

    ${IPAD_BREAKPOINT_CSS} {
      font-size: 0.8rem;
      line-height: 1.25rem;
    }
  }
`;

export const Home: React.FC = () => {
  const { profile, localData, updateLocalData, isActivateModalVisible, setIsActivateModalVisible, loginUserEmail } = useContext(AppContext);
  const tags = useTags();

  const [searchParams, setSearchParams] = useSearchParams({
    segment: "latest",
    page: "1",
  });

  // Use search params as source of truth lol
  const [segment, setSegment] = useState<Segment>(searchParams.get("segment") as Segment);
  const [page, setPage] = useState(getPage(searchParams.get("page")));

  useEffect(() => {
    setSegment(searchParams.get("segment") as Segment);
    setPage(getPage(searchParams.get("page")));
  }, [searchParams]);
  const updateSearchParams = (newSearchParams: { segment: string; page: string }) => {
    setSearchParams(newSearchParams);
  };

  const params: SearchParams | undefined = useMemo(() => {
    const modeParams = { mode: localData.character_view || "sfw" };
    const userParams = { user_id: profile?.id };

    let is_nsfwParams = {};

    if (profile && profile.is_nsfw === true) {
      is_nsfwParams = { is_nsfw: true };
    }
    else is_nsfwParams = { is_nsfw: false }

    switch (segment) {
      case "latest":
        return { ...modeParams, ...is_nsfwParams, ...userParams };
      case "trending":
        return { special_mode: segment, ...modeParams, ...is_nsfwParams, ...userParams };
      case "newcomer":
        return { special_mode: segment, ...modeParams, ...is_nsfwParams, ...userParams };
      case "popular":
        return { sort: "popular", ...modeParams, ...is_nsfwParams, ...userParams };
      // Lol hard code for now
      case "female":
        return { tag_name: "Female", ...modeParams, ...is_nsfwParams, ...userParams };
      case "male":
        return { tag_name: "Male", ...modeParams, ...is_nsfwParams, ...userParams };
      case "anime":
        return { tag_name: "Anime", ...modeParams, ...is_nsfwParams, ...userParams };
      case "game":
        return { tag_name: "Game", ...modeParams, ...is_nsfwParams, ...userParams };
    }
  }, [segment, localData]);

  const { data: chatData, isLoading: isChatLoading } = useQuery(
    ["chats", profile?.id],
    async () => {
      if (profile?.id) {
        const responses = await supabase
          .from("chats")
          .select(
            "id, is_public, summary, updated_at, character_id, characters(name, description, avatar, is_nsfw)"
          )
          .order("updated_at", { ascending: false })
          .order("created_at", { ascending: false })
          .eq("user_id", profile?.id)
          .limit(4)
          .returns<ChatEntityWithCharacter[]>();


        console.log(responses, "responses")

        const chats = responses.data;
        return chats;
      }
    },
    { enabled: !!profile }
  );

  const ReactivationModal: React.FC<ReactivationModalProps> = ({ visible, onClose, onReactivate }) => (
    <Modal
      title={
        <Space>
          {/* <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: "24px" }} /> */}
          <Title style={{ fontSize: '24px' }}>Account Deactivated</Title>
        </Space>
      }
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="reactivate" type="primary" onClick={onReactivate}>
          Reactivate
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <div style={{ textAlign: "center" }}>
        <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: "48px", marginBottom: "16px" }} />
        <p style={{ fontSize: "16px", color: "#555" }}>
          Your account has been deactivated. Please reactivate it or contact support for help or permanent deletion.
        </p>
      </div>
    </Modal>
  );

  async function handleReactivate() {
    try {

      const response = await axiosInstance.post<any>(`/profiles/mine/reactivate`, {
        user_email: loginUserEmail
      });

      if (response.status === 200) {
        message.success("Your reactivation request has been sent successfully! Please try logging in again.");
        setIsActivateModalVisible(false);
        // Redirecting the user to the home page
        window.location.href = '/';
      } else {
        message.error("Failed to send reactivation request. Please try again.");
      }
    } catch (error) {
      message.error("An error occurred. Please check your connection and try again.");
    }
  }

  return (
    <PageContainer align="left">
      <Helmet>
        <title>Venus AI - Weeb Chat (for degenerate, and normal people too)</title>

        <meta
          name="description"
          content="Venus AI - Weeb Chat (for degenerate, and normal people too) at venusai.chat"
        />
        <meta
          property="og:title"
          content="Venus AI - Weeb Chat (for degenerate, and normal people too) at venusai.chat"
        />
        <meta
          property="og:description"
          content="Venus AI - Weeb Chat (for degenerate, and normal people too) at venusai.chat"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://venusai.chat" />
        <meta property="og:image" content="https://venusai.chat/logo.png" />
        <meta property="og:locale" content="en_EN" />
        <meta property="og:site_name" content="VenusAI" />

        <link rel="canonical" href="https://venusai.chat" />
      </Helmet>

      {profile && (
        <div>
          {isChatLoading && <Spin />}
          {chatData && chatData.length > 0 && (
            <div className="mb-4">
              <Title level={2}>
                Continue Chats <Link to="/my_chats">(All Chats)</Link>
              </Title>

              <ChatList size="small" chats={chatData} />
            </div>
          )}
        </div>
      )}

      <Radio.Group
        className="mb-4"
        defaultValue={localData.character_view || "sfw"}
        onChange={(e) => updateLocalData({ character_view: e.target.value })}
      >
        <Radio.Button value="all">
          <EyeFilled /> All
        </Radio.Button>
        {profile && profile.is_nsfw === true && (
          <>
            <Radio.Button value="sfw">
              <EyeInvisibleFilled /> SFW Only
            </Radio.Button>
            <Radio.Button value="nsfw">
              <HeartFilled /> NSFW Only
            </Radio.Button>
          </>
        )
        }
      </Radio.Group>

      <SegmentContainer>
        <Segmented
          value={segment}
          onChange={(value) => {
            updateSearchParams({ segment: String(value), page: "1" });
          }}
          options={[
            {
              label: "⚡️ Latest",
              value: "latest",
            },
            {
              label: "✨ Recent Hits",
              value: "newcomer",
            },
            {
              label: "⭐ Trending",
              value: "trending",
            },
            {
              label: "🔥 Most Popular",
              value: "popular",
            },
            {
              label: "👩‍🦰 Female",
              value: "female",
            },
            {
              label: "👨‍🦰 Male",
              value: "male",
            },
            {
              label: "📺 Anime",
              value: "anime",
            },
            {
              label: "🎮 Game",
              value: "game",
            },
            {
              label: "🌠 All Tags/Categories",
              value: "tags",
            },
          ]}
        />
      </SegmentContainer>

      {segment === "tags" ? (
        <TagContainer>
          <Space className="mt-4 " size={[2, 8]} wrap>
            {profile && profile.is_nsfw === true && tags && tags.length > 0 &&
              tags
                .map((tag) => (
                  <TagLink key={tag.id} tag={tag} />
                ))}
            {(!profile || profile.is_nsfw === false) && tags && tags.length > 0 &&
              tags
                .filter((tag) => tag.Classification_of_Tag === "SFW")
                .map((tag) => (
                  <TagLink key={tag.id} tag={tag} />
                ))}
          </Space>
        </TagContainer>
      ) : (
        <>
          {params?.special_mode === "trending" && (
            <p className="mt-4">
              ⭐ Trending shows <strong>popular characters with the most chat</strong>, created
              recently.
            </p>
          )}

          {params?.special_mode === "newcomer" && (
            <p className="mt-4">
              ⭐ Recent his shows <strong>popular characters with the most chat</strong>, created
              daily.
            </p>
          )}
          <CharacterListWrapper
            page={page}
            onPageChange={(newPage) => {
              updateSearchParams({ segment, page: String(newPage) });
            }}
            size="small"
            cacheKey="main_page"
            additionalParams={params}
          />
          <ReactivationModal
            visible={isActivateModalVisible ?? false}
            onClose={() => setIsActivateModalVisible(false)}
            onReactivate={handleReactivate}
          />
        </>
      )}
    </PageContainer>
  );
};
