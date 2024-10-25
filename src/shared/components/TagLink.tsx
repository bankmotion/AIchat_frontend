import { Link } from "react-router-dom";
import { TagEntity } from "../../types/backend-alias";
import { Tag, Tooltip } from "antd";
import { tagUrl } from "../services/url-utils";

interface TagLinkProps {
  tag: TagEntity;
  isSelected?: boolean;
}

export const TagLink: React.FC<TagLinkProps> = ({ tag, isSelected = false }) => (
  <Link to={tagUrl(tag?.join_name, tag?.slug)} target="_blank">
    <Tooltip key={tag?.id} title={`${tag?.join_name} - Click to view more`}>
      <Tag
        style={{
          backgroundColor: isSelected ? "#1668dc" : undefined,
          color: isSelected ? "white" : undefined,
        }}
      >
        {tag?.name}
      </Tag>
    </Tooltip>
  </Link>
);
