import * as vscode from 'vscode';

import {getConfigs} from './conf';
var config = getConfigs()



function convertTask(symbol){
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

        var new_text = "";

        if (symbol==Task_Text.slice(0,1)){
            return false
        }
        else {
            new_text = Task_Text.slice(1)
            var regex2 = /(?<ExtraSpaces>\s*)(.*)/;
            var match2 = regex2.exec(new_text)
            // assert(match2?.groups);
            if (match2.groups){
                new_text = new_text.slice(match2.groups.ExtraSpaces.length)
            }
            console.log(new_text);

            new_text = symbol + " " + new_text
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

const toTask = vscode.commands.registerCommand("Todo.toTask", function(){
    convertTask(config.tasksSymbols.waiting)
})
const cancelTask = vscode.commands.registerCommand("Todo.cancelTask", function(){
    convertTask(config.tasksSymbols.cancelled)
})
const completeTask = vscode.commands.registerCommand("Todo.completeTask", function(){
    convertTask(config.tasksSymbols.done)
})


const switchTask = vscode.commands.registerCommand("Todo.switchTask", function(){
    convertTask(switchTaskF().next().value)
})
function* switchTaskF() {
    let list = [
        config.tasksSymbols.waiting,
        config.tasksSymbols.cancelled,
        config.tasksSymbols.done
    ]
    let i = 0

    const editor = vscode.window.activeTextEditor;

    if (editor) {
        var line_text = editor.document.lineAt(editor.selection.active.line)["b"]
        var regEx = /(?<Indent>\s*)(?<Task>.*)/;
        var Task_Text = regEx.exec(line_text).groups.Task;
        console.log(Task_Text);


        if (list.includes(Task_Text.slice(0,1))){
            i = list.indexOf(Task_Text.slice(0,1))
            yield list[++i %3]
        }
        else {
            yield config.tasksSymbols.waiting
        }
    }
}


export {toTask, cancelTask, completeTask, switchTask}
