let CommandsJson = [];

async function codeToCommandNameEN(code, commandObj) {
  return commandObj.name[0];
}

/**
 * コードから日本語名にする
 * 日本語名はconfigの2番めにいれるきまりにする
 * @param {object} commandObj
 * @returns {Promise<*>}
 */
function getCommandNameJP(commandObj) {
  return commandObj.name[1];
}

/**
 * コードから日本語名にする
 * 日本語名はconfigの2番めにいれるきまりにする
 * @param code
 * @returns {Promise<*>}
 */
async function getCodeToCommandObject(code) {
  if (CommandsJson.length === 0) {
    CommandsJson = JSON.parse(await Fs.readFileSync('\\js\\data\\commands.json', 'utf8'));
  }
  return CommandsJson.find((i) => i.code === code);
}

/**
 * 入力名からコードにする
 * 前方一致で前から順に当てはまったものにする
 * @param name
 * @returns {Promise<*>}
 */
async function findCodeByCommandTypeName(name) {
  if (CommandsJson.length === 0) {
    CommandsJson = JSON.parse(await Fs.readFileSync('\\js\\data\\commands.json', 'utf8'));
  }
  if (name === undefined) return 101;
  console.info(['name', name]);
  const obj = CommandsJson.find((i) =>
    i.name.find((i2) => i2.replace(/\s/g, '').indexOf(name.replace(/\s/g, '')) === 0)
  );

  if (obj === undefined) return -1;
  return obj.code;
}

/**
 * 次のコマンドからインデントを深くするかどうか取得
 * 条件分岐、選択肢で使う
 * @param commandObj
 * @returns {boolean}
 */
function hasIndentIncrementNext(commandObj) {
  return commandObj.isIndentIncrementNext !== undefined;
}

/**
 * このコマンドのみインデントを浅くするかどうか取得
 * 次のコマンドはまた深くなる
 * else, 選択肢選ぶやつで使う
 * @param commandObj
 * @returns {boolean}
 */
function hasIndentDecrementSelf(commandObj) {
  return commandObj.isIndentDecrementSelf !== undefined;
}

/**
 * 次のコマンドからインデントを浅くするかどうか取得
 * 条件分岐終了、選択肢終了で使う
 * @param commandObj
 * @returns {boolean}
 */
function hasIndentDecrementNext(commandObj) {
  return commandObj.isIndentDecrementNext !== undefined;
}

/**
 * 音系のコマンドかどうか取得
 * パラメータがオブジェクト方式になる
 * @param commandObj
 * @returns {boolean}
 */
function getDefault(commandObj) {
  return commandObj.default ? commandObj.default : [];
}

/**
 * 音系のコマンドかどうか取得
 * パラメータがオブジェクト方式になる
 * @param commandObj
 * @returns {boolean}
 */
function getSoundParamIndex(commandObj) {
  return commandObj.soundParamIndex !== 0 ? commandObj.soundParamIndex : undefined;
}

function has(object, key) {
  return object ? hasOwnProperty.call(object, key) : false;
}
