import * as vscode from 'vscode';
import * as path from 'path';

import FUNCTIONS = require("./functions")


export class NodeDependenciesProvider implements vscode.TreeDataProvider<Dependency> {
    constructor(
        private  workspaceRoots: vscode.WorkspaceFolder[]) {
    }

    getTreeItem(element: Dependency): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Dependency): Thenable<Dependency[]> {
        if (!this.workspaceRoots) {
            vscode.window.showInformationMessage('No todo file in empty workspace');
            return Promise.resolve([]);
        }

        if (element) {
            let todo_file = FUNCTIONS.get_dir_todo(element.uri)
            // console.log(todo_file);
            return Promise.resolve([new Dependency(
                element.label,
                "",
                todo_file,
                "",
                vscode.TreeItemCollapsibleState.None,
            )]);

        } else { // open tree view (root)
            let list = []
            this.workspaceRoots.forEach(dir => {
                let state,tooltip,todo_file
                todo_file = FUNCTIONS.get_dir_todo(dir.uri)
                if (todo_file){
                    state = vscode.TreeItemCollapsibleState.Collapsed
                    tooltip = path.basename(todo_file)
                } else {
                    state = vscode.TreeItemCollapsibleState.None
                    tooltip = "No `todo` files found"
                }
                list.push(new Dependency(
                            dir.name,
                            "",// (dir.index +1).toString(),
                            dir.uri,
                            tooltip,
                            state,
                ))
            });
            return Promise.resolve(list)
        }
    }


}

class Dependency extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private version: string,
        public uri,
        public tooltip:string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);
    }
    // iconPath = {
    //     light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
}
