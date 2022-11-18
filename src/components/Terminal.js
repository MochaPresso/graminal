import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import styled from "styled-components";
import Convert from "ansi-to-html";
import { sanitize } from "dompurify";

const Terminal = () => {
  const [lines, setLines] = useState([]);
  const [directory, setDirectory] = useState("");
  const [command, setCommand] = useState("");
  const [cursorMoves, setCursorMoves] = useState(0);

  const refInput = useRef(null);
  const refSaveText = useRef("");
  const refProgressBar = useRef(false);

  useLayoutEffect(() => {
    refInput.current.focus();
  }, []);

  useEffect(() => {
    window.terminal.incomingData("terminal.incomingData", (data) => {
      validateOutput(data);
    });
  }, []);

  const validateOutput = (data) => {
    const convert = new Convert();

    if (data.includes("[?25l")) {
      refProgressBar.current = true;

      setLines((prevArray) => [
        ...prevArray,
        convert
          .toHtml(data)
          .trim()
          .replaceAll(/(?:\?2004h)/g, ""),
      ]);

      return;
    } else if (
      refProgressBar.current &&
      !data.includes("[100;90m") &&
      !data.includes("[107;97m")
    ) {
      refProgressBar.current = false;

      setLines((prevArray) => prevArray.slice(0, -1));
      setLines((prevArray) => [
        ...prevArray,
        convert
          .toHtml(data)
          .trim()
          .replaceAll(/(?:\?2004h)/g, ""),
      ]);

      return;
    }

    if (refProgressBar.current) {
      setLines((prevArray) => prevArray.slice(0, -1));
      setLines((prevArray) => [
        ...prevArray,
        convert
          .toHtml(data)
          .trim()
          .replaceAll(/(?:\?2004h)/g, ""),
      ]);

      return;
    }

    if (data.includes("[?2004l") || data.includes("[7m%")) {
      return;
    }

    setLines((prevArray) => [
      ...prevArray,
      convert
        .toHtml(data)
        .trim()
        .replaceAll(/(?:\?2004h)/g, ""),
    ]);
    setDirectory(
      convert
        .toHtml(data)
        .trim()
        .replaceAll(/(?:\?2004h)/g, ""),
    );
  };

  const handleOnFocusSection = () => {
    refInput.current.focus();
  };

  const newLine = () => {
    const value = refInput.current.value;

    refInput.current.value = "";
    setCommand("");

    return value;
  };

  const updateCursor = (key) => {
    switch (key) {
      case "ArrowLeft":
        if (command.length > cursorMoves) {
          setCursorMoves(cursorMoves + 1);
        }
        break;
      case "ArrowRight":
        if (cursorMoves > 0) {
          setCursorMoves(cursorMoves - 1);
        }
        break;
      case "Delete":
        if (command.length >= cursorMoves) {
          setCursorMoves(cursorMoves - 1);
        }
        break;
      case "Tab":
        break;
      case "Home":
        setCursorMoves(command.length);
        break;
      case "End":
        setCursorMoves(0);
        break;
      case "Enter":
        setCursorMoves(0);
        break;
      default:
        break;
    }
  };

  const handleKeyDown = (event) => {
    updateCursor(event.key);

    if (event.key === "Enter") {
      const value = newLine();

      if (value === "clear" || value === "cls") {
        return setLines([]);
      }

      refSaveText.current = "";

      setLines((prevArray) => prevArray.slice(0, -1));
      setLines((lines) => [...lines, directory + value]);

      window.terminal.keyStroke("terminal.keyStroke", value);
    }
  };

  const convertSpace = (text) => {
    return text.replaceAll(" ", "\u00A0");
  };

  const handleChangeInput = (event) => {
    setCommand(convertSpace(event.target.value));
  };

  // eslint-disable-next-line react/prop-types
  const LineValue = ({ value }) => {
    return <LineStyled dangerouslySetInnerHTML={{ __html: sanitize(value) }} />;
  };

  return (
    <>
      <TerminalStyled onClick={handleOnFocusSection}>
        {lines?.map((value, index) => (
          <LineStyled key={index}>
            <LineValue value={value} />
            {lines.length - 1 === index && (
              <LineStyled directory command input cursorMoves={cursorMoves}>
                {command}
              </LineStyled>
            )}
          </LineStyled>
        ))}
        <input
          ref={refInput}
          onKeyDown={handleKeyDown}
          onChange={handleChangeInput}
        />
      </TerminalStyled>
    </>
  );
};

const Color = {
  front: "#DADBDD",
  back: "#121212",
};

const fontWidth = 9.6;

const TerminalStyled = styled.div`
  font-family: Courier New;
  background: ${Color.back};
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  padding: 10px 30px;
  box-sizing: border-box;
  overflow: hidden auto;

  input {
    display: inline-block;
    border: 0;
    clip: rect(1px, 1px, 1px, 1px);
    clip-path: inset(50%);
    height: 1px;
    width: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
  }
`;

const LineStyled = styled.span`
  margin: 0;
  color: ${Color.front};
  align-self: flex-start;
  white-space: pre-wrap;
  word-break: break-all;

  :after {
    content: "";
    width: ${fontWidth}px;
    height: 1rem;
    background: ${Color.front};
    opacity: 0.6;
    display: ${({ input }) => (input ? "inline-block" : "none")};
    margin-left: ${({ cursorMoves }) =>
      cursorMoves ? `-${cursorMoves * fontWidth}px` : 0};
  }
`;

export default Terminal;
