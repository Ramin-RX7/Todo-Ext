import * as vscode from 'vscode';
import assert = require('assert');

import BUILTINS = require("./builtins")
import TAGS = require("./tags")
import TASKS = require("./tasks")
import FUNCTIONS = require("./functions")
import {TreeView} from './provider';

var config = BUILTINS.config



export function activate(context: vscode.ExtensionContext) {

    console.log('"RX-Todo" extension is activated');

    var activeEditor = vscode.window.activeTextEditor;


    // var TAGS = TAGS.DEFINED_TAGS
    var DECORATIONS = TAGS.DECORATIONS





    TEST()





    // TreeView
    const wsDirs = [...vscode.workspace.workspaceFolders].map(dir => dir)
    const Provider = new TreeView(wsDirs)
    vscode.window.createTreeView('todo-ext-view-wsDirs', {
        treeDataProvider: Provider
    });
    vscode.commands.registerCommand('Todo.refreshTreeView', () =>
        Provider.refresh()
    );


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
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && event.document === activeEditor.document) {
            TAGS.triggerUpdateTags(activeEditor, TAGS.DEFINED_TAGS, DECORATIONS, true);
        }
    }, null, context.subscriptions);


    vscode.workspace.createFileSystemWatcher(
        FUNCTIONS.get_todos_glob()
    ).onDidChange( _ => {
        Provider.refresh();
        // console.log("Change");
    })
    // filechangelistener.onDidChange(_ => {Provider.refresh()})
}





async function TEST(){

}


vscode.commands.registerCommand('VSCODE-TODO.TEST-COMMAND', async () => {
    let editor = vscode.window.activeTextEditor;
    let lines = editor.document.getText().split("\n");

});
