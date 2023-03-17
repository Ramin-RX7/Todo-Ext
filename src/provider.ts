import * as vscode from 'vscode';
import * as path from 'path';


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
        console.log(element);

        return Promise.resolve(
          [new Dependency("Test","Ver",vscode.TreeItemCollapsibleState.None)]
        );

    } else { // open tree view (root)
        let list = []
        this.workspaceRoots.forEach(dir => {
            list.push(new Dependency(dir.name,"Version",vscode.TreeItemCollapsibleState.Collapsed))
        });
        return Promise.resolve(list)
    }
  }


}

class Dependency extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private version: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}-${this.version}`;
        this.description = this.version;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    };
}
