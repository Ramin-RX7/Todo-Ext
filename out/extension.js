"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const assert = require("assert");
const vscode = require("vscode");
// this method is called when vs code is activated
function activate(context) {
    console.log('"RX-Todo" extension is activated');
    let config = vscode.workspace.getConfiguration("todo-ext");
    let timeout = undefined;
    const BUILTIN_TAGS_MAP = {
        "low": { backgroundColor: "#EEE", color: "#000" },
        "med": { backgroundColor: "#E6DD4E", color: "#000" },
        "high": { backgroundColor: "#C00000", },
        "critical": { backgroundColor: "#800000", },
        "normal_tag": { backgroundColor: "#3355ff", }
    };
    const BUILTIN_TAGS_LIST = Object.keys(BUILTIN_TAGS_MAP); //["low","med","high"];
    const TAGS = [...BUILTIN_TAGS_LIST]; // later I should add custom tags defined in configs to this
    // create a decorator type that we use to decorate small numbers
    const DECORATIONS = {};
    TAGS.forEach(tag => {
        if (config[tag] != null) {
            var conf = config[tag];
        }
        else {
            var conf = BUILTIN_TAGS_MAP[tag];
        }
        DECORATIONS[tag] = (vscode.window.createTextEditorDecorationType({
            dark: {
                ...conf
            },
        }));
    });
    console.log(DECORATIONS);
    const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderStyle: 'solid',
        overviewRulerColor: 'blue',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            // this color will be used in light color themes
            borderColor: 'darkblue'
        },
        dark: {
            // this color will be used in dark color themes
            borderColor: 'lightblue'
        },
    });
    let activeEditor = vscode.window.activeTextEditor;
    function updateDecorations() {
        if (!activeEditor || activeEditor.document.languageId !== "todo") {
            return;
        }
        const text = activeEditor.document.getText();
        const regEx = /(?<TAG>@(?<TAGNAME>[^ ]+)) /g;
        const allTagsList = [];
        const tagsList = {};
        TAGS.forEach(element => {
            tagsList[element] = [];
        });
        tagsList.normal_tag = [];
        // console.log(tagsList);
        let match;
        while ((match = regEx.exec(text))) {
            // console.log(match.groups.TAGNAME);
            assert(match.groups);
            var tag = match.groups.TAG;
            var tagname = match.groups.TAGNAME;
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + tag.length);
            const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + tag + '**' };
            allTagsList.push(decoration);
            // console.log(decoration);
            if (TAGS.includes(tagname)) {
                tagsList[tagname].push(decoration);
            }
            else {
                tagsList["normal_tag"].push(decoration);
            }
        }
        // console.log(tagsList);
        // activeEditor.setDecorations(smallNumberDecorationType, tagsList['low'])
        // /*
        Object.keys(DECORATIONS).forEach(tag => {
            // decoration       list of found regexes
            activeEditor.setDecorations(DECORATIONS[tag], tagsList[tag]);
            // console.log(DECORATIONS[tag]);
            // console.log(tagsList[tag])
        });
        // */
    }
    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 500);
        }
        else {
            updateDecorations();
        }
    }
    if (activeEditor) {
        triggerUpdateDecorations();
    }
    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations(true);
        }
    }, null, context.subscriptions);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map