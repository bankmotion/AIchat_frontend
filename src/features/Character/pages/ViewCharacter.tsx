import {
  Typography,
  Spin,
  Row,
  Col,
  Image,
  App,
  Space,
  Tag,
  Tooltip,
  Button,
  Collapse,
  Descriptions,
  Badge,
  Dropdown,
  Popconfirm,
} from "antd";
import { useCallback, useContext, useState } from "react";
import {
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  LoadingOutlined,
  UserOutlined,
  WarningOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import { Helmet } from "react-helmet";
import { useQuery, useQueryClient } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { supabase } from "../../../config";
import { getBotAvatarUrl, getRealId, setPrerenderReady } from "../../../shared/services/utils";
import { ChatEntityWithCharacter } from "../../../types/backend-alias";
import { Tokenizer } from "../services/character-parse/tokenizer";
import { AppContext } from "../../../appContext";
import { PrivateIndicator } from "../../../shared/components/PrivateIndicator";
import { chatService } from "../../Chat/services/chat-service";
import '../../../shared/css/ViewCharacter.css'

import {
  ChatList,
  TagLink,
  MultiLine,
  PageContainer,
  VerifiedMark,
  MultiLineMarkdown,
  CharacterList,
} from "../../../shared/components";
import { exportCharacter, getCharacter, getCharacterReviews,getSimilarCharacters } from "../services/character-service";
import { Character } from "../services/character-parse/character";
import { Dislike, Like, ReviewPanel } from "../components/ReviewPanel";
import { characterUrl, profileUrl } from "../../../shared/services/url-utils";
import { CharacterReportModal } from "../components/CharacterReportModal";
import {
  DEFAULT_BLOCK_LIST,
  isBlocked,
  updateBlockList,
} from "../../Profile/services/profile-service";

const { Title } = Typography;

export const ViewCharacter: React.FC = () => {
  const queryClient = useQueryClient();
  const { characterId: seoFriendlyId } = useParams();
  const characterId = getRealId(seoFriendlyId);
  const { modal, message } = App.useApp();

  const navigate = useNavigate();
  const [openReportModal, setOpenReportModal] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const { profile } = useContext(AppContext);

  const { data: character, isLoading } = useQuery(
    ["view_character", characterId],
    async () => {
      console.log(profile?.id,"profile?.id")
      const character = await getCharacter(characterId!, profile?.id!);
      return character;
    },
    {
      enabled: !!characterId,
      retry: 1,
      onSuccess(data) {
        if (data) {
          setPrerenderReady();
        }
      },
    }
  );

  
  const { data: similarCharacters } = useQuery(
    ["view_similarCharacters", characterId],
    async () => {
      console.log(profile?.is_nsfw,"profile?.is_nsfw", characterId)
      const similarCharacters = await getSimilarCharacters(characterId!,profile?.id, profile?.is_nsfw);
      return similarCharacters;
    },
    {
      enabled: !!characterId,
      retry: 1,
      onSuccess(data) {
        if (data) {
          setPrerenderReady();
        }
      },
    }
  );

  console.log(similarCharacters,"similarCharacters")

  const { data: reviews, refetch: refetchReviews } = useQuery(
    ["view_character_reviews", characterId],
    async () => {
      const reviews = await getCharacterReviews(characterId!);
      console.log(reviews, "reviews")
      return reviews;
    },
    { enabled: Boolean(characterId && character && character.is_public) }
  );

  const canEdit = Boolean(profile && profile.id === character?.creator_id);

  const { data: chatData } = useQuery(
    ["public_chats", characterId],
    async () => {
      if (!characterId) {
        throw new Error("Character ID is undefined");
      }

      const responses = await supabase
        .from("chats")
        .select(
          "id, is_public, summary, updated_at, character_id, characters(name, description, avatar)"
        )
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false })
        .eq("is_public", true)
        .eq("character_id", characterId)
        .returns<ChatEntityWithCharacter[]>();

      const chats = responses.data;
      return chats;
    },
    { enabled: Boolean(characterId && character && character.is_public) }
  );

  const startChat = useCallback(async () => {
    if (!profile) {
      modal.info({
        title: "Login to start chat!",
        content: (
          <span>
            Please <a href="/login">Login</a> or <a href="/register">Register</a> so that your chats
            and settings can be saved!
          </span>
        ),
      });
      return;
    }

    try {
      setIsStartingChat(true);
      console.log("charaacterId", character?.id)
      const existingChat = await supabase
        .from("chats")
        .select("id")
        .match({ character_id: characterId, user_id: profile.id })
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (existingChat.data) {
        navigate(`/chats/${existingChat.data.id}`);
      } else {
        const newChat = await chatService.createChat(characterId!, profile.id!);

        if (newChat) {
          navigate(`/chats/${newChat.id}`);
        }
      }
    } catch (err) {
      message.error(JSON.stringify(err, null, 2));
    } finally {
      setIsStartingChat(false);
    }
  }, [profile, characterId]);

  const blockChar = useCallback(
    async (id: string) => {
      const currentBlockList = profile?.block_list || DEFAULT_BLOCK_LIST;
      currentBlockList.bots.push(id);

      if (profile?.id) {
        await updateBlockList(currentBlockList, profile.id, queryClient);

        message.success("Character has been blocked!");
      }

      else {
        message.error("An error occurred!");
      }

    },
    [profile]
  );

  const unblockChar = useCallback(
    async (id: string) => {
      const currentBlockList = profile?.block_list || DEFAULT_BLOCK_LIST;
      currentBlockList.bots = currentBlockList.bots.filter((botId) => botId !== id);
      if (profile?.id) {
        await updateBlockList(currentBlockList, profile.id, queryClient);

        message.success("Character has been unblocked!");
      }

      else {
        message.error("An error occurred!");
      }
    },
    [profile]
  );

  return (
    <PageContainer>
      {isLoading && <Spin />}
      {!isLoading && !character && (
        <p>Can not find this character. It might be deleted or set to private.</p>
      )}

      {character && (
        <Helmet>
          <title>
            {`Chat with ${character.name} - Total: ${character.stats?.chat} chats, ${character.stats?.message} messages`}
          </title>
          <meta
            property="og:title"
            content={`Chat with ${character.name} - Total: ${character.stats?.chat} chats, ${character.stats?.message} messages`}
          />
          <meta
            property="og:description"
            content={`Chat with ${character.name} - ${character.description}`}
          />
          <meta property="og:image" content={getBotAvatarUrl(character.avatar)} />
          <meta
            name="description"
            content={`Chat with ${character.name} - ${character.description}`}
          />
          <link
            rel="canonical"
            href={`${location.origin}${characterUrl(character.id, character.name)}`}
          />
        </Helmet>
      )}
      {character && (
        <Row gutter={16}>
          <Col lg={6} xs={24} className="text-left pt-2 pb-2 mb-2">
            <Title level={3}>
              <PrivateIndicator isPublic={character.is_public} /> {character.name}
            </Title>

            <Badge.Ribbon
              text={
                character.stats && (
                  <Tooltip
                    title={`Total: ${character.stats?.chat} chats, ${character.stats?.message} messages`}
                  >
                    <span>
                      <BookOutlined />
                      {character.stats?.chat} <WechatOutlined />
                      {character.stats?.message}
                    </span>
                  </Tooltip>
                )
              }
            >
              {character.is_nsfw ? <Image
                src={getBotAvatarUrl(character.avatar)}
                className={!profile || profile.is_blur ? "blurred-image" : ""} // Apply "blurred-image" if profile is missing or is_blur is true, otherwise set empty class
                preview={!!profile && !profile.is_blur} // Enable preview only if profile exists and is_blur is false
                style={{ pointerEvents: 'none' }}
              /> : <Image
                src={getBotAvatarUrl(character.avatar)} />}
            </Badge.Ribbon>

            <div className="mt-2">
              <Link target="_blank" to={profileUrl(character.creator_id, character.creator_name)}>
                <p>
                  @{character.creator_name}{" "}
                  {character.creator_verified && <VerifiedMark size="medium" />}
                </p>
              </Link>
              <MultiLineMarkdown>{character.description}</MultiLineMarkdown>
            </div>
            
            <Space size={[0, 8]} wrap>
              {character.is_nsfw ? <Tag color="error">🔞 NSFW</Tag> : ""}
              {"character_tags" in character && character.character_tags?.slice(0, 4).map((tag) => <TagLink tag={tag.tags} />)}
            </Space>
            <div className="mt-4">
              <Button
                type="primary"
                block
                onClick={startChat}
                style={{ whiteSpace: "normal", height: "auto" }}
                disabled={isStartingChat}
              >
                {isStartingChat ? <LoadingOutlined /> : <WechatOutlined />} Chat with{" "}
                {character.name} 🔒
              </Button>

              <Dropdown
                trigger={["click"]}
                className="mt-4"
                menu={{
                  items: [
                    {
                      label: "TavernAI Character Card",
                      key: "card",
                      icon: <UserOutlined />,
                    },
                    {
                      label: "Character JSON file",
                      key: "json",
                      icon: <UserOutlined />,
                    },
                  ],
                  onClick: (e) => {
                    const imgSrc = getBotAvatarUrl(character.avatar);
                    const charToExport = Character.fromCharacterView(character);
                    const author = {
                      id: character.creator_id,
                      username: character.creator_name,
                      link: profileUrl(character.creator_id, character.creator_name),
                    };
                    exportCharacter(e.key as "card" | "json", imgSrc, charToExport, author);
                  },
                }}
              >
                <Button block>
                  <DownloadOutlined />
                  Export character
                </Button>
              </Dropdown>
            </div>
          </Col>

          <Col lg={18} xs={24} className="text-left">
            <Collapse defaultActiveKey={["chats"]}>
              <Collapse.Panel
                header={`Character definition - May contains spoiler (Total ${Tokenizer.tokenCountFormat(
                  character.personality +
                  character.first_message +
                  character.scenario +
                  character.example_dialogs
                )}. Permanent: ${Tokenizer.tokenCountFormat(
                  character.personality + character.scenario
                )})`}
                key="definition"
              >
                <Descriptions bordered size="small" layout="vertical">
                  <Descriptions.Item
                    label={`Personality (${Tokenizer.tokenCountFormat(character.personality)})`}
                    span={3}
                  >
                    <MultiLine>{character.personality}</MultiLine>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`First Message (${Tokenizer.tokenCountFormat(character.first_message)})`}
                    span={3}
                  >
                    <MultiLine>{character.first_message}</MultiLine>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`Scenario (${Tokenizer.tokenCountFormat(character.scenario)})`}
                    span={3}
                  >
                    <MultiLine>{character.scenario}</MultiLine>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={`Example Dialogs (${Tokenizer.tokenCountFormat(
                      character.example_dialogs
                    )})`}
                    span={3}
                  >
                    <MultiLine>{character.example_dialogs}</MultiLine>
                  </Descriptions.Item>
                </Descriptions>
              </Collapse.Panel>

              <Collapse.Panel
                key="reviews"
                header={
                  reviews ? (
                    <span>
                      {reviews.filter((review) => (review.is_like != null)).length} reviews ({reviews.filter((review) => review.is_like).length}{" "}
                      {Like}, {reviews.filter((review) => (review.is_like == false)).length} {Dislike})
                    </span>
                  ) : (
                    <span>0 review</span>
                  )
                }
              >
                <ReviewPanel
                  reviews={reviews}
                  characterId={characterId}
                  creator={character.creator_id}
                  refetch={() => refetchReviews()}
                />
              </Collapse.Panel>

              {/* <Collapse.Panel header={`${chatData?.length || 0} shared public chats`} key="chats">
                {chatData && <ChatList chats={chatData} size="small" mode="view" />}
              </Collapse.Panel> */}
            </Collapse>

            <div className="mt-4 text-right">
              {canEdit ? (
                <Link to={`/edit_character/${character.id}`}>
                  <Button size="large" icon={<EditOutlined />}>
                    Edit character
                  </Button>
                </Link>
              ) : (
                <div>
                  {isBlocked(profile?.block_list, "bots", character.id) ? (
                    <Button
                      icon={<CheckCircleOutlined />}
                      onClick={() => unblockChar(character.id)}
                    >
                      Unblock
                    </Button>
                  ) : (
                    <Popconfirm
                      title={
                        <div>
                          You will not see this character anymore! <br /> You can unblock it later
                          in <Link to="/blocks">Blocks</Link> menu.
                        </div>
                      }
                      onConfirm={() => blockChar(character.id)}
                    >
                      <Button icon={<CloseCircleOutlined />}>Block</Button>
                    </Popconfirm>
                  )}

                  <Button
                    className="ml-2"
                    icon={<WarningOutlined />}
                    onClick={() => setOpenReportModal(true)}
                    danger
                  >
                    Report this!
                  </Button>

                  {characterId && openReportModal && (
                    <CharacterReportModal
                      characterId={characterId}
                      open={openReportModal}
                      onModalClose={() => setOpenReportModal(false)}
                    />
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="mt-8 text-left"><h1>Similar Characters</h1></div>
              <CharacterList size="small" characters={similarCharacters ??[]} />

            </div>
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};
