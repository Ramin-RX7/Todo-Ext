import * as vscode from 'vscode';
import assert = require('assert');

import {getConfigs} from './conf';
import tags = require("./tags")
import tasks = require("./tasks")


var config = getConfigs()



export function activate(context: vscode.ExtensionContext) {

    console.log('"RX-Todo" extension is activated');

    var activeEditor = vscode.window.activeTextEditor;


    var TAGS = tags.TAGS
    var DECORATIONS = tags.DECORATIONS


    /*
    var resource = activeEditor.document.uri;
    var folder = workspace.getWorkspaceFolder(resource)
    var text = `${basename(folder.uri.fsPath)} (${folder.index + 1} of ${workspace.workspaceFolders.length}) → ${basename(resource.fsPath)}`;
    console.log(text);
    */






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
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && event.document === activeEditor.document) {
            tags.triggerUpdateTags(activeEditor, TAGS, DECORATIONS, true);
        }
    }, null, context.subscriptions);

}
