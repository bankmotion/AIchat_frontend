import { Markdown } from "./Markdown";
import styled from "styled-components";
import React, { useState, useContext } from "react";
import { AppContext } from "../../appContext";

const MarkdownContainer = styled.div<{ theme: "light" | "dark" }>`
  p {
    color: ${(props) => (props.theme === "light" ? "black" : "rgb(229, 224, 216)")};
    margin-bottom: 0.7rem;
    word-wrap: break-word;
  }

  img {
    max-height: 40vh;
    max-width: 40vw;
  }

  code {
    font-size: 0.9rem;
    letter-spacing: -0.5px;
  }

  em {
    color: #8f8e8e;
  }
  
  .toggle-button {
    color: ${(props) => (props.theme === "light" ? "#007BFF" : "#9CDCFE")};
    cursor: pointer;
    font-weight: bold;
    margin-top: 0.5rem;
  }
`;

export const MultiLineMarkdown: React.FC<{ children: string }> = ({ children }) => {
  const { localData } = useContext(AppContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleText = () => setIsExpanded((prev) => !prev);
  const limitedText = children.length > 160 && !isExpanded ? `${children.slice(0, 160)}...` : children;

  return (
    <MarkdownContainer theme={localData.theme}>
      {children.split("\n").map((text, index) => (
        <p key={index}>
          <Markdown>{text}</Markdown>
        </p>
      ))}
    </MarkdownContainer>
  );
};
