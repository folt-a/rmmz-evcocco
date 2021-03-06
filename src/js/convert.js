const EXTENSIONS = 'xls|xlsx|xlsm|xlsb|xml|csv|txt|dif|sylk|slk|prn|ods|fods|htm|html'.split('|');
// const EXTENSIONS = "xlsx";

let Sheets = {};

let SourceJsons = [];
let SourceMacroJsons = [];
let ConvertedJsons = [];

function showMessage(message, icon = '', iconColor = '#ccc') {
  const messageSpanElm = document.getElementById('message');

  if (icon === '') {
    messageSpanElm.innerHTML = `
        <span>${message}</span>`;
  } else {
    messageSpanElm.innerHTML = `
        <i class="fad fa-${icon} fa-lg fa-fw" style="color: ${iconColor};"></i>
        <span>${message}</span>`;
  }
}

function showInfo(message, icon = 'info-circle', iconColor = 'rgb(153, 225, 243)') {
  showMessage(message, icon, iconColor);
}

function showWarning(message, icon = 'exclamation-triangle', iconColor = 'rgb(190, 179, 74)') {
  showMessage(message, icon, iconColor);
}

function showError(message, icon = 'exclamation-circle', iconColor = 'rgb(223, 77, 77)') {
  showMessage(message, icon, iconColor);
}

let LoadedFileName = '';
const readFile = function (files) {
  const f = files[0];
  const reader = new FileReader();
  LoadedFileName = files[0].name;
  reader.onload = function (e) {
    let data = e.target.result;
    data = new Uint8Array(data);

    importFromXlsx(Xlsx.read(data, { type: 'array' }));
  };
  reader.readAsArrayBuffer(f);
};

// add event listeners
const drop = document.getElementById('drop');

const exportRmmzCommandsBtn = document.getElementById('exportRmmzCommandsBtn');
const exportRmmzEventPageBtn = document.getElementById('exportRmmzEventPageBtn');
const exportRmmzEventBtn = document.getElementById('exportRmmzEventBtn');
const exportTableRowsBtn = document.getElementById('exportTableRowsBtn');

const importRMMZCommandsBtn = document.getElementById('importRMMZCommandsBtn');

window.addEventListener(
  'dragenter',
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  },
  false
);
window.addEventListener(
  'dragover',
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  },
  false
);
window.addEventListener(
  'drop',
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    readFile(e.dataTransfer.files);
  },
  false
);

exportRmmzCommandsBtn.addEventListener(
  'click',
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    exportRmmzCommands();
  },
  false
);
exportRmmzEventPageBtn.addEventListener(
  'click',
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    // clickEventPage();
  },
  false
);
exportRmmzEventBtn.addEventListener(
  'click',
  (e) => {
    e.stopPropagation();
    e.preventDefault();

    // clickEvent();
  },
  false
);
exportTableRowsBtn.addEventListener(
  'click',
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    exportTableRows();
  },
  false
);

importRMMZCommandsBtn.addEventListener(
  'click',
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    const clipType = checkClipboard();

    if (clipType === 0) {
      importRMMZCommands();
      exportRmmzCommandsBtn.removeAttribute('disabled');
      exportTableRowsBtn.removeAttribute('disabled');
    } else if (clipType === 1) {
      importTableRows();
      exportRmmzCommandsBtn.removeAttribute('disabled');
      exportTableRowsBtn.removeAttribute('disabled');
    } else {
      showError('??????????????????????????????<br>??????????????????????????????????????????????????????');
    }
  },
  false
);

/**
 *
 * @param {Object} readJson
 * @param {Array} macroJsons
 * @param {String} jsonName SheetName | MacroName
 * @returns {Promise<({}|*[])[]>}
 */
