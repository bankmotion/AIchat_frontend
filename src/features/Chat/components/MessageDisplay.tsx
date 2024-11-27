import { Image, Button, Input, InputRef, List, Popconfirm, Tooltip } from "antd";
import styled from "styled-components";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { MultiLineMarkdown } from "../../../shared/components/MultiLineMarkdown_Chat";
import { getAvatarUrl, getBotAvatarUrl } from "../../../shared/services/utils";
import { SupaChatMessage } from "../../../types/backend-alias";
import { useContext, useRef, useState } from "react";
import { formatChat } from "../services/chat-service";
import { AppContext } from "../../../appContext";

interface MessageDisplayProps {
  message: SupaChatMessage;
  user?: string;
  characterName?: string;

  characterAvatar?: string;
  userAvatar?: string;
  characterIsNsfw?:boolean;
  onEdit?: (messageId: number, newMessage: string) => void;
  onDelete?: (messageByCreatedAt: string) => void;

  onRegenerate?: (messageId: number) => void;
  canEdit: boolean;

  showRegenerate: boolean;
}

export const ChatControl = styled.div`
  opacity: 0.75;
  position: absolute;
  right: 0;
  top: 0.1rem;
`;

export const MessageDisplay: React.FC<MessageDisplayProps> = ({
  message,
  user,
  characterName,
  characterAvatar,
  userAvatar,
  characterIsNsfw,
  onEdit,
  onDelete,
  canEdit,
  showRegenerate,
  onRegenerate,
}) => {
  const inputRef = useRef<InputRef>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(message.message);
  const {profile} = useContext(AppContext);
  console.log(characterIsNsfw,"is_nsfw", profile?.is_blur,"profile.is_blur")

  return (
    <List.Item
      style={{ position: "relative" }}
      key={message.id}
      extra={
        canEdit && (
          <ChatControl>
            {isEditing ? (
              <>
                <Button
                  type="text"
                  shape="circle"
                  size="large"
                  onClick={() => {
                    setIsEditing(false);
                    onEdit?.(message.id, editMessage);
                  }}
                >
                  <CheckOutlined style={{ color: "#2ecc71" }} />
                </Button>
                <Button
                  type="text"
                  shape="circle"
                  size="large"
                  onClick={() => {
                    setIsEditing(false);
                    setEditMessage(message.message);
                  }}
                >
                  <CloseOutlined style={{ color: "#e74c3c", fontSize: "1.1rem" }} />
                </Button>
              </>
            ) : (
              <>
                {showRegenerate && (
                  <Tooltip title="Re-generate last massage">
                    <Button
                      type="text"
                      size="large"
                      shape="circle"
                      onClick={() => onRegenerate?.(message.id)}
                    >
                      <RedoOutlined />
                    </Button>
                  </Tooltip>
                )}

                {!message.is_bot && (
                  <Popconfirm
                    title="Delete chat"
                    description="This will delete all messages after this too?"
                    onConfirm={() => onDelete?.(message.created_at)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" size="large" shape="circle">
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                )}
                <Button
                  type="text"
                  size="large"
                  shape="circle"
                  onClick={() => {
                    setIsEditing(true);

                    setTimeout(() => {
                      inputRef?.current?.focus({
                        cursor: "start",
                      });
                    }, 100);
                  }}
                >
                  <EditOutlined />
                </Button>
              </>
            )}
          </ChatControl>
        )
      }
    >
      <List.Item.Meta
        avatar={
          <Image
            width={55}
            style={{ borderRadius: "0.5rem", filter: (message.is_bot && characterIsNsfw && (!profile || profile.is_blur)) ? "blur(25px)" : 'none'}}
            src={message.is_bot ? getBotAvatarUrl(characterAvatar) : getAvatarUrl(userAvatar)}
            preview={!!profile && !profile.is_blur}
            fallback="https://cvochnalpmpanziphini.supabase.co/storage/v1/object/public/bot-avatars/anon.jpg"
          />
        }
        title={message.is_bot ? characterName : user || "You"}
        description={
          isEditing ? (
            <Input.TextArea
              ref={inputRef}
              autoSize
              bordered={false}
              className="mt-0 px-0 py-0"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
            />
          ) : (
            <MultiLineMarkdown>
              {formatChat(message.message, user, characterName)}
            </MultiLineMarkdown>
          )
        }
      />
    </List.Item>
  );
};
