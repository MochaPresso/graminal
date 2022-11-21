import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { DirectoryContextStore } from "../stores/DirectoryContext";

const FileTree = () => {
  const [files, setFiles] = useState([]);

  const Directory = useContext(DirectoryContextStore);

  useEffect(() => {
    (async () => {
      const moveDirectory = await window.directory.directoryContents(
        Directory.currentDirectory,
      );

      setFiles(moveDirectory);
    })();
  }, [Directory.currentDirectory]);

  const navigate = (path) => {
    if (Directory.currentDirectory === "/") {
      Directory.setCurrentDirectory("/" + path);
    } else {
      Directory.setCurrentDirectory(Directory.currentDirectory + "/" + path);
    }
  };

  return (
    <>
      <DirectoryHeader>
        {Directory.currentDirectory.split("/").pop()}
      </DirectoryHeader>
      <Container>
        {files &&
          files.map((entry, i) =>
            entry.type === "directory" ? (
              <FolderStyled key={i}>
                <FolderButtonStyled onDoubleClick={() => navigate(entry.name)}>
                  {entry.name}
                </FolderButtonStyled>
              </FolderStyled>
            ) : (
              <FileStyled key={i}>{entry.name}</FileStyled>
            ),
          )}
      </Container>
    </>
  );
};

const Color = {
  font: "#DADBDD",
  headerBackground: "#585858",
};

const DirectoryHeader = styled.div`
  display: flex;
  position: fixed;
  width: inherit;
  min-width: inherit;
  border: 5px solid ${Color.headerBackground};
  background-color: ${Color.headerBackground};
  box-sizing: border-box;
  color: ${Color.font};
`;

const Container = styled.div`
  margin-top: 30px;
`;

const FolderStyled = styled.div`
  display: flex;
  width: inherit;
  min-width: inherit;
`;

const FolderButtonStyled = styled.div`
  color: ${Color.font};
  width: inherit;
  min-width: inherit;
  cursor: pointer;

  :hover {
    background-color: blue;
  }
`;

const FileStyled = styled.div`
  color: ${Color.font};
  font-size: 12px;
`;

export default FileTree;
