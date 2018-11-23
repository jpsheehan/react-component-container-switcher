const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const {
    getPath, getFileInformation, getColumnToOpenIn,
    existsSync,
} = require('./utils');
const errors = require('./errors');

// opens the document in an editor
function openDocument(fileInfo) {
    vscode.workspace.openTextDocument(fileInfo.otherPath).then((document) => {
        vscode.window.showTextDocument(document, getColumnToOpenIn(fileInfo.otherType));
    }, (err) => {
        vscode.window.showErrorMessage(err.toString());
    });
}

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

                    if (info.otherParentPaths.length === 1) {

                        const parentPath = info.otherParentPaths[0];
                        
                        let filePath = null;

                        if (info.isStandalone) {
                            
                            filePath = info.name + info.extension;

                        } else {

                            filePath = path.join(info.name, 'index' + info.extension);

                        }

                        vscode.window.showInputBox({
                            prompt: `Enter the path for the ${info.otherType}:`,
                            value: filePath,
                        }).then((chosenPath) => {

                            // verify that the path was chosen
                            if (chosenPath) {

                                info.otherPath = path.join(parentPath, chosenPath);
                                const chosenParent = path.join(info.otherPath, '..');

                                // create the parent if it doesn't exist
                                if (!existsSync(chosenParent)) {
                                    console.log(`Making parent ${chosenParent}`)
                                    fs.mkdirSync(chosenParent);
                                }

                                // safely create the file and then close it.
                                // does not overwrite if it exists
                                fs.closeSync(fs.openSync(info.otherPath, 'a'));

                                openDocument(info);

                            } else {

                                return;

                            }
                            
                        });

                    } else {

                        vscode.window.showWarningMessage(`We don't yet have support for similarly named folders :( send me an email`)

                    }

                }

            });

        } else {

            vscode.window.showErrorMessage(info.error);
        
        }

        return;
    
    } else {

        openDocument(info);

    }

}

module.exports = {
    switcher,
};
