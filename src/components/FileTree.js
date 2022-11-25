import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import ContextMenuArea from "./menu/ContextMenu";
import COLORS from "../constants/COLORS";
import { FaFolder, FaFolderOpen, FaFile } from "react-icons/fa";

const FileTree = ({ directory, depth }) => {
  const [files, setFiles] = useState([]);
  const [showNested, setShowNested] = useState({});

  useEffect(() => {
    (async () => {
      const showDirectory = await window.directory.directoryContents(directory);

      setFiles(showDirectory);
    })();
  }, [directory]);

  const toggleNested = (directory) => {
    setShowNested({ ...showNested, [directory]: !showNested[directory] });
  };

  return (
    <Container>
      {files &&
        files.map((entry) =>
          entry.type === "directory" ? (
            <FolderStyled key={entry.name}>
              <ContextMenuArea
                directory={`${directory}/${entry.name}`}
                existJsonFile={entry.existJsonFile}
                scriptsList={entry.scriptsList}
              >
                <FolderContainer depth={depth}>
                  {showNested[entry.name] ? (
                    <FaFolderOpen size={16} color={COLORS.FONT} />
                  ) : (
                    <FaFolder size={16} color={COLORS.FONT} />
                  )}
                  <FolderButtonStyled
                    onClick={() => toggleNested(entry.name)}
                    depth={depth}
                  >
                    {entry.name}
                  </FolderButtonStyled>
                </FolderContainer>
              </ContextMenuArea>
              {showNested[entry.name] && (
                <FileTree
                  directory={`${directory}/${entry.name}`}
                  depth={depth + 1}
                />
              )}
            </FolderStyled>
          ) : (
            <FileContainer depth={depth}>
              <FaFile size={13.5} color={COLORS.FONT} />
              <FileStyled key={entry.name} depth={depth}>
                {entry.name}
              </FileStyled>
            </FileContainer>
          ),
        )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FolderContainer = styled.div`
  display: inline-flex;
  width: 100%;
  align-items: flex-start;
  padding-left: ${({ depth }) => `calc(${depth} * 12px + 5px)`};
  cursor: pointer;

  :hover {
    background-color: ${COLORS.HOVER_COLOR};
  }
`;

const FileContainer = styled.div`
  display: inline-flex;
  width: 100%;
  align-items: flex-start;
  padding-left: ${({ depth }) => `calc(${depth} * 12px + 5px)`};
`;

const FolderStyled = styled.div`
  display: inline-block;
  width: inherit;
  min-width: inherit;
`;

const FolderButtonStyled = styled.div`
  color: ${COLORS.FONT};
  width: inherit;
  min-width: inherit;
  font-size: 15px;
  margin-left: 5px;
`;

const FileStyled = styled.div`
  color: ${COLORS.FONT};
  display: inline-block;
  width: inherit;
  min-width: inherit;
  font-size: 14px;
  margin-left: 5px;
`;

export default FileTree;

FileTree.propTypes = {
  directory: PropTypes.string.isRequired,
  depth: PropTypes.number.isRequired,
};
