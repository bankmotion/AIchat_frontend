import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Spin, App, Select, List, Avatar, Tag } from "antd";

import { AppContext } from "../../../appContext";
import { PageContainer } from "../../../shared/components/shared";
import { Helmet } from "react-helmet";
import { SITE_NAME, axiosInstance, supabase } from "../../../config";
import {
  DEFAULT_BLOCK_LIST,
  getBlockedContent,
  updateBlockList,
} from "../services/profile-service";
import { BlockedContent } from "../../../types/backend-alias"
import { useQuery, useQueryClient } from "react-query";
import { useTags } from "../../../hooks/useTags";
import { CheckCircleOutlined } from "@ant-design/icons";
import { getAvatarUrl, getBotAvatarUrl } from "../../../shared/services/utils";
import { characterUrl, profileUrl } from "../../../shared/services/url-utils";
import { Link } from "react-router-dom";
const { Title } = Typography;

export const Blocks = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { profile } = useContext(AppContext);
  const [data, setData] = useState<BlockedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const tags = useTags();
  const navigate = useNavigate();

  console.log(profile, "profile", Boolean(profile))

  useEffect(() => {
    // Function to fetch blocked content
    const fetchBlockedContent = async () => {
      try {
        setIsLoading(true);

        // Ensure profile exists before attempting to fetch
        if (profile?.id) {
          const response = await axiosInstance.get<BlockedContent>(`/profiles/mine/blocked?id=${profile.id}`);
          const botIds = response.data.bots;
          console.log(botIds, "botIds")

          const botData = await Promise.all(
            botIds.map(async (botId: string) => {
              const result = await supabase
                .from("characters")
                .select("id,name, is_nsfw, description, avatar")
                .eq("id", botId)
                .limit(1)
                .single();
              return result.data;
            })
          );

          console.log(botData, "botData");
          const creatorIds = response.data.creators;
          const creatorData = await Promise.all(
            creatorIds.map(async (creatorId: string) => {
              const result = await supabase
                .from("user_profiles")
                .select("id, name, user_name, avatar")
                .eq("id", creatorId)
                .limit(1)
                .single();
              return result.data;
            })
          );
          console.log(creatorData, "creatorData");
          const tagData = response.data.tags;
          console.log(response.data.creators, response.data.tags)
          // Combining them into a single data object
          const data = {
            bots: botData,
            creators: creatorData,
            tags: tagData
          };

          console.log(data);
          setData(data); // Set fetched data in state
        } else {
          throw new Error("Profile not available");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlockedContent(); // Call the fetch function

  }, [profile]);

  // const { data, isLoading } = useQuery(["profile-blocked"], () => getBlockedContent(), {
  //   enabled: Boolean(profile),
  // });
  console.log(data, "data")


  const unblockCreator = useCallback(
    async (creatorId: string, creatorName: string) => {
      const currentBlockList = profile?.block_list || DEFAULT_BLOCK_LIST;
      currentBlockList.creators = currentBlockList.creators.filter((id) => id !== creatorId);
      const id = profile?.id ?? ""
      await updateBlockList(currentBlockList, id, queryClient);
      navigate(0);
      message.success(`Creator ${creatorName} has been unblocked!`);
    },
    [profile]
  );

  const unblockCharacter = useCallback(
    async (characterId: string, characterName: string) => {
      const currentBlockList = profile?.block_list || DEFAULT_BLOCK_LIST;
      currentBlockList.bots = currentBlockList.bots.filter((id) => id !== characterId);
      const id = profile?.id ?? ""
      await updateBlockList(currentBlockList, id, queryClient);
      navigate(0);
      message.success(`Character ${characterName} has been unblocked!`);
    },
    [profile]
  );

  const tagChanged = useCallback(
    async (tagIds: number[]) => {
      const currentBlockList = profile?.block_list || DEFAULT_BLOCK_LIST;
      currentBlockList.tags = tagIds;
      const id = profile?.id ?? ""

      await updateBlockList(currentBlockList, id, queryClient);
      navigate(0);
      message.success(`Blocked Tags has been updated!`);
    },
    [profile]
  );

  console.log({ data, tags });

  return (
    <PageContainer align="left">
      <Helmet>
        <title>{SITE_NAME} - Block List</title>
      </Helmet>

      <Title level={2}>My blocks</Title>

      {isLoading && <Spin />}

      {data && (
        <div>
          <Title level={4}>Blocked Tags ({data.tags.length})</Title>

          <Select
            style={{ minWidth: "30rem" }}
            mode="multiple"
            placeholder="Block a tag, or remove it from block list"
            optionLabelProp="label"
            value={data?.tags}
            onChange={tagChanged}
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLocaleLowerCase()
                .includes(input.toLocaleLowerCase())
            }
          >
            {tags &&
              tags.map((tag) => (
                <Select.Option key={tag.id} value={tag.orderId} label={tag.name} target="_blank">
                  {tag.name} ({tag.description})
                </Select.Option>
              ))}
          </Select>

          <Title className="mt-4" level={4}>
            Blocked Creators ({data.creators.length})
          </Title>
          <List
            itemLayout="horizontal"
            dataSource={data.creators}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a
                    key="unblock"
                    onClick={() => unblockCreator(item.id, item.user_name || item.name)}
                  >
                    <CheckCircleOutlined /> Unblock
                  </a>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={getAvatarUrl(item.avatar)} />}
                  title={
                    <Link to={profileUrl(item.id, item.user_name || item.name)}>
                      {item.user_name || item.name}
                    </Link>
                  }
                />
              </List.Item>
            )}
          />

          <Title className="mt-4" level={4}>
            Blocked Characters ({data.bots.length})
          </Title>
          <List
            itemLayout="horizontal"
            dataSource={data.bots}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <a key="unblock" onClick={() => unblockCharacter(item.id, item.name)}>
                    <CheckCircleOutlined /> Unblock
                  </a>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={getAvatarUrl(item.avatar)} />}
                  title={
                    <Link to={characterUrl(item.id, item.name)} target="_blank">
                      {item.name} {item.is_nsfw ? <Tag color="error">🔞 NSFW</Tag> : ""}
                    </Link>
                  }
                  description={<span>{item.description}</span>}
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </PageContainer>
  );
};
