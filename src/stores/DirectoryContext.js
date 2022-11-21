import React, { createContext, useState } from "react";
import PropTypes from "prop-types";

export const DirectoryContextStore = createContext();

const DirectoryContext = ({ children }) => {
  const [currentDirectory, setCurrentDirectory] = useState(
    window.directory.homeDirectory(),
  );

  const Directory = {
    currentDirectory,
    setCurrentDirectory,
  };

  return (
    <DirectoryContextStore.Provider value={Directory}>
      {children}
    </DirectoryContextStore.Provider>
  );
};

export default DirectoryContext;

DirectoryContext.propTypes = {
  children: PropTypes.node.isRequired,
};
