import * as vscode from 'vscode';
import assert = require('assert');

import {getConfigs} from './configs';
const TAGS = require("./tags")
const TASKS = require("./tasks")

import {NodeDependenciesProvider} from './provider';

var config = getConfigs()



export function activate(context: vscode.ExtensionContext) {

    console.log('"RX-Todo" extension is activated');

    var activeEditor = vscode.window.activeTextEditor;


    // var TAGS = TAGS.DEFINED_TAGS
    var DECORATIONS = TAGS.DECORATIONS




    TEST()
    const wsDirs = [...vscode.workspace.workspaceFolders].map(dir => dir)
    vscode.window.createTreeView('todo-ext-view-wsDirs', {
            treeDataProvider: new NodeDependenciesProvider(wsDirs)
    });





    context.subscriptions.push(TAGS.tagCompletion)
	context.subscriptions.push(TASKS.toTask, TASKS.cancelTask, TASKS.completeTask);
	context.subscriptions.push(TASKS.switchTask);


    if (activeEditor) {
        TAGS.triggerUpdateTags(activeEditor, TAGS.DEFINED_TAGS, DECORATIONS);
    }


    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            TAGS.triggerUpdateTags(activeEditor, TAGS.DEFINED_TAGS, DECORATIONS);
            // get_ws_todo();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && event.document === activeEditor.document) {
            TAGS.triggerUpdateTags(activeEditor, TAGS.DEFINED_TAGS, DECORATIONS, true);
        }
    }, null, context.subscriptions);

}





function TEST(){

}

vscode.commands.registerCommand('VSCODE-TODO.TEST-COMMAND', async () => {
    let editor = vscode.window.activeTextEditor;
    let lines = editor.document.getText().split("\n");

    /*
    let checkbox_items = []
    Object.keys(config.tasksSymbols).forEach(element => {
        checkbox_items.push(`${element}  (${config.tasksSymbols[element]})`)
    });
    const list = await vscode.window.showQuickPick(
        checkbox_items,
        {   ignoreFocusOut: true,
            canPickMany: true,
            title:"Tags to be included",
            "placeHolder": "Select or filter task status"
        }
    )
    console.log(list);
    */

    // vscode.window.showInformationMessage('Info Notification As Modal', { modal: true, })
    // const selection = await vscode.window.showWarningMessage('Warning Notification With Actions', 'Action 1', 'Action 2', 'Action 3');

    // let activeEditor = vscode.window.activeTextEditor;
    // var file = activeEditor.document;
    // var folder = vscode.workspace.getWorkspaceFolder(file.uri)
    // let f = path.join(folder.uri.fsPath, "RX_CSG")
    // vscode.window.showTextDocument(vscode.Uri.file(f)) //vscode.workspace.openTextDocument()
});
