import * as vscode from 'vscode';
import assert = require('assert');

import {getConfigs} from './conf';


var config = getConfigs()



export function activate(context: vscode.ExtensionContext) {

    console.log('"RX-Todo" extension is activated');


    let activeEditor = vscode.window.activeTextEditor;


    var  TAGS:string[], DECORATIONS:{[key:string]:any[]};
    [TAGS,DECORATIONS] = prepareTags();











    // context.subscriptions.push(provider1, provider2)
	context.subscriptions.push(toTask, cancelTask, completeTask);
	context.subscriptions.push(switchTask);


    if (activeEditor) {
        triggerUpdateTags(activeEditor, TAGS, DECORATIONS);
    }


    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateTags(activeEditor, TAGS, DECORATIONS);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateTags(activeEditor, TAGS, DECORATIONS, true);
        }
    }, null, context.subscriptions);

}
















function prepareTags(){
    //> Built-in tags  &  User-defined tags
    const BUILTIN_TAGS_MAP: {[key:string]:{[key:string]:string}} = {
        "low"       :   {backgroundColor:"#EEEEEE", color:"#000"},
        "med"       :   {backgroundColor:"#E6DD4E", color:"#000"},
        "high"      :   {backgroundColor:"#C00000", overviewRulerColor:"#C00000"},
        "critical"  :   {backgroundColor:"#800000", overviewRulerColor:"#800000"},
        "normal_tag":   {backgroundColor:"#3355ff",}
    }
    const BUILTIN_TAGS_LIST = Object.keys(BUILTIN_TAGS_MAP)
    const USER_TAGS_MAP: {[key:string]:{[key:string]:string}} = {...config.tags}
    const USER_TAGS_LIST = Object.keys(USER_TAGS_MAP)

    const TAGS: string[] = [...BUILTIN_TAGS_LIST, ...USER_TAGS_LIST];
    // console.log(TAGS);


    //> getting decoration config for each implemented tag
    const DECORATIONS: {[key:string]:vscode.TextEditorDecorationType} = {}
    TAGS.forEach(tag => {
        if (config.tags[tag]){var conf = USER_TAGS_MAP[tag]}
        else                 {var conf = BUILTIN_TAGS_MAP[tag]}
        DECORATIONS[tag] = (
            vscode.window.createTextEditorDecorationType({
                dark: {
                    ...conf
                },
            })
        )
    });
    return [TAGS,DECORATIONS];
// console.log(DECORATIONS);
}

function updateTags(activeEditor:vscode.TextEditor|undefined,
                           TAGS:String[],
                           DECORATIONS:{[key:string]:any[]}){

    if (!activeEditor || activeEditor.document.languageId!=="todo") {
        return;
    }
    const text = activeEditor.document.getText();
    const allTagsList: vscode.DecorationOptions[] = []; // for now this is useless

    const tagsList: {[key:string]:any[]} = {};  // tagname:[decoration1,...]
    TAGS.forEach(element => {
        tagsList[element] = [];
    });
    tagsList.normal_tag = []
    // console.log(tagsList);

    //> Searching the document with regex for tags
    var regEx = /(?<TAG>@(?<TAGNAME>[^( |\n)]+))/g;
    let match;
    while ((match = regEx.exec(text))) {
        assert(match.groups);
        var tag = match.groups.TAG
        var tagname = match.groups.TAGNAME

        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + tag.length);
        const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + tag + '**' };

        // allTagsList.push(decoration);
        if (TAGS.includes(tagname)){
            tagsList[tagname].push(decoration)
        } else {
            tagsList["normal_tag"].push(decoration)
        }
    }
    // console.log(tagsList);

    Object.keys(DECORATIONS).forEach(tag => {
                                 // decoration       list of found regexes
        activeEditor.setDecorations(DECORATIONS[tag], tagsList[tag]);
    });
}

function triggerUpdateTags(activeEditor:vscode.TextEditor|undefined,
                                  TAGS:String[],
                                  DECORATIONS:{[key:string]:any[]},
                                  throttle = false) {

    let timeout: NodeJS.Timer|undefined = undefined;
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    if (throttle) {
        timeout = setTimeout(updateTags, 500, activeEditor=activeEditor, TAGS=TAGS, DECORATIONS=DECORATIONS);
    } else {
        updateTags(activeEditor, TAGS, DECORATIONS);
    }
}














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





