/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2009 NextApp, Inc.
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

/**
 * The high-level object which encapsulates the core of the client-server synchronization process for 
 * server-side applications.
 */
public class Synchronization 
implements SynchronizationState {

    private Connection conn;
    private UserInstance userInstance;
    private boolean outOfSync = false;

    /**
     * Creates a new <code>Synchronization</code>.
     * 
     * @param conn the synchronization <code>Connection</code> 
     */
    public Synchronization(Connection conn) {
        super();
        this.conn = conn;
        this.userInstance = conn.getUserInstance();
    }
    
    /**
     * @see nextapp.echo.webcontainer.SynchronizationState#isOutOfSync()
     */
    public boolean isOutOfSync() {
        return outOfSync;
    }
    
    /**
     * @see nextapp.echo.webcontainer.SynchronizationState#setOutOfSync()
     */
    public void setOutOfSync() {
        outOfSync = true;
    }

    /**
     * Processes input from the connection and renders output.
     * 
     * Performs the following operations:
     * <ul>
     *  <li>Initializes the <code>UserInstance</code> if it is new.</li>
     *  <li>Activates the <code>ApplicationInstance</code>.</li>
     *  <li>Processes input to the connection using an <code>InputProcessor</code>.</li>
     *  <li>Generates output for the connection using an <code>OutputProcessor</code>.</li>
     *  <li>Purges updates from the <code>UpdateManager</code> (which were processed by the <code>OutputProcessor</code>.</li>
     *  <li>Deactivates the <code>ApplicationInstance</code>.</li>
     * </ul>
     * 
     * @throws IOException
     */
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
                // Process client input.
                InputProcessor inputProcessor = new InputProcessor(this, conn);
                inputProcessor.process();
                
                // Manage render states.
                if (userInstance.getUpdateManager().getServerUpdateManager().isFullRefreshRequired()) {
                    userInstance.clearRenderStates();
                } else {
                    userInstance.purgeRenderStates();
                }
                
                // Render updates.
                OutputProcessor outputProcessor = new OutputProcessor(this, conn);
                outputProcessor.process();
                
                // Purge updates.
                userInstance.getUpdateManager().purge();
            } finally {
                ApplicationInstance.setActive(null);
            }
        }
    }
}
