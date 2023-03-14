import * as vscode from 'vscode';
import * as path from 'path'
import * as fs from "fs"


import {getConfigs} from './configs';
var config = getConfigs()


function get_ws_todo() {
    let activeEditor = vscode.window.activeTextEditor;
    var file = activeEditor.document;
    var folder = vscode.workspace.getWorkspaceFolder(file.uri)

    if (folder==undefined){
        return undefined;
    }

    // console.log(`${folder.index + 1} of ${vscode.workspace.workspaceFolders.length}`);
    // path.basename(file.uri.fsPath)
    // var found_todo_files = fs.readdirSync(folder.uri.fsPath).filter(fn => fn.endsWith('.todo'));
    // console.log(found_todo_files);

    let builtin_todo_files = [".todo","todo.todo","main.todo","tasks.todo"]
    let valid_todo_files;
    if (config.customTodoFiles){
        valid_todo_files = [...config.customTodoFiles, ...builtin_todo_files]
    } else {
        valid_todo_files = builtin_todo_files
    }

    valid_todo_files.forEach(todo_file => {
        if (fs.existsSync(path.join(folder.uri.fsPath, todo_file))){
            console.log(path.join(folder.uri.fsPath, todo_file));
            return path.join(folder.uri.fsPath, todo_file);
        }
    });
}

function get_requested_tags(){
    let editor = vscode.window.activeTextEditor;
    let lines = editor.document.getText().split("\n")

    let requested_tags = ["low","easy"];
    let flag:boolean[] = [];

    let found_lines: string[] = [];
    lines.forEach(line => {
        flag = []
        requested_tags.forEach(tag => {
            if (line.includes(tag)){
                flag.push(true)
            }

        });
        if (flag.length == requested_tags.length){
            found_lines.push(line)
        }
    });
    console.log(found_lines);
}