async function convSheetToCommands(readJson, macroJsons, jsonName) {
  const jsonObj = {};
  jsonObj.name = jsonName;
  let commandsJSONs = [];
  let errorArray = [];
  let indentNow = 0;

  // ????????????????????????????????????????????????
  readJson = readJson.filter((obj) => {
    if ((obj.type === '' || obj.type === undefined) && (obj.text === '' || obj.text === undefined)) {
      return false;
    } else {
      return true;
    }
  });

  let index = 0;
  for (const row of readJson) {
    // ?????????????????????????????????
    const convertObj = {};
    const code = await findCodeByCommandTypeName(row.type);
    if (code === -1) {
      const msg = i18next.t('errnotfoundcmd', { id: row.id, type: row.type, escapeInterpolation: false });
      errorArray.push(msg);
      continue;
    }

    const commandConfigObj = await getCodeToCommandObject(code);

    // ?????????
    convertObj['code'] = code;
    // ???????????????
    if (hasIndentDecrementSelf(commandConfigObj)) {
      convertObj['indent'] = indentNow - 1;
    } else {
      convertObj['indent'] = indentNow;
    }

    // ??????????????????
    const defaults = Array(11).fill(undefined); //TODO
    let defaultIndex = 0;
    for (const defaultValue of getDefault(commandConfigObj)) {
      defaults[defaultIndex] = defaultValue;
      defaultIndex++;
    }

    // BGM??????????????????????????????name??????????????????????????????
    let soundParamIndex = getSoundParamIndex(commandConfigObj);

    convertObj['parameters'] = [];
    if (soundParamIndex !== undefined) {
      // ????????????????????????????????????

      for (let i = 1; i < 11; i++) {
        if (defaults[i] !== undefined) {
          convertObj['parameters'].push(row['arg' + i] === undefined ? defaults[i] : row['arg' + i]);
        }
      }

      const paramObj = {};
      for (let i = 1; i < 11; i++) {
        let paramName = '';
        let soundDefaultValue = 0;
        switch (i) {
          case 1:
            paramName = 'name';
            soundDefaultValue = '';
            break;
          case 2:
            paramName = 'volume';
            soundDefaultValue = 90;
            break;
          case 3:
            paramName = 'pitch';
            soundDefaultValue = 100;
            break;
          case 4:
            paramName = 'pan';
            soundDefaultValue = 0;
            break;
        }
        paramObj[paramName] = row['arg' + i] === undefined ? soundDefaultValue : row['arg' + i];
      }
      convertObj['parameters'].push(paramObj);
    } else {
      for (let i = 1; i < 11; i++) {
        // ???????????????????????????
        if (defaults[i - 1] !== undefined) {
          convertObj['parameters'].push(row['arg' + i] === undefined ? defaults[i - 1] : row['arg' + i]);
        }
      }
    }

    // ??????????????????
    if (code === 101) {
      /* ??????????????? */
      convertObj['parameters'][4] = row.name;
    }
    if (code === 108) {
      /* ?????? */
      // ??????????????????????????????????????????
      let comments = `${row.name ? row.name : ''} ${row.text ? row.text : ''} ${row.arg1 ? row.arg1 : ''}`;
      comments += `${row.arg2 ? row.arg2 : ''} ${row.arg3 ? row.arg3 : ''} ${row.arg4 ? row.arg4 : ''}`;
      comments += `${row.arg5 ? row.arg5 : ''} ${row.arg6 ? row.arg6 : ''} ${row.arg7 ? row.arg7 : ''}`;
      comments += `${row.arg8 ? row.arg8 : ''} ${row.arg9 ? row.arg9 : ''} ${row.arg10 ? row.arg10 : ''}`;
      comments += ` ${row.arg11 ? row.arg11 : ''}`;
      convertObj['parameters'][0] = comments;
    }

    // ?????????????????????????????????????????????????????????
    if (
      index !== 0 &&
      commandsJSONs[index - 1].code === 0 &&
      !hasIndentDecrementNext(commandConfigObj) &&
      !hasIndentDecrementSelf(commandConfigObj)
    ) {
      // ??????????????????????????????????????????????????????????????????????????????????????????
      // ???????????????????????????????????????????????????????????????.
      // ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
      commandsJSONs.pop();
      index--;
    }

    // ?????????
    if (code === -9) {
      const macroJson = macroJsons.find((i) => i.name.split('_').slice(-1)[0] === row.name);
      if (macroJson === undefined) {
        const msg = i18next.t('errnotfoundmacro', { id: row.id, type: row.type, name: row.name, escapeInterpolation: false });
        errorArray.push(msg);
        continue;
      }

      // ????????????????????????????????????
      let macroJsonStr = JSON.stringify(macroJson.jsons);
      let injectArgIndex = 1;
      for (const injectArg of convertObj['parameters']) {
        if (injectArg === null) continue;
        const re = new RegExp('#arg' + injectArgIndex, 'g');
        macroJsonStr = macroJsonStr.replace(re, injectArg);
        injectArgIndex++;
      }
      const replacedJson = JSON.parse(macroJsonStr);
      commandsJSONs = commandsJSONs.concat(replacedJson);

      const emptyCommand = {};
      emptyCommand['code'] = 0;
      emptyCommand['indent'] = indentNow;
      emptyCommand['parameters'] = [];
      commandsJSONs.push(emptyCommand);

      index += replacedJson.length + 1;
      continue;
    }

    commandsJSONs.push(convertObj);
    index++;

    // ????????????????????????????????????????????????

    // ????????????
    if (code === 101 && row.text) {
      // 1???????????????
      const texts = row.text.split('\n');
      for (const text of texts) {
        if (text === '') {
          continue;
        }
        const textLine = {};
        textLine['code'] = 401;
        textLine['indent'] = indentNow;
        textLine['parameters'] = [text];
        commandsJSONs.push(textLine);
        index++;
      }
    }

    if (hasIndentDecrementNext(commandConfigObj)) {
      indentNow--;
    }

    if (hasIndentIncrementNext(commandConfigObj)) {
      // ????????????????????????????????????????????????????????????????????????????????????
      indentNow++;
    } else {
      const emptyCommand = {};
      emptyCommand['code'] = 0;
      emptyCommand['indent'] = indentNow;
      emptyCommand['parameters'] = [];
      commandsJSONs.push(emptyCommand);
      index++;
    }
  }
  // ??????????????????????????????????????????????????????????????????
  commandsJSONs.pop();

  console.dir([jsonName, commandsJSONs]);

  jsonObj.jsons = commandsJSONs;

  return [jsonObj, errorArray];

  /**
   * ???????????????
   * errorArray = emptyCheck(errorArray, row, row.arg1, 1, "???????????????????????????")
   * @param errorArray
   * @param row
   * @param {any} arg
   * @param {Number} argNum
   * @param {string} name ?????????
   */
  function emptyCheck(errorArray, row, arg, argNum, name) {
    if (arg === '' || arg === undefined) {
      const msg = i18next.t('errequire', { id: row.id, type: row.type, name: name, argnum: argNum, escapeInterpolation: false });
      errorArray.push(msg);
    }
    return errorArray;
  }
}

