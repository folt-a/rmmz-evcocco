/**
 * 会話
 */
const Ev101Data = {
    code: 101,
    title: '文章の表示',
    indent: 0,
    isEditable: true,
    parameters: {
        '顔ファイル名': '',
        '顔ファイル位置0-8': 0,
        '背景': 0,
        'ウィンドウ位置': 0,
        '名前': ''
    },
    list: [{
            code: 401,
            title: '文章の表示',
            indent: 0,
            type: 'text',
            maxlength: 20,
            parameters: { '文章': '' }
        },
        {
            code: 401,
            title: '文章の表示',
            indent: 0,
            type: 'text',
            maxlength: 20,
            parameters: { '2行目': '' }
        },
        {
            code: 401,
            title: '文章の表示',
            indent: 0,
            type: 'text',
            maxlength: 20,
            parameters: { '3行目': '' }
        },
        {
            code: 401,
            title: '文章の表示',
            indent: 0,
            type: 'text',
            maxlength: 20,
            parameters: { '4行目': '' }
        }
    ]
}
const Ev101Parameters = {
    '顔ファイル名': 'text',
    '顔ファイル位置0-8': 'code',
    '背景': 'code',
    '背景_value': { 'ウィンドウ': 0, '暗くする': 1, '透明': 2 },
    'ウィンドウ位置': 'code',
    'ウィンドウ位置_value': { '上': 0, '中': 1, '下': 2 },
    '名前': 'text',
}
const Ev401Parameters = {
    '文章': 'text',
    "2行目": 'text',
    "3行目": 'text',
    "4行目": 'text'
}


/**
 * 条件分岐
 */
const Ev111Data = {
    code: 111,
    title: '条件分岐',
    indent: 0,
    isEditable: true,
    parameters: {
        '条件分岐': 0,
        '条件分岐値1': 1,
        '条件分岐値2': 0,
    }
}
const Ev411Data = {
    code: 411,
    title: '条件分岐if閉じ',
    indent: 1,
    isEditable: false,
    parameters: {}
}
const Ev412Data = {
    code: 412,
    title: '条件分岐else閉じ',
    isEditable: false,
    indent: 1,
    parameters: {}
}
const Ev111Parameters = {
    '条件分岐': 'code',
    '条件分岐_value': { 'スイッチ': 0, '変数': 1, 'セルフスイッチ': 2, 'タイマー': 3, 'アクター': 4, '敵キャラ': 5, 'キャラクター': 6, '乗り物': 7 },
    '条件分岐値1': 'code',
    '条件分岐_value': { '0': 0, '1': 1, '2': 2 },
    '条件分岐値2': 'code',
    '条件分岐値2_value': { '0': 0, '1': 1, '2': 2 },
}
const Ev411Parameters = {}
const Ev412Parameters = {}

/**
 * スイッチ
 */
const Ev121Data = {
    code: 121,
    title: 'スイッチの操作',
    indent: 0,
    isEditable: true,
    parameters: {
        'スイッチ': 1,
        'スイッチ範囲To': 1,
        '操作': 0,
    }
}
const Ev121Parameters = {
    '名前': 'readonly',
    'スイッチ': 'code',
    'スイッチ範囲To': 'code',
    '操作': 'checkbox'
}

const EventsData = {
    '101': Ev101Data,
    '111': Ev111Data,
    '121': Ev121Data,
    '411': Ev411Data,
    '412': Ev412Data,
};

const EventsDataArray = {
    '101': [Ev101Data],
    '111': [Ev111Data, Ev411Data, Ev412Data],
    '121': [Ev121Data],
};

function getParametersLayout(code) {
    switch (code) {
        case 101:
            return Ev101Parameters;
        case 111:
            return Ev111Parameters;
        case 121:
            return Ev121Parameters;
        default:
            break;
    }
}

function getParameterType(code, paramName) {
    switch (code) {
        case 101:
            return Ev101Parameters[paramName];
        case 111:
            return Ev111Parameters[paramName];
        case 121:
            return Ev121Parameters[paramName];
        default:
            break;
    }
}

function getParameterDefaultValue(code, title, paramName) {
    return Store.get('ParametersDefaultValue.Ev' + code + '_' + title + '.' + paramName)
}

function getParameterDefaultObject(code, title) {
    return Store.get('ParametersDefaultValue.Ev' + code + '_' + title)
}

function isEnableParameter(code, title, paramName) {

    const array = Object.entries(Store.get('EnableParameters.Ev' + code + '_' + title));

    return array.some(item => item[0] === paramName && item[1] === true);
}


function getUniqueStr(myStrong) {
    var strong = 1000;
    if (myStrong) strong = myStrong;
    const str = ''
    return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
}