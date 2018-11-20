const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const errors = require('./errors');

const validExtensions = ['.js', '.ts'];
const validContainerFolders = ['container', 'Container', 'containers', 'Containers'];
const validComponentFolders = ['component', 'Component', 'components', 'Components'];

/**
 * Gets the filename of the currently opened editor.
 * @param {Object} editor The currently opened editor.
 * @return {String?} The filename of the file opened by the editor or null
 *  if the file hasn't been saved, there is no file open, or if the file is
 *  not a JavaScript/TypeScript file.
 */
function getPath(editor) {

    if (!editor) {
        return null;
    }

    const uri = editor.document.uri;

    if (!uri.fsPath || uri.scheme !== 'file') {
        return null;
    }

    const fsPath = uri.fsPath;
    const ext = path.extname(fsPath);

    // make sure the filename extension is valid.
    if (validExtensions.indexOf(ext) === -1) {
        return null;
    }

    return fsPath;

}

/**
 * Decides whether or not the path is a belongs to a container.
 * @param {String} filePath The filename path of the active container or the component.
 * @return {any}
 */
function getOtherPath(filePath) {

    // get some basic, but neccessary file and folder information
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath, fileExt);

    const parentPath = path.resolve(path.join(filePath, '..'));
    const parentName = path.basename(parentPath);

    const grandParentPath = path.resolve(parentPath, '..');
    const grandParentName = path.basename(grandParentPath);

    // detect the type of path this is (component/container)
    let isThisContainer = null;
    let thisFolders = null;
    let thatFolders = null;

    // check if parent isn't a component folder
    if (validComponentFolders.indexOf(parentName) === -1) {

        // check if parent isn't a container folder
        if (validContainerFolders.indexOf(parentName) === -1) {

            // check if grandparent isn't a component folder
            if (validComponentFolders.indexOf(grandParentName) === -1) {

                // check if grandparent isn't a container folder
                if (validContainerFolders.indexOf(grandParentName) === -1) {

                    // this is probably not a component or a container
                    return {error: errors.ERROR_COULD_NOT_DETERMINE};

                } else {
                    isThisContainer = true;
                }

            } else {
                isThisContainer = false;
            }

        } else {
            isThisContainer = true;
        }

    } else {
        isThisContainer = false;
    }

    if (isThisContainer) {
        thisFolders = validContainerFolders;
        thatFolders = validComponentFolders;
    } else {
        thisFolders = validComponentFolders;
        thatFolders = validContainerFolders;
    }

    // detect the container name
    let containerName = null;
    let containerFolderPath = null;
    let componentPathIndex = null;
    let isContainerInFolder = null;

    // we check if its parent has a valid container name
    componentPathIndex = thisFolders.indexOf(parentName);
    if (componentPathIndex !== -1) {

        containerName = fileName;
        containerFolderPath = parentPath;
        isContainerInFolder = false;

    } else {

        // otherwise, if this file is index.js or index.ts, check to see if its grandparent
        // has a valid container name
        componentPathIndex = thisFolders.indexOf(grandParentName);
        if (fileName === 'index' && componentPathIndex !== -1) {

            containerName = parentName;
            containerFolderPath = grandParentPath;
            isContainerInFolder = true;

        }

    }

    if (!(containerName && containerFolderPath)) {

        // this shouldn't be reached but it's still good to check
        return {error: errors.ERROR_COULD_NOT_FIND};
    
    }

    // attempt to find the corresponding component that best matches what
    // kind of layout the container has. We search through all possible
    // validComponentFolders with the suggested folder name first.
    const suggestedFolderName = thatFolders[componentPathIndex];
    let componentPath = null;
    let componentExists = null;

    for (let componentFolderName of [suggestedFolderName, ...thatFolders.filter((folderName) => folderName !== suggestedFolderName)]) {

        // the parent directory of the component if the parent directory name is correct.
        const componentParentPath = path.resolve(path.join(containerFolderPath, '..', componentFolderName));

        // the path of the component if it is indeed inside a folder
        const componentPathFolder = path.join(componentParentPath, containerName, 'index' + fileExt);

        // the path of the component if it is in a file by itself.
        const componentPathStandalone = path.join(componentParentPath, containerName + fileExt);
        
        // here, we will try both the folder and standalone paths but in the order that is
        // inferred by the location of the container
        if (isContainerInFolder) {

            componentPath = componentPathFolder;
            componentExists = fs.existsSync(componentPath);

            if (componentExists) {
                break;

            } else {

                componentPath = componentPathStandalone;
                componentExists = fs.existsSync(componentPath);

                if (componentExists) {
                    break;
                }

            }

        } else {

            componentPath = componentPathStandalone;
            componentExists = fs.existsSync(componentPath);

            if (componentExists) {
                break;

            } else {

                componentPath = componentPathFolder;
                componentExists = fs.existsSync(componentPath);

                if (componentExists) {
                    break;
                }

            }

        }

    }

    if (componentExists) {

        return componentPath;

    }

    return {error: errors.ERROR_COULD_NOT_FIND};

}

function switchToOther() {

    const path = getPath(vscode.window.activeTextEditor);

    if (!path) {
        vscode.window.showErrorMessage(errors.ERROR_NOT_OPENED);
        return;
    }

    const component = getOtherPath(path);

    if (component.error) {
        vscode.window.showErrorMessage(component.error);
        return;
    }

    // open the document in an editor
    vscode.workspace.openTextDocument(component).then((document) => {
        vscode.window.showTextDocument(document);
    }, (err) => {
        vscode.window.showErrorMessage(err.toString());
    });

}

module.exports = {
    switchToOther,
};
