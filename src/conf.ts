
import {workspace} from 'vscode';


var DEFAULT_CONFIGS = {
    tags : {},
    tagsSymbols : {
        "waiting"  :     "☐",
        "done"     :     "✔",
        "cancelled":     "✘",   // 🗙
        "postponed":     "➔",   // ➜ ➤  |  ➡️
        "assigned" :     "⚑",   //   |  🚩
        "approveNeeded": "?"    // 📊 ❓ ❔
    }
}



export function getConfigs(){
    let USER_CONFIG = workspace.getConfiguration("todo-ext");
    return mergeDeep(DEFAULT_CONFIGS, USER_CONFIG)

}



function mergeDeep(target, source) {
    const isObject = (obj) => obj && typeof obj === 'object';

    if (!isObject(target) || !isObject(source)) {
      return source;
    }

    Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });

    return target;
}
