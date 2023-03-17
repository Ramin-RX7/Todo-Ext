// import * as vscode from 'vscode';

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
    "uncertain":  "? "
    // "postponed":     "➔",   // ➜ ➤  |  ➡️
    // "assigned" :     "⚑",   //   |  🚩
    // "approveNeeded": "?"    // 📊 ❓ ❔
}


export const TODO_FILES:string[] = [".todo","todo.todo","main.todo","tasks.todo"]


export var DEFAULT_CONFIGS = {
    tags : TAGS_MAP,
    tasksSymbols : TASKS_SYMBOLS
}
