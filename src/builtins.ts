// import * as vscode from 'vscode';

const TAGS_MAP: {[key:string]:{[key:string]:string}} = {
    "low"       :   {backgroundColor:"#EEEEEE", color:"#000"},
    "med"       :   {backgroundColor:"#E6DD4E", color:"#000"},
    "high"      :   {backgroundColor:"#C00000", overviewRulerColor:"#C00000"},
    "critical"  :   {backgroundColor:"#600000", overviewRulerColor:"#600000"},
    "_normal_tag":   {backgroundColor:"#3355ff",}
}

const TODO_FILES:string[] = [".todo","todo.todo","main.todo","tasks.todo"]
