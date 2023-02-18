"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
// this method is called when vs code is activated
function activate(context) {
    console.log('"RX-Todo" extension is activated');
    let timeout = undefined;
    // create a decorator type that we use to decorate small numbers
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
    // create a decorator type that we use to decorate large numbers
    const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
        cursor: 'crosshair',
        // use a themable color. See package.json for the declaration and default values.
        backgroundColor: { id: 'myextension.largeNumberBackground' }
    });
    let activeEditor = vscode.window.activeTextEditor;
    function updateDecorations2() {
        if (!activeEditor || activeEditor.document.languageId !== "todo") {
            return;
        }
        const text = activeEditor.document.getText();
        const regEx = /(?<TAG>@(?<TAGNAME>[^ ]+)) /g;
        const allTagsList = [];
        const TAGS = ["easy", "med", "high"];
        const tagsList = {};
        TAGS.forEach(element => {
            tagsList[element] = [];
        });
        tagsList.normal_tag = [];
        console.log(tagsList);
        let match;
        while ((match = regEx.exec(text))) {
            // console.log(match.groups.TAGNAME);
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
        activeEditor.setDecorations(smallNumberDecorationType, allTagsList);
    }
    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations2, 500);
        }
        else {
            updateDecorations2();
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