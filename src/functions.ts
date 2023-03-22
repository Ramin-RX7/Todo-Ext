import * as vscode from 'vscode';
import * as path from 'path'
import * as fs from "fs"


import BUILTINS = require("./builtins")
import TAGS = require("./tags")

var config = BUILTINS.config


export function get_dir_todo(folder_uri){
    let builtin_todo_files = [".todo","todo.todo","main.todo","tasks.todo"]
    let valid_todo_files;
    if (config.customTodoFiles){
        valid_todo_files = [...config.customTodoFiles, ...builtin_todo_files]
    } else {
        valid_todo_files = builtin_todo_files
    }
    let joined = undefined
    let result = undefined
    valid_todo_files.forEach(todo_file => {
        joined = path.join(folder_uri.fsPath, todo_file)
        if (fs.existsSync(joined) && !result){
            // console.log(joined);
            result = joined
        }
    });
    return result
}
function get_ws_todo() {
    let todo_list = []
    let workspaceFolders = vscode.workspace.workspaceFolders;
    workspaceFolders.forEach(folder => {
        todo_list.push(get_dir_todo(folder.uri))
    });
    return todo_list
}


export function get_requested_tags(){
    let editor = vscode.window.activeTextEditor;
    let lines = editor.document.getText().split("\n")

    let requested_tags = ["low","easy"];
    let flag:boolean[] = [];

    let found_lines: string[] = [];
    lines.forEach(line => {
        flag = []
        requested_tags.forEach(tag => {
            if (line.includes("@"+tag)){
                flag.push(true)
            }

        });
        if (flag.length == requested_tags.length){
            found_lines.push(line)
        }
    });
    console.log(found_lines);
}


export function extract_tasks_category(uriFspath){
    let lines
    try {
        lines = fs.readFileSync(uriFspath, 'utf8').split("\n");
    } catch (err) {
        console.error(err);
        return
    }
    let modules_tasks = {}  // MODULE1 :  [[TASK1,LineNom], [TASK2,LineNom]]
    let TAGS_DICT = {};     // TAGS    :  ~~
    TAGS.DEFINED_TAGS.forEach(tag => {
        TAGS_DICT[tag] = []
        });
    let tasks_status = {}   // STATUS  :  ~~
    Object.keys(config.tasksSymbols).forEach(status_name => {
        tasks_status[`${status_name}  (${config.tasksSymbols[status_name]})`] = []
    });

    let module_regex = /^\[(.+)\](\s*)?$/g;
    let current_module = undefined
    for (var [index, line] of lines.entries()) {
        // console.log(index);
        if (module_regex.exec(line)){
            line = line.trim().slice(1,line.length-2)
            modules_tasks[line] = []
            current_module = line;
        }
        else if (line.trim()) {
            line = line.trim()
            if (Object.values(config.tasksSymbols).includes(line[0])){
                let task_name = Object.keys(config.tasksSymbols).find(key => config.tasksSymbols[key] === line[0])
                let key = `${task_name}  (${line[0]})`
                line = line.slice(1).trim()
                tasks_status[key].push([line,index])
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
                TAGS_DICT[tagname].push([line.trim(),index])
            });
            modules_tasks[current_module].push([line,index])
        }
    }
    // console.log(modules_tasks);
    // console.log(TAGS_DICT);
    // console.log(tasks_status);

    return [modules_tasks, TAGS_DICT, tasks_status]
}


export function get_todos_glob(){
    let pattern = "{"
    vscode.workspace.workspaceFolders.forEach(folder => {
        pattern += `${folder.uri.fsPath},`
    });
    pattern = pattern.slice(0,pattern.length-1)+"}/{"
    BUILTINS.TODO_FILES.forEach(file => {
        pattern += `${file},`
    });
    pattern = pattern.slice(0,pattern.length-1)+"}"
    // console.log(pattern);
    return pattern
}


export async function moveCursor(fileFspath, line){
    await vscode.window.showTextDocument(vscode.Uri.file(fileFspath))
    fs.readFile(fileFspath, 'utf-8', function(err, data){
        if (err) {throw err};
        let lines = data.split("\n").length
        vscode.commands.executeCommand("cursorMove",{to:"wrappedLineStart"})
        vscode.commands.executeCommand("cursorMove",{to:"up"  ,  value: lines})
        vscode.commands.executeCommand("cursorMove",{to:"down",  value: line,})
        vscode.commands.executeCommand("cursorMove",{to:"wrappedLineEnd", select:true})
        vscode.commands.executeCommand("revealLine",{lineNumber:line, at:"center"})
    });
}
export const moveCursorCmd = vscode.commands.registerCommand("Todo.moveCursor", moveCursor)
