const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const {
    getPath, getFileInformation, getColumnToOpenIn,
    existsSync, FileType,
} = require('./utils');
const errors = require('./errors');
const templates = require('./templates');

const ComponentTypes = {
    Class: 'Class Component',
    Functional: 'Functional Component',
    Empty: 'Empty File',
};

/**
 * Creates a new document synchronously.
 * 
 * @param {Object} fileInfo Describes the file to create.
 */
function createNewDocument(fileInfo, componentType=null) {

    let data = '';

    if (fileInfo.type === FileType.Component) {

        if (componentType === ComponentTypes.Functional) {
            data = templates.classComponent(fileInfo);
        } else if (componentType === ComponentTypes.Class) {
            data = templates.functionalComponent(fileInfo);
        } else if (componentType === ComponentTypes.Empty) {
            data = '';
        }

    } else {

        data = templates.container(fileInfo);

    }

    fs.writeFileSync(fileInfo.path, data);
}

// opens the document in an editor
function openDocument(fileInfo) {
    vscode.workspace.openTextDocument(fileInfo.path).then((document) => {
        vscode.window.showTextDocument(document, getColumnToOpenIn(fileInfo.type));
    }, (err) => {
        vscode.window.showErrorMessage(err.toString());
    });
}

function promptForParentFolder(fileInfo, callback) {

    if (fileInfo.otherParentPaths.length === 1) {

        // in the case where there is only one valid parent directory, we just use it by default
        callback(fileInfo.otherParentPaths[0]);
    
    } else {
        
        // all the otherParentPaths are siblings so we can find their parent by looking
        // at just the first one
        const dirname = path.dirname(fileInfo.otherParentPaths[0]);

        // otherwise we prompt the user to select a directory
        vscode.window.showQuickPick(fileInfo.otherParentPaths.map(
            (parentPath) => path.basename(parentPath)
        ), {
            placeHolder: `Select the folder where you would like to add the ${fileInfo.name} ${fileInfo.otherType}`
        }).then(
            (folderName) => callback(path.join(dirname, folderName)),
            () => callback()
        );

    }

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

                // only take action if they've selected "Yes"
                if (selection && selection === 'Yes') {

                    promptForParentFolder(info, (selectedParentPath) => {

                        if (selectedParentPath) {

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
        
                                    info.otherPath = path.join(selectedParentPath, chosenPath);
                                    const chosenParent = path.join(info.otherPath, '..');
        
                                    // create the parent if it doesn't exist
                                    if (!existsSync(chosenParent)) {
                                        fs.mkdirSync(chosenParent);
                                    }

                                    // everything is ready,
                                    // create the document and open it
                                    const otherInfo = {
                                        name: info.name,
                                        type: info.otherType,
                                        path: info.otherPath,
                                        extension: path.extname(info.otherPath),
                                        isStandalone: path.basename(info.otherPath) !== ('index' + path.extname(info.otherPath)),
                                        otherType: info.type,
                                        otherPath: info.path,
                                        otherExtension: info.extension,
                                    };

                                    if (otherInfo.type === FileType.Component) {

                                        vscode.window.showQuickPick([...(Object.keys(ComponentTypes).map(key => ComponentTypes[key]))], {
                                            placeHolder: 'What kind of component do you want to create?',
                                        }).then((choice) => {
                                            createNewDocument(otherInfo, choice);
                                            openDocument(otherInfo);
                                        });

                                    } else {

                                        createNewDocument(otherInfo);
                                        openDocument(otherInfo);

                                    }

        
                                } else {
        
                                    return;
        
                                }
                                
                            });

                        }

                    });

                }

            });

        } else {

            vscode.window.showErrorMessage(info.error);
        
        }

        return;
    
    } else {

        openDocument({
            path: info.otherPath,
            type: info.otherType,
        });

    }

}

module.exports = {
    switcher,
};
