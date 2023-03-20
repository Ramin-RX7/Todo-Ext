import * as vscode from 'vscode';


export function getConfigs(){
    let USER_CONFIG = vscode.workspace.getConfiguration("vscode-todo-ext");
    return mergeDeep(DEFAULT_CONFIGS, USER_CONFIG)
}
export var config = getConfigs()




export const TAGS_MAP: {[key:string]:{[key:string]:string}} = {
    "low"       :   {backgroundColor:"#EEEEEE", color:"#000"},
    "med"       :   {backgroundColor:"#E6DD4E", color:"#000"},
    "high"      :   {backgroundColor:"#C00000", overviewRulerColor:"#C00000"},
    "critical"  :   {backgroundColor:"#600000", overviewRulerColor:"#600000"},
    "_normal_tag":   {backgroundColor:"#3355ff",}
}


export const TASKS_SYMBOLS = {
    "waiting"  :  "☐",
    "done"     :  "✔",
    "cancelled":  "✘",   // 🗙
    "uncertain":  "?"
    // "postponed":     "➔",   // ➜ ➤  |  ➡️
    // "assigned" :     "⚑",   //   |  🚩
    // "approveNeeded": "?"    // 📊 ❓ ❔
}


export const TODO_FILES:string[] = [".todo","todo.todo","main.todo","tasks.todo"]


export var DEFAULT_CONFIGS = {
    tags : TAGS_MAP,
    tasksSymbols : TASKS_SYMBOLS,
    todoFiles : TODO_FILES
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
