//> Running python from js (node)
/*
const spawn = require("child_process").spawn;
const pythonProcess = spawn('python',["test.py","arg1","arg2"]);
let a
pythonProcess.stdout.on('data', async (data) => {
    a = (data.toString().split("\n"));
    console.log(a);
})
*/


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



// fs.readFile('F:/Coding/Github/DramaX/requirements.txt', 'utf-8', function(err, data){
    // if (err) {throw err};
    // console.log(data)
    //   var newValue = data.replace(/^\./gim, 'myString');
    //   fs.writeFile('F:/Coding/Github/DramaX/requirements.txt', newValue, 'utf-8', function (err) {
        // if (err) throw err;
        // console.log('filelistAsync complete');
    //   });
// });
