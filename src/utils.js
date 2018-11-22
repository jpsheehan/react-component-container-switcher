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
 * A better version of fs.existsSync because Windows doesn't play nicely with
 * case sensitive folder names apparently...
 * 
 * @param {String} path The path to the resouce.
 * @return {Boolean} True if the resource exists, false otherwise.
 */
function existsSync(path) {
    try {
        fs.accessSync(path, fs.constants.F_OK | fs.constants.R_OK)
        return true;
    } catch (err) {
        return false;
    }
}

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
 * Gets a whole bunch of information about the file.
 * 
 * @param {String} filePath The file path.
 * @return {Object} Returns an object in the form:
 * ```
{
    name,
    type,
    isStandAlone,
    extension,
    path,
    otherPath, // only set when no error occurs
    otherType,
    otherParentPaths, // contains possible directories where the other file can live IF it doesn't exist
    error, // only set when an error occurs
}```
 */
function getFileInformation(filePath) {

    const info = {};

    info.path = filePath;
    info.extension = path.extname(info.path);

    // get some basic, but neccessary file and folder information
    const fileName = path.basename(info.path, info.extension);

    const parentPath = path.resolve(filePath, '..');
    const parentName = path.basename(parentPath);

    const grandParentPath = path.resolve(parentPath, '..');
    const grandParentName = path.basename(grandParentPath);

    let thisFolders = null;
    let thatFolders = null;

    info.type = detectFileType(info.path);

    // detect the type of path this is (component/container)
    switch (info.type) {
        case FileType.Component:
            thisFolders = validComponentFolders;
            thatFolders = validContainerFolders;
            info.otherType = FileType.Container;
            break;
        case FileType.Container:
            thisFolders = validContainerFolders;
            thatFolders = validComponentFolders;
            info.otherType = FileType.Component;
            break;
        default:
            return {error: errors.ERROR_COULD_NOT_DETERMINE};
    }

    // detect the container name
    let thisFolderPath = null;
    let thatPathIndex = null;

    // we check if its parent has a valid container name
    thatPathIndex = thisFolders.indexOf(parentName);
    if (thatPathIndex !== -1) {

        info.name = fileName;
        thisFolderPath = parentPath;
        info.isStandalone = false;

    } else {

        // otherwise, if this file is index.js or index.ts, check to see if its grandparent
        // has a valid container name
        thatPathIndex = thisFolders.indexOf(grandParentName);
        if (fileName === 'index' && thatPathIndex !== -1) {

            info.name = parentName;
            thisFolderPath = grandParentPath;
            info.isStandalone = true;

        }

    }

    if (!(info.name && thisFolderPath)) {

        // this shouldn't be reached but it's still good to check
        return {error: errors.ERROR_COULD_NOT_FIND};

    }

    // attempt to find the corresponding component that best matches what
    // kind of layout the container has. We search through all possible
    // validComponentFolders with the suggested folder name first.
    const suggestedFolderName = thatFolders[thatPathIndex];

    // reorder these so that we are looking for the preferred filename extension and folder names first
    const reorderedValidExtensions = [info.extension, ...validExtensions.filter((ext) => ext !== info.extension)];
    const reorderedValidThatFolders = [suggestedFolderName, ...thatFolders.filter((folderName) => folderName !== suggestedFolderName)];

    info.otherParentPaths = [];

    for (let ext of reorderedValidExtensions) {

        for (let thatFolderName of reorderedValidThatFolders) {

            // the parent directory of the component if the parent directory name is correct.
            const thatParentPath = path.resolve(path.join(thisFolderPath, '..', thatFolderName));

            // check to see if the parent folder actually exists on the filesystem
            // this avoids us having to make other fs checks
            if (existsSync(thatParentPath)) {

                // if this path isn't in the info.otherParentPaths, append it to the array
                if (info.otherParentPaths.indexOf(thatParentPath) === -1) {

                    // windows has case insensitive filesystems (NTFS, FAT, etc)
                    // so we must perform a check to see if the case insensitive path
                    // already exists in the array

                    if (info.otherParentPaths.filter(
                        (path) => path.toLowerCase() === thatParentPath.toLowerCase()
                        ).length === 0) {

                        info.otherParentPaths.push(thatParentPath);

                    }

                }

                // the path of the component if it is indeed inside a folder
                const thatPathFolder = path.join(thatParentPath, info.name, 'index' + ext);

                // the path of the component if it is in a file by itself.
                const thatPathStandalone = path.join(thatParentPath, info.name + ext);

                // here, we will try both the folder and standalone paths but in the order that is
                // inferred by the location of the container
                if (info.isStandalone) {

                    info.otherPath = thatPathFolder;
                    if (existsSync(info.otherPath)) {
                        return info;
                    }

                    info.otherPath = thatPathStandalone;
                    if (existsSync(info.otherPath)) {
                        return info;
                    }

                } else {

                    info.otherPath = thatPathStandalone;
                    if (existsSync(info.otherPath)) {
                        return info;
                    }

                    info.otherPath = thatPathFolder;
                    if (existsSync(info.otherPath)) {
                        return info;
                    }

                }

            }

        }

    }

    info.otherPath = '';
    info.error = errors.ERROR_COULD_NOT_FIND;

    return info;

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

module.exports = {
    getFileInformation,
    getPath,
    detectFileType,
    getColumnToOpenIn,
};
