import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import { WechatOutlined, DeleteOutlined, ClockCircleOutlined, EyeFilled } from "@ant-design/icons";
import { Card, Popconfirm, Tooltip } from "antd";
import { truncate } from "lodash-es";

import { getBotAvatarUrl, getTimeAgo } from "../services/utils";
import { PrivateIndicator } from "./PrivateIndicator";
import { ChatEntityWithCharacter } from "../../types/backend-alias";
import { chatService, formatChat } from "../../features/Chat/services/chat-service";
import { characterUrl } from "../services/url-utils";

interface ChatListProps {
  chats: ChatEntityWithCharacter[];
  size?: "small" | "medium";
  mode?: "view" | "manage";
  onChatDeleted?: () => {};
}

const BotAvatar = styled.img`
  max-width: 5rem;
  aspect-ratio: 1/1.5;
  object-fit: cover;
  object-position: top;
  border-radius: 1rem;
`;

const ChatListContainer = styled.div<{ size: "small" | "medium" }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
  grid-gap: 1.25rem;
  align-items: stretch;

  ${(props) =>
    props.size === "small" &&
    css`
      grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
      grid-gap: 1rem;

      .ant-card-body,
      .ant-card-meta-title {
        font-size: 0.8rem;
      }

      .ant-card-actions li {
        margin: 0.25rem 0;
      }
    `}
`;

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  onChatDeleted,
  size = "medium",
  mode = "manage",
}) => {
  const deleteChat = async (chatId: number) => {
    await chatService.deleteChat(chatId);
    onChatDeleted?.();
  };

  return (
    <ChatListContainer size={size}>
      {chats.map((chat) => (
        <Card
          key={chat.id}
          className="d-flex flex-column"
          size="small"
          actions={[
            <span>
              <a href={`/chats/${chat.id}`} target="_blank">
                {mode === "manage" ? (
                  <span>
                    <WechatOutlined /> Continue
                  </span>
                ) : (
                  <span>
                    <EyeFilled /> View
                  </span>
                )}
              </a>
            </span>,

            onChatDeleted ? (
              <Popconfirm
                title="Delete this chat"
                description="Are you sure to delete this chat?"
                onConfirm={() => deleteChat(chat.id)}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined /> Delete
              </Popconfirm>
            ) : undefined,
          ].filter((a) => a)}
        >
          <Card.Meta
            avatar={<BotAvatar alt="" src={getBotAvatarUrl(chat.characters?.avatar || "")} />}
            title={
              <Link
                to={
                  chat.characters?.name
                    ? characterUrl(chat.character_id, chat.characters.name)
                    : "#"
                }
              >
                <PrivateIndicator isPublic={chat.is_public} />{" "}
                {chat.characters?.name || "Private bot"}
              </Link>
            }
            // Change to summary later
            description={
              <div>
                {chat.summary ? (
                  chat.characters ? (
                    <Tooltip title={formatChat(chat.summary, "you", chat.characters.name)}>
                      <p>
                        Summary:{" "}
                        {truncate(formatChat(chat.summary, "you", chat.characters.name), {
                          length: 150,
                        })}
                      </p>
                    </Tooltip>
                  ) : (
                    <p>This character is private or removed. You can still continue your chat.</p>
                  )
                ) : (
                  <p>
                    {truncate(
                      chat.characters
                        ? chat.characters.description
                        : "This character is private or removed. You can still continue your chat.",
                      { length: 150 }
                    )}
                  </p>
                )}
                <p>
                  { chat.updated_at && <><ClockCircleOutlined /> {getTimeAgo(chat.updated_at)} ago </>}
                </p>
              </div>
            }
          />
        </Card>
      ))}
    </ChatListContainer>
  );
};
