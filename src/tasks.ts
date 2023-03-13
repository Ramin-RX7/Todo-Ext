import * as vscode from 'vscode';

import {getConfigs} from './configs';
var config = getConfigs()



/**
 * Switches the tasks state to given symbol.
 * If task already has the current symbol, it will return False
*/
function convertTaskState(symbol){
    const editor = vscode.window.activeTextEditor;

    if (editor) {

        const position = editor.selection.active;
        const document = editor.document;

        var line = document.lineAt(position.line)
        var line_text = line["b"]

        var regEx = /(?<Indent>\s*)(?<Task>.*)/;
        var match = regEx.exec(line_text)
        // assert(match?.groups);
        var Task_Text = match.groups.Task

        if (symbol==Task_Text.slice(0,1)){
            return false
        }
        else {
            let new_text;
            // console.log(Object.values(config.tasksSymbols));

            if ((!symbol) || (Object.values(config.tasksSymbols).includes(Task_Text.slice(0,1)))){
                // console.log("yes");
                new_text = Task_Text.slice(1)
            } else {
                new_text = Task_Text
            }
            // console.log(new_text);

            var regex2 = /(?<ExtraSpaces>\s*)(.*)/;
            var match2 = regex2.exec(new_text)
            // assert(match2?.groups);

            if (match2.groups.ExtraSpaces){
                new_text = new_text.slice(match2.groups.ExtraSpaces.length)
            }
            if (symbol){
                new_text = symbol + " " + new_text
            }

            editor.edit(editBuilder => {
                editBuilder.delete(
                                new vscode.Range(
                                    new vscode.Position(
                                        position.line,
                                        line.firstNonWhitespaceCharacterIndex
                                    ),
                                    line.range.end
                                )
                );
                editBuilder.insert(
                    new vscode.Position(line.lineNumber,
                                        line.firstNonWhitespaceCharacterIndex),
                    new_text
                );
            });
            return true
        }

    }
}


/**
 * Switches the tasks state to given symbol.
 * If task already has the current symbol, it will remove it (also removes whitespaces)
*/
function toState_or_Default(symbol){
    if (!convertTaskState(symbol)){
        convertTaskState("")
    }
}


const toTask = vscode.commands.registerCommand("Todo.toTask", function(){
    toState_or_Default(config.tasksSymbols.waiting)
})
const cancelTask = vscode.commands.registerCommand("Todo.cancelTask", function(){
    toState_or_Default(config.tasksSymbols.cancelled)
})
const completeTask = vscode.commands.registerCommand("Todo.completeTask", function(){
    toState_or_Default(config.tasksSymbols.done)
})


const switchTask = vscode.commands.registerCommand("Todo.switchTask", function(){
    convertTaskState(switchTaskF().next().value)
})
function* switchTaskF() {
    let list = [
        "",
        config.tasksSymbols.waiting,
        config.tasksSymbols.done,
        config.tasksSymbols.cancelled,
    ]

    list = [""].concat(Object.values(config.tasksSymbols))

    let editor = vscode.window.activeTextEditor;

    if (editor) {
        var line_text = editor.document.lineAt(editor.selection.active.line)["b"]
        var regEx = /(?<Indent>\s*)(?<Task>.*)/;
        var Task_Text = regEx.exec(line_text).groups.Task;

        if (list.includes(Task_Text.slice(0,1))){
            let i = list.indexOf(Task_Text.slice(0,1))
            yield list[++i % list.length]
        } else {
            yield config.tasksSymbols.waiting
        }
    }
}


export {toTask, cancelTask, completeTask, switchTask}
