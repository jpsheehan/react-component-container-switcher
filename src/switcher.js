const vscode = require('vscode');
const {
    getPath, getOtherPath,
    detectFileType, getColumnToOpenIn,
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

    const thatPath = getOtherPath(thisPath);
    const thatType = detectFileType(thatPath);

    if (thatPath.error) {
        vscode.window.showErrorMessage(thatPath.error);
        return;
    }

    // open the document in an editor
    vscode.workspace.openTextDocument(thatPath).then((document) => {
        vscode.window.showTextDocument(document, getColumnToOpenIn(thatType));
    }, (err) => {
        vscode.window.showErrorMessage(err.toString());
    });

}

module.exports = {
    switcher,
};
