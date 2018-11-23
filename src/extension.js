// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const {switcher} = require('./switcher');
const {StatusBarMonitor} = require('./statusBarMonitor');

const disposables = [];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    const statusBarMonitor = new StatusBarMonitor(context.subscriptions);
    const switchCommand = vscode.commands.registerCommand('extension.switch', switcher);

    const onActiveEditorChange = vscode.window.onDidChangeActiveTextEditor(
        (editor) => statusBarMonitor.listener(editor.document)
    );

    disposables.push(onActiveEditorChange);
    disposables.push(switchCommand);
    disposables.push(statusBarMonitor);

    disposables.forEach((disposable) => {
        context.subscriptions.push(disposable);
    });

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    
    disposables.forEach((disposable) => {
        if (disposable.hasOwnProperty('dispose') || disposable.dispose) {
            disposable.dispose();
        }
    });

}
exports.deactivate = deactivate;