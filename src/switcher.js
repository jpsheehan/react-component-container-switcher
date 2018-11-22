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
        
        if (info.otherParentPaths && info.otherParentPaths.length) {

            // at this point, we don't have an 'other' file to switch to, but we can create one
            
            // prompt the user to create one
            vscode.window.showQuickPick(['Yes', 'No'], {
                canPickMany: false,
                placeHolder: `An existing ${info.otherType} doesn't exist, would you like to create one?`,
            }).then((selection) => {

                if (selection && selection === 'Yes') {

                    console.log(`Here, we would create a new ${info.otherType}`);

                }

            });

        } else {

            vscode.window.showErrorMessage(info.error);
        
        }

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
