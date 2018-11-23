const vscode = require('vscode');
const {
    getPath, getFileInformation,
} = require('./utils');

const config = require('./configuration');

class StatusBarMonitor {

    constructor(subscriptions) {

        // setup the StatusBarItem
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.item.command = 'extension.switch';
        subscriptions.push(this.item);

    }

    /**
     * Changes the status bar message based on the open file.
     * 
     * @param {vscode.TextDocument} document The opened document.
     */
    listener(document) {
        
        const path = getPath(document.uri);

        if (!config.getEnableStatusBarItem()) {

            this.item.hide();
            return;

        }

        if (path) {
    
            const info = getFileInformation(path);
    
            if (info.type) {
    
                // show the item
                if (info.otherPath) {

                    // set the text and tooltip for if the other file exists
                    this.item.text = `${info.name} ${info.type}`;
                    this.item.tooltip = `Click to switch to the ${info.name} ${info.otherType}.`;

                } else {

                    // set the text and tooltip for if the other file doesn't exist
                    this.item.text = `$(alert) ${info.name} ${info.type}`;
                    this.item.tooltip = `Click to create a new ${info.name} ${info.otherType}.`;

                }
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
