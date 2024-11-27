import styled from "styled-components";
import { Helmet } from "react-helmet";
import { Typography, Space, Input, Select, Tag, Tooltip, Radio, Form } from "antd";

import { PageContainer } from "../../../shared/components/shared";
import { useTags } from "../../../hooks/useTags";
import { useContext, useState } from "react";
import {
  CharacterListWrapper,
  SearchParams,
} from "../../../shared/components/CharacterListWrapper";
import { IPAD_BREAKPOINT_CSS } from "../../../css-const";
import { EyeFilled, EyeInvisibleFilled, HeartFilled } from "@ant-design/icons";
import { AppContext } from "../../../appContext";
import { SITE_NAME } from "../../../config";
import { useParams } from "react-router-dom";
import { getRealId } from "../../../shared/services/utils";
import { tagUrl } from "../../../shared/services/url-utils";
import { TagLink } from "../../../shared/components/TagLink";

const { Title } = Typography;

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

export const SearchCharacter: React.FC = () => {
  const { tagId: seoFriendlyId } = useParams();
  const tagId = getRealId(seoFriendlyId);
  const { tagName: seoFriendlyName } = useParams();
  const tagName = getRealId(seoFriendlyName);

  const tags = useTags();
  const { profile, localData, updateLocalData } = useContext(AppContext);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    search: "",
    mode: localData.character_view || "sfw",
    sort: "latest",
    tag_id: tagId ? parseInt(tagId, 10) : undefined,
    tag_name: tagName ? tagName : undefined,
    is_nsfw: profile?.is_nsfw,
    user_id:profile?.id
  });

  const updateSearchParams = (params: SearchParams) => {
    updateLocalData({ character_view: params.mode })
    setSearchParams({ ...searchParams, ...params });
  };

  const [search, setSearch] = useState("");

  let title = "Search for characters";
  let canonial = `${location.origin}/search`;
  if (tags && tagId) {
    const tag = tags.find((tag) => tag.id === parseInt(tagId, 10));
    title = `Characters with tag ${tag?.name}`;
    canonial = `${location.origin}${tagUrl(tagId, tag?.name || "")}`;
  }

  return (
    <PageContainer align="left">
      <Helmet>
        <title>
          {SITE_NAME} - {title}
        </title>
      </Helmet>

      <Title level={3} className="mb-4">
        {title}
      </Title>

      <Form layout="inline">
        <Form.Item>
          <Radio.Group
            defaultValue={searchParams.mode}
            onChange={(e) => updateSearchParams({ mode: e.target.value })}
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
        </Form.Item>
        <Form.Item className="mb-xs-py" style={{ flexGrow: 3 }}>
          <Input.Search
            defaultValue=""
            value={search}
            placeholder="Enter or click to search"
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => updateSearchParams({ search: value })}
          />
        </Form.Item>
        <Form.Item className="flex-grow-1">
          <Select
            style={{ width: "100%", minWidth: "10rem" }}
            value={searchParams.sort}
            onChange={(value) => updateSearchParams({ sort: value })}
          >
            <Select.Option value="latest">Sort by latest</Select.Option>
            <Select.Option value="popular">Sort by most popular</Select.Option>
          </Select>
        </Form.Item>
      </Form>

      {/* <Row gutter={[0, 16]}>
        <Col xs={24} lg={7} className="text-left">
          <Radio.Group
            defaultValue={searchParams.mode}
            onChange={(e) => updateSearchParams({ mode: e.target.value })}
          >
            <Radio.Button value="all">
              <EyeFilled /> All
            </Radio.Button>
            <Radio.Button value="sfw">
              <EyeInvisibleFilled /> SFW Only
            </Radio.Button>
            <Radio.Button value="nsfw">
              <HeartFilled /> NSFW Only
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col xs={24} lg={12}>
          <Input.Search
            defaultValue=""
            value={search}
            placeholder="Enter or click to search"
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => updateSearchParams({ search: value })}
          />
        </Col>

        <Col xs={24} lg={5}>
          <Select
            style={{ width: "100%" }}
            value={searchParams.sort}
            onChange={(value) => updateSearchParams({ sort: value })}
          >
            <Select.Option value="latest">Sort by latest</Select.Option>
            <Select.Option value="popular">Sort by most popular</Select.Option>
          </Select>
        </Col>
      </Row> */}

      {tags && (
        // <TagContainer>
        //   <Space className="mt-4 " size={[2, 8]} wrap>
        //     {tags?.map((tag) => (
        //       <Tooltip key={tag.id} title={tag.description}>
        //         <Tag.CheckableTag
        //           key={tag.id}
        //           checked={tag.join_name === searchParams.tag_name}
        //           onChange={() => {
        //             if (tag.join_name === searchParams.tag_name) {
        //               updateSearchParams({ tag_name: undefined });
        //             } else {
        //               updateSearchParams({ tag_name: tag.join_name });
        //             }
        //           }}
        //         >
        //           {/* {tag.name} */}
        //           <TagLink tag={tag} marginInlineEnd={0}/>
        //         </Tag.CheckableTag>
        //       </Tooltip>
        //     ))}
        //   </Space>
        // </TagContainer>
        <TagContainer>
          <Space className="mt-4 " size={[2, 8]} wrap>
          {profile && profile.is_nsfw === true &&tags && tags.length > 0 &&
              tags
                .map((tag) => (
              <TagLink
                key={tag.id}
                tag={tag}
                isSelected={tag.join_name.toLowerCase() === searchParams.tag_name}
              />
            ))}
            {(!profile || profile.is_nsfw === false) &&tags && tags.length > 0 &&
              tags
                .filter((tag) => tag.Classification_of_Tag === "SFW")
                .map((tag) => (
              <TagLink
                key={tag.id}
                tag={tag}
                isSelected={tag.join_name.toLowerCase() === searchParams.tag_name}
              />
            ))}
          </Space>
        </TagContainer>
      )}

      <CharacterListWrapper size="small" cacheKey="search" additionalParams={searchParams} />
    </PageContainer>
  );
};
