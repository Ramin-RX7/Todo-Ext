import * as vscode from 'vscode';

import BUILTINS = require("./builtins")

var config = BUILTINS.config



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

export function updateStatusDecoration(activeEditor:vscode.TextEditor|undefined,){
    let text = activeEditor.document.getText();
    let match;

    const completedDecoration = vscode.window.createTextEditorDecorationType({
        opacity: "0.3", color:"#55ee55"
	});
    const cpltRgx = RegExp(`${config.tasksSymbols["done"]}.+`,"g")
	const completed = [];
	while ((match = cpltRgx.exec(text))) {
		const startPos = activeEditor.document.positionAt(match.index);
		const endPos = activeEditor.document.positionAt(match.index + match[0].length);
		const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
		completed.push(decoration);
	}
	activeEditor.setDecorations(completedDecoration, completed);

	const cancelledDecoration = vscode.window.createTextEditorDecorationType({
        opacity: "0.3", textDecoration:"line-through", color:"#cc5555"
	});
    const cnclRgx = RegExp(`${config.tasksSymbols["cancelled"]}.+`,"g")
	const cancelled = [];
	while ((match = cnclRgx.exec(text))) {
		const startPos = activeEditor.document.positionAt(match.index);
		const endPos = activeEditor.document.positionAt(match.index + match[0].length);
		const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
		cancelled.push(decoration);
	}
	activeEditor.setDecorations(cancelledDecoration, cancelled);

	// while ((match = cnclRgx.exec(text)) || (match = cpltRgx.exec(text))) {
		// const startPos = activeEditor.document.positionAt(match.index);
		// const endPos = activeEditor.document.positionAt(match.index + match[0].length);
		// const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
		// if (match[1]==config.tasksSymbols["cancelled"]){
            // cancelled.push(decoration)
        // } else {
            // completed.push(decoration)
        // }
	// }
	// activeEditor.setDecorations(completedDecoration, completed);
	// activeEditor.setDecorations(cancelledDecoration, cancelled);
}
export function triggerUpdateTasksStatusDecoration(activeEditor:vscode.TextEditor|undefined,throttle = false) {
    let timeout: NodeJS.Timer|undefined = undefined;
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    if (throttle) {
        timeout = setTimeout(updateStatusDecoration, 500, activeEditor=activeEditor);
    } else {
        updateStatusDecoration(activeEditor);
    }
}



export {toTask, cancelTask, completeTask, switchTask}