async function convRMMZToTableRows(jsons) {
  const ColId = 0;
  const ColType = 1;
  const ColName = 2;
  const ColText = 3;
  const ColArgs1 = 4;
  const ColArgs2 = 5;
  const ColArgs3 = 6;
  const ColArgs4 = 7;
  const ColArgs5 = 8;
  const ColArgs6 = 9;
  const ColArgs7 = 10;
  const ColArgs8 = 11;
  const ColArgs9 = 12;
  const ColArgs10 = 13;
  const ColArgs11 = 14;
  const workArrays = [];
  let resultText = '';

  let index = 0;
  for (let tmpJson of jsons) {
    const code = tmpJson.code ? tmpJson.code : null;
    const parameters = tmpJson.parameters ? tmpJson.parameters : null;

    for (let i = 0; i < 11; i++) {
      if (parameters.length - i <= 0) {
        parameters[i] = '';
      }
    }

    const array = [];

    if (code === null) continue;

    const commandObj = await getCodeToCommandObject(code);
    if (code === 101 || code === 105) {
      array[ColType] = getCommandNameJP(commandObj);
      array[ColName] = parameters[4];
      array[ColText] = '';
      array[ColArgs1] = parameters[0];
      array[ColArgs2] = parameters[1];
      array[ColArgs3] = parameters[2];
      array[ColArgs4] = parameters[3];
      workArrays.push(array);
    } else if (code === 401 || code === 405) {
      // ????????????????????????????????????????????????????????????????????????.
      // ????????????????????????
      if (workArrays[index - 1][ColText] !== '') {
        workArrays[index - 1][ColText] = workArrays[index - 1][ColText].substring(
          0,
          workArrays[index - 1][ColText].length - 1
        );
        workArrays[index - 1][ColText] += '\n';
      } else {
        workArrays[index - 1][ColText] += '"';
      }
      workArrays[index - 1][ColText] += parameters[0] + '"';
      index--;
    } else if (typeof parameters[0] === 'object') {
      const objArray = Object.entries(parameters[0]);
      for (let i = 0; i < 11; i++) {
        if (objArray.length - i <= 0) {
          objArray[i] = ['', ''];
        }
      }
      array[ColType] = getCommandNameJP(commandObj);
      array[ColArgs1] = objArray[0][1];
      array[ColArgs2] = objArray[1][1];
      array[ColArgs3] = objArray[2][1];
      array[ColArgs4] = objArray[3][1];
      array[ColArgs5] = objArray[4][1];
      array[ColArgs6] = objArray[5][1];
      array[ColArgs7] = objArray[6][1];
      array[ColArgs8] = objArray[7][1];
      array[ColArgs9] = objArray[8][1];
      array[ColArgs10] = objArray[9][1];
      array[ColArgs11] = objArray[10][1];
      workArrays.push(array);
    } else {
      array[ColType] = getCommandNameJP(commandObj);
      array[ColArgs1] = parameters[0];
      array[ColArgs2] = parameters[1];
      array[ColArgs3] = parameters[2];
      array[ColArgs4] = parameters[3];
      array[ColArgs5] = parameters[4];
      array[ColArgs6] = parameters[5];
      array[ColArgs7] = parameters[6];
      array[ColArgs8] = parameters[7];
      array[ColArgs9] = parameters[8];
      array[ColArgs10] = parameters[9];
      array[ColArgs11] = parameters[10];

      workArrays.push(array);
    }
    index++;
    console.dir(array);
  }

  for (const array of workArrays) {
    for (const value of array) {
      if (value === undefined) {
        resultText += "";
      } else if (typeof value === 'object') {
        resultText += JSON.stringify(value);
      } else {
        resultText += value;
      }
      resultText += '\t';
    }
    resultText += '\n';
  }

  return resultText.trimEnd();
}

