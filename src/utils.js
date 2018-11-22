const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const errors = require('./errors');

const validExtensions = ['.js', '.ts', '.jsx', '.tsx'];
const validContainerFolders = ['container', 'Container', 'containers', 'Containers'];
const validComponentFolders = ['component', 'Component', 'components', 'Components'];

const FileType = {
    Indeterminate: '',
    Component: 'Component',
    Container: 'Container',
};

const ColumnPosition = {
    Same: vscode.ViewColumn.Active,
    Left: vscode.ViewColumn.One,
    Right: vscode.ViewColumn.Two,
};

/**
 * Gets the column to open the document in depending on the configuration and whether
 * or not it's a container or a component.
 * 
 * @param {String} type The type of file as returned by `detectTypeOfFile`
 * @return {Number} Returns the column id where the document should be opened.
 */
function getColumnToOpenIn(type) {

    const positionConfig = vscode.workspace.getConfiguration().get('rccs.alwaysOpenContainersToTheLeft');
    
    if (positionConfig === 'Same') {

        return ColumnPosition.Same;

    } else {

        if (type === FileType.Container) {

            return ColumnPosition[positionConfig];

        } else {

            if (positionConfig === 'Left') {

                return ColumnPosition.Right;

            } else {

                return ColumnPosition.Left;

            }

        }

    }

}

/**
 * Attempts to detect the type of file this is.
 * @param {String} filePath The path of the file to detect the type of.
 * @return {String} Returns a FileType
 */
function detectFileType(filePath) {

    const parentName = path.basename(path.resolve(filePath, '..'));
    const grandParentName = path.basename(path.resolve(filePath, '..', '..'));

    // check if parent isn't a component folder
    if (validComponentFolders.indexOf(parentName) === -1) {

        // check if parent isn't a container folder
        if (validContainerFolders.indexOf(parentName) === -1) {

            // check if grandparent isn't a component folder
            if (validComponentFolders.indexOf(grandParentName) === -1) {

                // check if grandparent isn't a container folder
                if (validContainerFolders.indexOf(grandParentName) === -1) {

                    // this is probably not a component or a container
                    return FileType.Indeterminate;

                } else {
                    return FileType.Container;
                }

            } else {
                return FileType.Component;
            }

        } else {
            return FileType.Container;
        }

    } else {
        return FileType.Component;
    }
}

/**
 * Gets the filename of the currently opened file.
 * @param {Object} uri The URI of the currently opened file.
 * @return {String?} The filename of the file opened by the editor or null
 *  if the file hasn't been saved, there is no file open, or if the file is
 *  not a JavaScript/TypeScript file.
 */
function getPath(uri) {

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
 * @return {String|Object}
 */
function getOtherPath(filePath) {

    // get some basic, but neccessary file and folder information
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath, fileExt);

    const parentPath = path.resolve(path.join(filePath, '..'));
    const parentName = path.basename(parentPath);

    const grandParentPath = path.resolve(parentPath, '..');
    const grandParentName = path.basename(grandParentPath);

    let thisFolders = null;
    let thatFolders = null;

    // detect the type of path this is (component/container)
    switch (detectFileType(filePath)) {
        case FileType.Component:
            thisFolders = validComponentFolders;
            thatFolders = validContainerFolders;
            break;
        case FileType.Container:
            thisFolders = validContainerFolders;
            thatFolders = validComponentFolders;
            break;
        default:
            return {error: errors.ERROR_COULD_NOT_DETERMINE};
    }

    // detect the container name
    let thisName = null;
    let thisFolderPath = null;
    let thatPathIndex = null;
    let isThisInFolder = null;

    // we check if its parent has a valid container name
    thatPathIndex = thisFolders.indexOf(parentName);
    if (thatPathIndex !== -1) {

        thisName = fileName;
        thisFolderPath = parentPath;
        isThisInFolder = false;

    } else {

        // otherwise, if this file is index.js or index.ts, check to see if its grandparent
        // has a valid container name
        thatPathIndex = thisFolders.indexOf(grandParentName);
        if (fileName === 'index' && thatPathIndex !== -1) {

            thisName = parentName;
            thisFolderPath = grandParentPath;
            isThisInFolder = true;

        }

    }

    if (!(thisName && thisFolderPath)) {

        // this shouldn't be reached but it's still good to check
        return {error: errors.ERROR_COULD_NOT_FIND};
    
    }

    // attempt to find the corresponding component that best matches what
    // kind of layout the container has. We search through all possible
    // validComponentFolders with the suggested folder name first.
    const suggestedFolderName = thatFolders[thatPathIndex];

    // reorder these so that we are looking for the preferred filename extension and folder names first
    const reorderedValidExtensions = [fileExt, ...validExtensions.filter((ext) => ext !== fileExt)];
    const reorderedValidThatFolders = [suggestedFolderName, ...thatFolders.filter((folderName) => folderName !== suggestedFolderName)];

    for (let ext of reorderedValidExtensions) {

        for (let thatFolderName of reorderedValidThatFolders) {

            // the parent directory of the component if the parent directory name is correct.
            const thatParentPath = path.resolve(path.join(thisFolderPath, '..', thatFolderName));

            // the path of the component if it is indeed inside a folder
            const thatPathFolder = path.join(thatParentPath, thisName, 'index' + ext);

            // the path of the component if it is in a file by itself.
            const thatPathStandalone = path.join(thatParentPath, thisName + ext);

            let thatPath = null;
            
            // here, we will try both the folder and standalone paths but in the order that is
            // inferred by the location of the container
            if (isThisInFolder) {

                thatPath = thatPathFolder;
                if (fs.existsSync(thatPath)) {
                    return thatPath;
                }

                thatPath = thatPathStandalone;
                if (fs.existsSync(thatPath)) {
                    return thatPath;
                }

            } else {

                thatPath = thatPathStandalone;
                if (fs.existsSync(thatPath)) {
                    return thatPath;
                }

                thatPath = thatPathFolder;
                if (fs.existsSync(thatPath)) {
                    return thatPath;
                }

            }

        }
    
    }

    return {error: errors.ERROR_COULD_NOT_FIND};

}

module.exports = {
    getOtherPath,
    getPath,
    detectFileType,
    getColumnToOpenIn,
};
