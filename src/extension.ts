import * as vscode from 'vscode';
import assert = require('assert');

import {getConfigs} from './configs';
import { TAGS } from './tags';
const tags = require("./tags")
const tasks = require("./tasks")


var config = getConfigs()



export function activate(context: vscode.ExtensionContext) {

    console.log('"RX-Todo" extension is activated');

    var activeEditor = vscode.window.activeTextEditor;


    var TAGS = tags.TAGS
    var DECORATIONS = tags.DECORATIONS




    TEST()




    context.subscriptions.push(tags.tagCompletion)
	context.subscriptions.push(tasks.toTask, tasks.cancelTask, tasks.completeTask);
	context.subscriptions.push(tasks.switchTask);


    if (activeEditor) {
        tags.triggerUpdateTags(activeEditor, TAGS, DECORATIONS);
    }


    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            tags.triggerUpdateTags(activeEditor, TAGS, DECORATIONS);
            // get_ws_todo();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && event.document === activeEditor.document) {
            tags.triggerUpdateTags(activeEditor, TAGS, DECORATIONS, true);
        }
    }, null, context.subscriptions);

}


function TEST(){
    // let activeEditor = vscode.window.activeTextEditor;
    // var file = activeEditor.document;
    // var folder = vscode.workspace.getWorkspaceFolder(file.uri)
    // let f = path.join(folder.uri.fsPath, "RX_CSG")
    // vscode.window.showTextDocument(vscode.Uri.file(f)) //vscode.workspace.openTextDocument()
}

vscode.commands.registerCommand('VSCODE-TODO.TEST-COMMAND', async () => {


});
