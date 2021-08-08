/**
 * 会話
 */
const Ev101ParametersDefaultValue = {
    '顔ファイル名': 0,
    '顔ファイル位置0-8': 0,
    '背景': 0,
    'ウィンドウ位置': 0,
    '名前': ''
}
const Ev401ParametersDefaultValue = {
    '文章': ''
}
const Ev101EnableParameters = [
    '顔ファイル名',
    '顔ファイル位置0-8',
    '背景',
    'ウィンドウ位置',
    '名前',
]
const Ev401EnableParameters = {
    text: 'text'
}

/**
 * スイッチ
 */
const Ev121ParametersDefaultValue = {
    'スイッチ': 1,
    'スイッチ範囲To': 1,
    '操作': 0,
}

const Ev121EnableParameters = {
    'スイッチ': 'code',
    'スイッチ範囲To': 'code',
    '操作': 'checkbox'
}

const EventsConfigs = {
    '101': Ev101ParametersDefaultValue,
    '121': Ev121Data,
};