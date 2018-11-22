const vscode = require('vscode');
const {
    getPath, getFileInformation, getColumnToOpenIn,
} = require('./utils');
const errors = require('./errors');

function switcher() {

    let thisPath = null;
    
    if (vscode.window.activeTextEditor) {
        thisPath = getPath(vscode.window.activeTextEditor.document.uri);
    }

    if (!thisPath) {
        vscode.window.showErrorMessage(errors.ERROR_NOT_OPENED);
        return;
    }

    const info = getFileInformation(thisPath);

    if (info.error) {
        vscode.window.showErrorMessage(info.error);
        return;
    }

    // open the document in an editor
    vscode.workspace.openTextDocument(info.otherPath).then((document) => {
        vscode.window.showTextDocument(document, getColumnToOpenIn(info.otherType));
    }, (err) => {
        vscode.window.showErrorMessage(err.toString());
    });

}

module.exports = {
    switcher,
};
