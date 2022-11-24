import React, {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useContext,
} from "react";
import styled from "styled-components";
import Convert from "ansi-to-html";
import PropTypes from "prop-types";
import { sanitize } from "dompurify";
import { DirectoryContextStore } from "../stores/DirectoryContext";

const Terminal = ({ isSideBarToggle }) => {
  const [lines, setLines] = useState([]);
  const [beforeCommand, setBeforeCommand] = useState("");
  const [afterCommand, setAfterCommand] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

  const refInput = useRef(null);
  const refProgressBar = useRef(false);
  const refHistory = useRef([]);
  const refHistoryCount = useRef(0);

  const Directory = useContext(DirectoryContextStore);

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

    if (data.includes("[?2004l")) {
      if (data.includes("c\bcd ..\x1B")) {
        Directory.currentDirectory.split("/").length > 2
          ? Directory.setCurrentDirectory((prevDirectory) =>
              prevDirectory.split("/").slice(0, -1).join("/"),
            )
          : Directory.setCurrentDirectory("/");
      } else if (data.includes("c\bcd ~\x1B") || data.includes("c\bcd \x1B")) {
        Directory.setCurrentDirectory(window.directory.homeDirectory());
      } else if (data.includes("c\bcd /\x1B")) {
        Directory.setCurrentDirectory("/");
      } else if (data.includes("c\bcd ") && !data.includes("cd: no such")) {
        Directory.setCurrentDirectory(
          (prevDirectory) =>
            prevDirectory +
            "/" +
            data.split("c\bcd ")[1].split("\x1B[?2004l")[0],
        );
      }

      data =
        data.trim().split("\x1B[?2004l")[1] !== ""
          ? data.trim().split("\x1B[?2004l")[1]
          : "";
    }

    if (data.includes("\x1B[m\x1B[m\x1B[m\x1B[J")) {
      const splitData = data.split("\x1B[m\x1B[m\x1B[m\x1B[J");

      return setLines((prevArray) => [
        ...prevArray,
        convert.toHtml(
          splitData[0].replace("\x1B[1m\x1B[7m%\x1B[m\x1B[1m\x1B[m", "").trim(),
        ),
        convert.toHtml(splitData[1].replace("\x1B[K\x1B[?2004h", "")),
      ]);
    }

    return setLines((prevArray) => [
      ...prevArray,
      convert
        .toHtml(data)
        .trim()
        .replaceAll(/(?:\?2004h)/g, ""),
    ]);
  };

  const handleOnFocusSection = () => {
    refInput.current.focus();
  };

  const newLine = () => {
    const value = refInput.current.value;

    refHistory.current.push(value);
    refHistoryCount.current = refHistory.current.length;
    refInput.current.value = "";
    setBeforeCommand("");
    setAfterCommand("");
    setCursorPosition(0);

    return value;
  };

  const updateTextInputArea = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        if (beforeCommand.length > 0) {
          const char = beforeCommand[beforeCommand.length - 1];
          setBeforeCommand((text) => text.slice(0, -1));
          setAfterCommand((text) => char + text);
          setCursorPosition((position) => position - 1);
        }
        break;
      case "ArrowRight":
        if (afterCommand.length > 0) {
          const char = afterCommand[0];
          setBeforeCommand((text) => text + char);
          setAfterCommand((text) => text.slice(1));
          setCursorPosition((position) => position + 1);
        }
        break;
      case "ArrowUp":
        event.preventDefault();

        if (refHistoryCount.current > 0) {
          refHistoryCount.current -= 1;
          refInput.current.value = refHistory.current[refHistoryCount.current];

          setBeforeCommand(refInput.current.value);
          setAfterCommand("");
          setCursorPosition(refInput.current.value.length);
        }
        break;
      case "ArrowDown":
        event.preventDefault();

        if (refHistoryCount.current < refHistory.current.length) {
          refHistoryCount.current += 1;
          refInput.current.value = refHistory.current[refHistoryCount.current];

          setBeforeCommand(refInput.current.value);
          setAfterCommand("");
          setCursorPosition(refInput.current.value.length);
        }

        if (refHistoryCount.current === refHistory.current.length) {
          refInput.current.value = "";

          setBeforeCommand("");
          setAfterCommand("");
          setCursorPosition(0);
        }
        break;
      case "Enter":
        setCursorPosition(0);
        break;
      default:
        break;
    }
  };

  const handleKeyDown = (event) => {
    updateTextInputArea(event);

    if (event.key === "Enter") {
      const value = newLine();
      const currentDirectory =
        Directory.currentDirectory === window.directory.homeDirectory()
          ? "~"
          : Directory.currentDirectory.split("/").pop();

      if (value === "clear" || value === "cls") {
        return setLines([
          `${window.terminal.terminalUserName()} ${currentDirectory} % `,
        ]);
      }

      lines[lines.length - 1] = lines[lines.length - 1] + value;

      setLines(lines);
      window.terminal.keyStroke("terminal.keyStroke", value);
    }

    if (event.ctrlKey) {
      if (event.key === "u") {
        refInput.current.value = "";

        setBeforeCommand("");
        setAfterCommand("");
        setCursorPosition(0);

        return;
      } else if (event.key === "c") {
        window.terminal.keyStroke("terminal.keyStroke", "\x03");
      }
    }
  };

  const convertSpace = (text) => {
    return text.replaceAll(" ", "\u00A0");
  };

  const handleChangeInput = (event) => {
    setCursorPosition(event.target.selectionStart - 1);
    setBeforeCommand(
      convertSpace(event.target.value.slice(0, event.target.selectionStart)),
    );
    setAfterCommand(
      convertSpace(event.target.value.slice(event.target.selectionStart)),
    );
  };

  const LineValue = ({ value }) => {
    return <LineStyled dangerouslySetInnerHTML={{ __html: sanitize(value) }} />;
  };

  LineValue.propTypes = {
    value: PropTypes.string,
  };

  return (
    <TerminalContainer
      onClick={handleOnFocusSection}
      isSideBarToggle={isSideBarToggle}
    >
      {lines?.map((value, index) => (
        <LineStyled key={index}>
          <LineValue value={value} />
          {lines.length - 1 === index && (
            <LineStyled beforeCommand afterCommand>
              <span>{beforeCommand}</span>
              <Caret cursorPosition={cursorPosition} />
              <span>{afterCommand}</span>
            </LineStyled>
          )}
        </LineStyled>
      ))}
      <input
        ref={refInput}
        onKeyDown={handleKeyDown}
        onChange={handleChangeInput}
      />
    </TerminalContainer>
  );
};

const Color = {
  font: "#DADBDD",
  background: "#121212",
};

const fontWidth = 9.6;

const TerminalContainer = styled.div`
  font-family: Courier New;
  background: ${Color.background};
  position: fixed;
  display: flex;
  align-items: center;
  flex-direction: column;
  right: 0;
  height: 100vh;
  width: ${({ isSideBarToggle }) => (isSideBarToggle ? "80vw" : "100vw")};
  max-width: ${({ isSideBarToggle }) =>
    isSideBarToggle ? `calc(100% - 200px)` : "100%"};
  padding: 10px 20px;
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

const Caret = styled.div`
  display: inline-block;
  position: absolute;
  width: ${fontWidth}px;
  height: 1rem;
  background: ${Color.font};
  opacity: 0.6;
`;

const LineStyled = styled.span`
  margin: 0;
  color: ${Color.font};
  align-self: flex-start;
  white-space: pre-wrap;
  word-break: break-all;
`;

export default Terminal;

Terminal.propTypes = {
  isSideBarToggle: PropTypes.bool.isRequired,
};