async function importFromXlsx(wb) {
  // ????????????????????????JSON???????????????
  let sheetCount = 0;
  let macroCount = 0;
  let commandsCount = 0;

  // ??????????????????????????????????????????????????????
  const macroNames = wb.SheetNames.filter(
    (i) => i.split('_')[0].toLowerCase() === 'macro' || i.split('_')[0] === '?????????'
  ).reverse();

  const sheetNames = wb.SheetNames.filter(
    (i) => i.split('_')[0].toLowerCase() !== 'macro' && i.split('_')[0] !== '?????????'
  );

  let macroCommandsJsons = [];
  let errorMacroArray = [];
  for (const macroName of macroNames) {
    const json = Xlsx.utils.sheet_to_json(wb.Sheets[macroName], { blankrows: false, source: true, header: 0 });
    const [tmpMacroCommandsJson, tmpErrormMacroArray] = await convSheetToCommands(json, macroCommandsJsons, macroName);
    macroCommandsJsons.push(tmpMacroCommandsJson);
    errorMacroArray = errorMacroArray.concat(tmpErrormMacroArray);

    macroCount++;
  }

  let commandsJsons = [];
  let errorArray = [];
  for (const sheetName of sheetNames) {
    const json = Xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { blankrows: false, source: true, header: 0 });
    if (Array.isArray(json)) {
      commandsCount += json.length;
    }
    const [tmpCommandsJson, tmpErrorArray] = await convSheetToCommands(json, macroCommandsJsons, sheetName);
    commandsJsons.push(tmpCommandsJson);
    errorArray = errorArray.concat(tmpErrorArray);
    sheetCount++;
  }

  if (errorArray.length !== 0 || errorMacroArray.length !== 0) {
    const msg = i18next.t('errloadsheet', { escapeInterpolation: false });
    showError(msg + errorArray.join('<br>') + errorMacroArray.join('<br>'));
  } else {
    // ??????
    const msg = i18next.t('loadedsheet');
    showMessage(msg, 'thumbs-up', '#3ee054');
    SourceJsons = commandsJsons;
    SourceMacroJsons = macroCommandsJsons;

    document.getElementById('dataInfo').innerHTML = `${sheetCount}????????? ${commandsCount}??? <br>${macroCount}?????????`;
    document.getElementById('dataSubInfo').innerHTML = `${LoadedFileName}`;
    exportRmmzCommandsBtn.removeAttribute('disabled');
    exportTableRowsBtn.removeAttribute('disabled');
  }
}

function exportRmmzCommands() {
  let jsons = [];
  for (const sourceJson of SourceJsons) {
    jsons = jsons.concat(sourceJson.jsons);
  }
  const isMV = Store.get('config').isMV;
  if (isMV) {
    Clipboard.writeMVCommand(jsons);
  } else {
    Clipboard.writeMZCommand(jsons);
  }

  showInfo('???????????????????????????????????????');
  updateClipboardInfo();
}

