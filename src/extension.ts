import * as vscode from 'vscode';
import assert = require('assert');

import {getConfigs} from './conf';
import tags = require("./tags")
import tasks = require("./tasks")

var config = getConfigs()



export function activate(context: vscode.ExtensionContext) {

    console.log('"RX-Todo" extension is activated');

    let activeEditor = vscode.window.activeTextEditor;


    var TAGS = tags.TAGS
    var DECORATIONS = tags.DECORATIONS










    context.subscriptions.push(tags.tagCompletion)
	context.subscriptions.push(tasks.toTask, tasks.cancelTask, tasks.completeTask);
	context.subscriptions.push(tasks.switchTask);


    if (activeEditor) {
        tags.triggerUpdateTags(activeEditor, TAGS, DECORATIONS);
    }


    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (activeEditor) {
            tags.triggerUpdateTags(activeEditor, TAGS, DECORATIONS);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            tags.triggerUpdateTags(activeEditor, TAGS, DECORATIONS, true);
        }
    }, null, context.subscriptions);

}
