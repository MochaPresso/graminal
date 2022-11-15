import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import styled from "styled-components";

const Terminal = () => {
  const [lines, setLines] = useState([]);
  const [command, setCommand] = useState("");
  const [directory, setDirectory] = useState("");
  const [cursorMoves, setCursorMoves] = useState(0);

  const refInput = useRef(null);

  useLayoutEffect(() => {
    refInput.current.focus();
  }, []);

  useEffect(() => {
    window.terminal.incomingData("terminal.incomingData", (data) => {
      setLines((value) => [...value, data]);
      setDirectory(data);
    });
  }, []);

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

      window.terminal.keyStroke("terminal.keyStroke", value);
    }
  };

  const convertSpace = (text) => {
    return text.replaceAll(" ", "\u00A0");
  };

  const handleChangeInput = (event) => {
    setCommand(convertSpace(event.target.value));
  };

  return (
    <TerminalStyled onClick={handleOnFocusSection}>
      <ul>
        {lines?.map((value, index) => (
          <LineStyled key={index}>{value}</LineStyled>
        ))}
        <InputLine>
          <InputTextBefore>{directory}</InputTextBefore>
          <LineStyled
            key="command"
            directory
            command
            input
            cursorMoves={cursorMoves}
          >
            {command}
          </LineStyled>
        </InputLine>
      </ul>
      <input
        ref={refInput}
        onKeyDown={handleKeyDown}
        onChange={handleChangeInput}
      />
    </TerminalStyled>
  );
};

const Color = {
  front: "#DADBDD",
  back: "#121212",
  alternative: "#F28482",
};

const fontWidth = 9.6;

const TerminalStyled = styled.div`
  font-family: Courier New;
  background: ${Color.back};
  height: 100vh;
  width: 100%;
  padding: 10px 30px;
  box-sizing: border-box;
  overflow: hidden auto;

  ul {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding-inline-start: 0;
    list-style: none;
  }

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

const InputLine = styled.div`
  display: flex;
`;

const InputTextBefore = styled.span`
  color: ${Color.front};
  left: -15px;
`;

const LineStyled = styled.li`
  display: inline-block;
  color: ${Color.front};
  min-height: 1rem;
  position: relative;
  word-break: break-all;
  white-space: ${({ banner }) => (banner ? "pre" : "initial")};
  padding-bottom: 0.5rem;

  span {
    color: ${Color.alternative};
  }

  :after {
    content: "";
    position: absolute;
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
