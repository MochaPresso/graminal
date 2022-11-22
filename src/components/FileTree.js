import React, { useEffect, useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const FileTree = ({ directory }) => {
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
            <>
              <FolderStyled key={entry.name}>
                <FolderButtonStyled onClick={() => toggleNested(entry.name)}>
                  {entry.name}
                </FolderButtonStyled>
                {showNested[entry.name] && (
                  <FileTree directory={`${directory}/${entry.name}`} />
                )}
              </FolderStyled>
            </>
          ) : (
            <FileStyled key={entry.name}>{entry.name}</FileStyled>
          ),
        )}
    </Container>
  );
};

const Color = {
  font: "#DADBDD",
  headerBackground: "#585858",
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FolderStyled = styled.div`
  display: inline-block;
  width: inherit;
  min-width: inherit;
  padding-left: 10px;
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
  padding-left: 10px;
`;

export default FileTree;

FileTree.propTypes = {
  directory: PropTypes.string.isRequired,
};
