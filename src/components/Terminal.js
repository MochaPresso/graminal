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
  const Directory = useContext(DirectoryContextStore);

  const [lines, setLines] = useState([]);
  const [beforeCommand, setBeforeCommand] = useState("");
  const [afterCommand, setAfterCommand] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

  const inputRef = useRef(null);
  const progressBarRef = useRef(false);
  const historyRef = useRef([]);
  const historyCountRef = useRef(0);
  const scrollRef = useRef();

  useLayoutEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    window.terminal.incomingData("terminal.incomingData", (data) => {
      validateOutput(data);
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines]);

  const scrollToBottom = () => {
    scrollRef.current.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  };

  const validateOutput = (data) => {
    const convert = new Convert();

    if (data.includes("\x1B[?25l(\x1B[107;97m") && data.includes("\x1B[?25h")) {
      progressBarRef.current = true;

      const splitData = data.split("\x1B[?25l");

      setLines((prevArray) => prevArray.slice(0, -1));
      setLines((prevArray) => [
        ...prevArray,
        convert.toHtml(splitData[0]).trim(),
        convert.toHtml(splitData[1]).trim(),
      ]);

      return;
    } else if (data.includes("\x1B[?25l(\x1B[107;97m")) {
      progressBarRef.current = true;

      setLines((prevArray) => [...prevArray, convert.toHtml(data).trim()]);

      return;
    } else if (progressBarRef.current && data.includes("\x1B[?25h")) {
      progressBarRef.current = false;

      setLines((prevArray) => prevArray.slice(0, -1));
      setLines((prevArray) => [
        ...prevArray,
        convert.toHtml(data.split("\x1B[?25h")[1]).trim(),
      ]);

      return;
    } else if (
      progressBarRef.current &&
      !data.includes("\x1B[100;90m") &&
      !data.includes("\x1B[107;97m")
    ) {
      progressBarRef.current = false;

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

    if (progressBarRef.current) {
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

    const changeDirectoryRegex = (reg) => {
      return new RegExp("^c\bcd\\s\\s*" + reg + "\\s*\x1B");
    };

    if (data.includes("[?2004l")) {
      if (changeDirectoryRegex("\\.{2}").test(data)) {
        Directory.currentDirectory.split("/").length > 2
          ? Directory.setCurrentDirectory((prevDirectory) =>
              prevDirectory.split("/").slice(0, -1).join("/"),
            )
          : Directory.setCurrentDirectory("/");
      } else if (changeDirectoryRegex("~{0,1}").test(data)) {
        Directory.setCurrentDirectory(window.directory.homeDirectory());
      } else if (changeDirectoryRegex("\\/").test(data)) {
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

    if (data.includes("\x1B[2J\x1B[3J\x1B[H")) {
      setLines([]);
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
    inputRef.current.focus();
  };

  const newLine = () => {
    const value = inputRef.current.value;

    historyRef.current.push(value);
    historyCountRef.current = historyRef.current.length;
    inputRef.current.value = "";
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

        if (historyCountRef.current > 0) {
          historyCountRef.current -= 1;
          inputRef.current.value = historyRef.current[historyCountRef.current];

          setBeforeCommand(inputRef.current.value);
          setAfterCommand("");
          setCursorPosition(inputRef.current.value.length);
        }
        break;
      case "ArrowDown":
        event.preventDefault();

        if (historyCountRef.current < historyRef.current.length) {
          historyCountRef.current += 1;
          inputRef.current.value = historyRef.current[historyCountRef.current];

          setBeforeCommand(inputRef.current.value);
          setAfterCommand("");
          setCursorPosition(inputRef.current.value.length);
        }

        if (historyCountRef.current === historyRef.current.length) {
          inputRef.current.value = "";

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
        inputRef.current.value = "";

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
      onDoubleClick={handleOnFocusSection}
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
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onChange={handleChangeInput}
      />
      <div ref={scrollRef} />
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
