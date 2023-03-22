import * as vscode from 'vscode';
import * as path from 'path';

import BUILTINS = require("./builtins")
import FUNCTIONS = require("./functions")
import TAGS = require("./tags")

var config = BUILTINS.config



export class TreeView implements vscode.TreeDataProvider<TreeItem> {
    static childrenList = ["WorkspaceDir", "Category", "Task"]

    constructor(private  workspaceRoots: vscode.WorkspaceFolder[]) {}

    private _onDidChangeTreeData
        : vscode.EventEmitter<TreeItem | undefined | null | void>
        = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData
        : vscode.Event<TreeItem | undefined | null | void>
        = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (!this.workspaceRoots) {
            vscode.window.showInformationMessage('No todo file in empty workspace');
            return Promise.resolve([]);
        }

        if (!element){  // when opening grand-children elements
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
                list.push(new TreeItem(
                            dir.name,
                            "",// (dir.index +1).toString(),
                            tooltip,
                            state,
                            "WorkspaceDir",
                            dir.uri,
                ))
            });
            return Promise.resolve(list)
        }
        let labels
        switch (element.type) { // when opening grand-children elements

            case "WorkspaceDir": {
                let todo_file = FUNCTIONS.get_dir_todo(element.uri)
                let [modules_tasks, TAGS_DICT, tasks_status] = FUNCTIONS.extract_tasks_category(todo_file)

                labels = []
                let collapsibleState
                TAGS.DEFINED_TAGS.forEach(tag => {
                    collapsibleState =
                        TAGS_DICT[tag].length ?  vscode.TreeItemCollapsibleState.Collapsed
                                       :  vscode.TreeItemCollapsibleState.None
                    labels.push([tag,"Tag",collapsibleState])
                })
                Object.keys(config.tasksSymbols).forEach(state_name => {
                    let label = `${state_name}  (${config.tasksSymbols[state_name]})`
                    collapsibleState =
                    tasks_status[label].length ?  vscode.TreeItemCollapsibleState.Collapsed
                                               :  vscode.TreeItemCollapsibleState.None
                    labels.push([label,"State",collapsibleState])
                })
                Object.keys(modules_tasks).forEach(module => {
                    collapsibleState =
                    modules_tasks[module].length ?  vscode.TreeItemCollapsibleState.Collapsed
                                                 :  vscode.TreeItemCollapsibleState.None
                    labels.push([module,"Module",collapsibleState])
                });
                let dependencies = labels.map(label => new TreeItem(
                    label[0],
                    label[1],
                    label,
                    label[2],
                    // vscode.TreeItemCollapsibleState.Collapsed,
                    "Category",
                    // element.uri
                    vscode.Uri.file(todo_file)
                ))
                return Promise.resolve(dependencies)
            }

            case "Category": {
                labels = []
                let [modules_tasks, TAGS_DICT, tasks_status] = FUNCTIONS.extract_tasks_category(element.uri.fsPath)
                // console.log(modules_tasks);
                // console.log(TAGS_DICT);
                // console.log(element.label);
                let list =
                  Object.keys(TAGS_DICT).includes(element.label)     ?  TAGS_DICT
                : Object.keys(modules_tasks).includes(element.label) ?  modules_tasks
                :                                                       tasks_status;

                console.log(tasks_status[`done  (${config.tasksSymbols["done"]})`].map(label=>label[1]));

                list[element.label].forEach(task => {
                    let task_state = "Task";
                    let tooltip = task[0]
                    if (tasks_status[`done  (${config.tasksSymbols["done"]})`].map(label=>label[1]).includes(task[1])){
                        task_state = "TaskCompleted"
                        tooltip += " (Completed)"
                    }

                    labels.push(new TreeItem(
                        task[0],
                        "",
                        tooltip,
                        vscode.TreeItemCollapsibleState.None,
                        task_state,
                        element.uri,
                        task[1]
                    ))
                })
                return Promise.resolve(labels)
            }

            default:
                break;
        }

    }
}

class TreeItem extends vscode.TreeItem {
    constructor(
        public readonly label,
        public description: string,
        public tooltip:string,
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public type,
        public uri,
        public line?
    ) {
        super(label, collapsibleState);
        this.contextValue = type
        if (line){
            this.command = {title:"title", command:"Todo.moveCursor",
                            arguments: [uri.fsPath, line],
            }
        }
    }

    // iconPath = {
    //     light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    //     dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    // };
}
