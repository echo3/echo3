/**
 * Command execution peer: Browser Open Window
 */
Echo.RemoteClient.CommandExec.BrowserOpenWindow = Core.extend(Echo.RemoteClient.CommandExec, {
    
    $static: {

        /** 
         * Flag to replace entry in browser's navigation history with new window content.  
         * Note that some browsers may ignore this flag. 
         * @type Number
         */
        FLAG_REPLACE: 0x1,
    
        /**
         * Flag to enable the browser's menu bar.
         * @type Number
         */
        FLAG_MENUBAR: 0x2,
    
        /**
         * Flag to enable the browser's tool bar.
         * @type Number
         */
        FLAG_TOOLBAR: 0x4,
    
        /**
         * Flag to enable the browser's location input field.
         * @type Number
         */
        FLAG_LOCATION: 0x8,
    
        /**
         * Flag to enable the browser's status field.
         * @type Number
         */
        FLAG_STATUS: 0x10,
    
        /**
         * Flag to recommend that the browser allow resizing of the window.  
         * Some environments may always allow the window to be resized.
         * @type Number
         */
        FLAG_RESIZABLE: 0x20,
        
        /** @see Echo.RemoteClient.CommandExecProcessor#execute */
        execute: function(client, commandData) {
            if (!commandData.uri) {
                throw new Error("URI not specified in BrowserOpenWindowCommand.");
            }
            
            var features = [];
            if (commandData.width) {
                if (Echo.Sync.Extent.isPercent(commandData.width)) {
                    features.push("width=" + screen.width * parseInt(commandData.width, 10) / 100);
                } else {
                    features.push("width=" + Echo.Sync.Extent.toPixels(commandData.width, true));
                }
            }
            if (commandData.height) {
                if (Echo.Sync.Extent.isPercent(commandData.height)) {
                    features.push("height=" + screen.height * parseInt(commandData.height, 10) / 100);
                } else {
                    features.push("height=" + Echo.Sync.Extent.toPixels(commandData.height, false));
                }
            }
            var replace = commandData.flags & this.FLAG_REPLACE;
            features.push("menubar=" + (commandData.flags & this.FLAG_MENUBAR ? "yes" : "no"));
            features.push("toolbar=" + (commandData.flags & this.FLAG_TOOLBAR ? "yes" : "no"));
            features.push("location=" + (commandData.flags & this.FLAG_LOCATION ? "yes" : "no"));
            features.push("status=" + (commandData.flags & this.FLAG_STATUS ? "yes" : "no"));
            features.push("resizable=" + (commandData.flags & this.FLAG_RESIZABLE ? "yes" : "no"));
            features.push("scrollbars=yes");
            
            window.open(commandData.uri, commandData.name, features.join(","), replace);
        }
     },
     
     $load: function() {
        Echo.RemoteClient.CommandExecProcessor.registerPeer("nextapp.echo.webcontainer.command.BrowserOpenWindowCommand", this);
     }
});

