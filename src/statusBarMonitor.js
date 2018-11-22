const vscode = require('vscode');
const {
    getPath, detectFileType,
} = require('./utils');

class StatusBarMonitor {

    constructor() {

        // setup the StatusBarItem
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.item.command = 'extension.switch';

    }

    /**
     * Changes the status bar message based on the open file.
     * 
     * @param {vscode.TextDocument} document The opened document.
     */
    listener(document) {
        
        const path = getPath(document.uri);

        if (path) {
    
            const fileType = detectFileType(path);
            const otherFileType = fileType === 'Component'
                ? 'Container'
                : 'Component';
    
            if (fileType) {
    
                // show the item
                this.item.text = `React ${fileType}`;
                this.item.tooltip = `Click to switch to the associated React ${otherFileType}`;
                this.item.show();
    
            } else {

                // hide the item
                this.item.hide();

            }
    
        } else {

            // hide the item
            this.item.hide();

        }

    }

    /**
     * Disposes of the StatusBarItem.
     */
    dispose() {

        this.item.dispose();

    }

}

module.exports = {
    StatusBarMonitor
};