async function exportTableRows() {
  let jsons = [];
  for (const sourceJson of SourceJsons) {
    jsons = jsons.concat(sourceJson.jsons);
  }
  const str = await convRMMZToTableRows(jsons);
  Clipboard.writeText(str);
  showInfo('????????????????????????????????????');
  updateClipboardInfo();
}

function importRMMZCommands() {
  let json = [];
  try {
    const isMV = Store.get('config').isMV;
    if (isMV) {
      json = Clipboard.readMVCommand();
    } else {
      json = Clipboard.readMZCommand();
    }
  } catch (e) {
    showError('?????????????????????????????????????????????<br>???????????????????????????????????????????????????????????????????????????');
    console.error(e);
    return false;
  }
  if (json.length === 0) {
    showError('?????????????????????????????????????????????<br>???????????????????????????????????????????????????????????????????????????');
    return false;
  }

  const commandsJsons = [];
  const commandsCount = json.length;
  const jsonObj = {};
  jsonObj.name = '';
  jsonObj.jsons = json;
  commandsJsons.push(jsonObj);

  // ??????
  showMessage('???????????????????????????????????????', 'thumbs-up', '#3ee054');
  SourceJsons = commandsJsons;
  SourceMacroJsons = [];

  document.getElementById('dataInfo').innerHTML = `${commandsCount}???`;
  document.getElementById('dataSubInfo').innerHTML = ``;
}

async function importTableRows() {
  let rows = [];
  try {
    rows = Clipboard.readTable();
  } catch (e) {
    console.error(e);
    showError('??????????????????????????????????????????<br>???????????????????????????????????????????????????????????????');
    return;
  }
  if (rows.length === 0) {
    showError('??????????????????????????????????????????<br>???????????????????????????????????????????????????????????????');
    return;
  }

  const json = [];
  for (const row of rows) {
    const tmpJson = {};
    tmpJson.type = row[1];
    tmpJson.name = row[2];
    tmpJson.text = row[3];
    for (let i = 1; i < 11; i++) {
      tmpJson['arg' + i] = row[i + 3];
    }
    json.push(tmpJson);
  }
  const commandsJsons = [];
  const [commandsJson, errorArray] = await convSheetToCommands(json, SourceMacroJsons, '');
  const commandsCount = commandsJson.jsons.length;
  commandsJsons.push(commandsJson);

  if (commandsCount === 0) {
    showError('??????????????????????????????????????????<br>???????????????????????????????????????????????????????????????');
    return;
  }

  // ??????
  if (errorArray.length !== 0) {
    showError('??????????????????????????????????????????<br>' + errorArray.join('<br>'));
  } else {
    // ??????
    showMessage('????????????????????????????????????', 'thumbs-up', '#3ee054');
    SourceJsons = commandsJsons;

    document.getElementById('dataInfo').innerHTML = `${commandsCount}???`;
    document.getElementById('dataSubInfo').innerHTML = ``;
  }
}

window.addEventListener("focus", function () {
  updateClipboardInfo();
});
window.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    updateClipboardInfo();
  }, 100);
});


function updateClipboardInfo() {
  const clipboardType = checkClipboard();

  const elms = document.querySelectorAll('[data-clip-info]');

  for (const elm of elms) {
    elm.classList.add('is-hidden');
  }

  switch (clipboardType) {
    case 0:
      document.getElementById('clipInfoRmmz').classList.remove('is-hidden');
      importRMMZCommandsBtn.removeAttribute('disabled');
      break;
    case 1:
      document.getElementById('clipInfoTable').classList.remove('is-hidden');
      importRMMZCommandsBtn.removeAttribute('disabled');
      break;
    case 2:
      document.getElementById('clipInfoAnything').classList.remove('is-hidden');
      importRMMZCommandsBtn.setAttribute('disabled', 'disabled');
      break;
    case -1:
      document.getElementById('clipInfoAnything').classList.remove('is-hidden');
      importRMMZCommandsBtn.setAttribute('disabled', 'disabled');
      break;
  }
}

/**
 * 
 * @returns rmmz=0, table=1,text=2 none=-1
 */
function checkClipboard() {
  try {
    const isMV = Store.get('config').isMV;
    if (isMV) {
      Clipboard.readMVCommand();
    } else {
      Clipboard.readMZCommand();
    }
    return 0;
  } catch (error1) {
    try {
      const str = Clipboard.readText();
      if (str.includes('\t')) {
        return 1;
      } else {
        return 2;
      }
    } catch (error2) {
      return -1;
    }
  }
}

document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    WebFrame.Zoom(e.wheelDelta > 0)
  }
})