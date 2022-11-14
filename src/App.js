const App = () => {
  return (
    <div>
      This app is using Chrome (v${window.versions.chrome()}), Node.js (v$
      {window.versions.node()}
      ), and Electron (v${window.versions.electron()})
    </div>
  );
};

export default App;
