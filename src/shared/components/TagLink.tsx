import { Link } from "react-router-dom";
import { TagEntity } from "../../types/backend-alias";
import { Tag, Tooltip } from "antd";
import { tagUrl } from "../services/url-utils";

export const TagLink: React.FC<{ tag: TagEntity, marginInlineEnd?: number }> = ({ tag, marginInlineEnd=0 }) => (
  <Link to={tagUrl(tag?.join_name, tag?.slug)} target="_blank">
    <Tooltip key={tag?.id} title={`${tag?.join_name} - Click to view more`}>
      <Tag>{tag?.name}</Tag>
    </Tooltip>
  </Link>
);
