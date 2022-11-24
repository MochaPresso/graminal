import React, { useEffect, useRef, useContext } from "react";
import PropTypes from "prop-types";
import { DirectoryContextStore } from "../../stores/DirectoryContext";

const ContextMenuArea = ({
  children,
  directory,
  existJsonFile,
  scriptsList,
}) => {
  const Directory = useContext(DirectoryContextStore);

  const refRootElement = useRef();

  const moveDirectory = window.directory.relativePath(
    Directory.currentDirectory,
    directory,
  );

  useEffect(() => {
    refRootElement.current.addEventListener("contextmenu", (event) => {
      event.preventDefault();

      window.sideBar.showContextMenu("sideBar.showContextMenu", {
        moveDirectory,
        existJsonFile,
        scriptsList,
      });
    });
  }, []);

  return <div ref={refRootElement}>{children}</div>;
};

export default ContextMenuArea;

ContextMenuArea.propTypes = {
  children: PropTypes.node,
  directory: PropTypes.string.isRequired,
  existJsonFile: PropTypes.bool.isRequired,
  scriptsList: PropTypes.array,
};
