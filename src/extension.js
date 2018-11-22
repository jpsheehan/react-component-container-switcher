// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const {switcher} = require('./switcher');
const {StatusBarMonitor} = require('./statusBarMonitor');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    const statusBarMonitor = new StatusBarMonitor();
    vscode.window.onDidChangeActiveTextEditor((editor) => statusBarMonitor.listener(editor.document))

    context.subscriptions.push(vscode.commands.registerCommand('extension.switch', switcher));

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    
    // TODO: should probably dispose of things here...

}
exports.deactivate = deactivate;