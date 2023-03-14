import * as vscode from 'vscode';
import * as path from 'path'
import * as fs from "fs"


import {getConfigs} from './configs';
import { TAGS } from './tags';
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

function extract_tasks_category(){
    let editor = vscode.window.activeTextEditor;
    let lines = editor.document.getText().split("\n");

    let TAGS_DICT = {};
    TAGS.forEach(tag => {
        TAGS_DICT[tag] = []
    });

    let module_regex = /\[(.+)\](\s*)?/g;
    let modules_tasks = {}  // MODULE1 : [TASK1,TASK2]
    let current_module = undefined
    for (var [index, line] of lines.entries()) {
        // console.log(index);
        if (module_regex.exec(line)){
            line = line.trim().slice(1,line.length-2)
            modules_tasks[line] = []
            current_module = line;

        } else if (line.trim()) {
            line = line.trim()
            if (Object.values(config.tasksSymbols).includes(line[0])){
                line = line.slice(1)
            }
            let tag_regex = /(?<withspace>\s*(?<TAG>@(?<TAGNAME>[^(\r| |\n|`|'|"|@)]+))\s*)/;
            let match;
            let tagname;
            let line_tagname_list = [];
            let line_tag_regexed = [];
            let modified_line = line;
            while (true) {
                match = tag_regex.exec(modified_line)
                if (! match){break}
                tagname = match.groups.TAGNAME
                if (TAGS_DICT[tagname]==undefined){
                    TAGS_DICT[tagname] = []
                }
                line_tagname_list.push(tagname)
                line_tag_regexed.push(match.groups.withspace)
                modified_line = modified_line.replace(match.groups.withspace, "")
                // TAGS_DICT[tagname].push(line)
            }
            line_tag_regexed.forEach(regexed => {
                line = line.replace(regexed, "")
            });
            line_tagname_list.forEach(tagname => {
                TAGS_DICT[tagname].push(line.trim())
            });
            modules_tasks[current_module].push(line)
        }
    }
    // console.log(modules_tasks);
    // console.log(TAGS_DICT);
}