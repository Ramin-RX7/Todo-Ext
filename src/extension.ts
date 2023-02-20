import * as vscode from 'vscode';
import assert = require('assert');


export function activate(context: vscode.ExtensionContext) {

    console.log('"RX-Todo" extension is activated');

    let config = vscode.workspace.getConfiguration("todo-ext")
    let activeEditor = vscode.window.activeTextEditor;


    var TAGS: String[], DECORATIONS:{[key:string]:any[]};
    [TAGS,DECORATIONS] = prepareTags(config);













	context.subscriptions.push(toTask);


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
















function prepareTags(config:vscode.WorkspaceConfiguration){
    //> Built-in tags  &  User-defined tags
    const BUILTIN_TAGS_MAP: {[key:string]:{[key:string]:string}} = {
        "low"       :   {backgroundColor:"#EEE"   , color:"#000"},
        "med"       :   {backgroundColor:"#E6DD4E", color:"#000"},
        "high"      :   {backgroundColor:"#C00000", overviewRulerColor:"#C00000"},
        "critical"  :   {backgroundColor:"#800000", overviewRulerColor:"#800000"},
        "normal_tag":   {backgroundColor:"#3355ff",}
    }
    const BUILTIN_TAGS_LIST = Object.keys(BUILTIN_TAGS_MAP)
    const USER_TAGS_MAP: {[key:string]:{[key:string]:string}} = {...config.tags}
    const USER_TAGS_LIST = Object.keys(USER_TAGS_MAP)

    const TAGS = [...BUILTIN_TAGS_LIST, ...USER_TAGS_LIST];
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






const toTask = vscode.commands.registerCommand('Todo.toTask', function() {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;

    if (editor) {

        const position = editor.selection.active;
        const document = editor.document;

        var task_waiting   =  "☐"
        var task_done      =  "✔"
        var task_cancelled =  "✘"

        var line = document.lineAt(position.line)
        var line_text = line["b"]

        var regEx = /(?<Indent>\s*)(?<Task>.*)/;
        var match = regEx.exec(line_text)
        // assert(match?.groups);
        var Task_Text = match.groups.Task

        var new_text = "";
        if (Task_Text.startsWith(task_done) || Task_Text.startsWith(task_cancelled)){
            // new_text = Task_Text;
        } else if (Task_Text.startsWith(task_waiting)){
            new_text = Task_Text.slice(1)
            var regex2 = /(?<ExtraSpaces>\s*)(.*)/;
            var match2 = regex2.exec(new_text)
            // assert(match2?.groups);
            if (match2.groups){
                new_text = new_text.slice(match2.groups.ExtraSpaces.length)
            }
        } else {
            new_text = task_waiting + " " + Task_Text
        }

        if (new_text){
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
        }
    }

});