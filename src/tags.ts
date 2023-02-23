import * as vscode from 'vscode';
import assert = require('assert');

import {getConfigs} from './conf';
var config = getConfigs()


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




export function prepareTags(){

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
}

export function updateTags(activeEditor:vscode.TextEditor|undefined,
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

export function triggerUpdateTags(activeEditor:vscode.TextEditor|undefined,
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




export var tagCompletion = vscode.languages.registerCompletionItemProvider('todo', {

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
        let snippets = [];

        const snippetCompletion = new vscode.CompletionItem('New Task');
        snippetCompletion.documentation = new vscode.MarkdownString("Inserts a new task");
        snippetCompletion.insertText = new vscode.SnippetString("");
        snippetCompletion.command = { command:'Todo.toTask', title:"" };
        snippets.push(snippetCompletion);

        (TAGS).forEach(tag => {
            let snippet = new vscode.CompletionItem(tag)
            snippet.insertText = '@'+tag+" "
            snippet.kind = vscode.CompletionItemKind.EnumMember
            snippets.push(snippet);
        });

        return snippets;
    }
});




export {TAGS}
