// create the editor
document.addEventListener('DOMContentLoaded', () => {
  createJsonEditorByStore('config');
  createJsonEditorByFile('commandsMZ');
  createJsonEditorByFile('commandsMV');
});

function createJsonEditorByStore(configJsonParam) {
  const container = document.getElementById(configJsonParam);
  const options = {
    mode: 'tree',
    search: true,
    enableTransform: false,
    onChangeJSON: function (json) {
      Store.set(configJsonParam, json);
      console.dir(json);
    },
  };
  const editor = new JSONEditor(container, options);
  const initialJson = Store.get(configJsonParam);
  editor.set(initialJson);

  editor.expandAll();
}

function createJsonEditorByFile(fileName) {
  const container = document.getElementById(fileName);
  const options = {
    mode: 'tree',
    search: true,
    enableSort: false,
    enableTransform: false,
    onChangeJSON: function (json) {
      const str = JSON.stringify(json, 'utf-8');
      Fs.writeExcludeFileSync(fileName + '.json', str)
      console.dir(json);
    },
  };
  const editor = new JSONEditor(container, options);
  const initialJson = JSON.parse(Fs.readExcludeFileSync('\\' + fileName + '.json', 'utf8'));
  editor.set(initialJson);

  editor.expandAll();
}
