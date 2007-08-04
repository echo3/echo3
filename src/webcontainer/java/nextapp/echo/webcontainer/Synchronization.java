/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

package nextapp.echo.webcontainer;

import java.io.IOException;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Component;
import nextapp.echo.app.update.ServerComponentUpdate;

/**
 * A single client-server synchronziation.
 */
public class Synchronization {

    private Connection conn;
    private UserInstance userInstance;

    public Synchronization(Connection conn) {
        super();
        this.conn = conn;
        this.userInstance = conn.getUserInstance();
    }
    
    /**
     * Performs dispoal operations for removed components.
     */
    private void disposeComponents() {
        //FIXME.  This is not handling re-added components properly.
        ServerComponentUpdate[] updates = userInstance.getUpdateManager().getServerUpdateManager().getComponentUpdates();
        for (int i = 0; i < updates.length; ++i) {
            Component[] disposedComponents;
            
            // Dispose removed children.
            disposedComponents = updates[i].getRemovedChildren();
            for (int j = 0; j < disposedComponents.length; ++j) {
                userInstance.removeRenderState(disposedComponents[j]);
            }
            
            // Dispose descendants.
            disposedComponents = updates[i].getRemovedDescendants();
            for (int j = 0; j < disposedComponents.length; ++j) {
                userInstance.removeRenderState(disposedComponents[j]);
            }
        }
    }
    
    public void process() 
    throws IOException {
        synchronized(userInstance) {
            boolean initRequired = !userInstance.isInitialized();
            
            if (initRequired) {
                // Initialize user instance.
                userInstance.init(conn);
            }

            ApplicationInstance.setActive(userInstance.getApplicationInstance());
            try {
                if (!initRequired) {
                    // Process client input.
                    InputProcessor inputProcessor = new InputProcessor(conn);
                    inputProcessor.process();
                }
                
                // Render updates.
                OutputProcessor outputProcessor = new OutputProcessor(conn);
                outputProcessor.process();

                // Dispose of removed components.
                disposeComponents();
                
                // Purge updates.
                userInstance.getUpdateManager().purge();
            } finally {
                ApplicationInstance.setActive(null);
            }
        }
    }
}
