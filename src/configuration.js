const vscode = require('vscode');

function getContainerOpeningColumn() {
    return vscode.workspace.getConfiguration().get('rccs.alwaysOpenContainersToTheLeft');
}

function getEnableStatusBarItem() {
    return vscode.workspace.getConfiguration().get('rccs.enableStatusBarItem');
}

module.exports = {
    getContainerOpeningColumn,
    getEnableStatusBarItem,
};
