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

package nextapp.echo.webcontainer.service;


import java.io.IOException;

import nextapp.echo.webcontainer.Connection;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.Service;

/**
 * Abstract base service for handling server poll requests to determine if any
 * asynchronous operations affecting a <code>UserInstance</code> have been
 * performed since the last server interaction, such that the client might
 * resynchronize with the server.
 * <p>
 * An instance of this service must be registered with the 
 * <code>ServiceRegistry</code> if asynchronous polling is required.
 */
public class AsyncMonitorService 
implements Service {
    
    /**
     * Singleton instance.
     */
    public static final Service INSTANCE = new AsyncMonitorService();

    /**
     * Asynchronous monitoring service identifier.
     */
    public static final String SERVICE_ID = "Echo.AsyncMonitor";
    
    /**
     * The request-sync attribute in async-monitor tag.
     */
    public static final String REQUEST_SYNC_ATTR = "request-sync";
    
    /**
     * Private constructor: use singleton <code>INSTANCE</code>.
     */
    private AsyncMonitorService() { }
    
    /**
     * @see Service#getId()
     */
    public String getId() {
        return SERVICE_ID;
    }
    
    /**
     * @see Service#getVersion()
     */
    public int getVersion() {
        return DO_NOT_CACHE;
    }

    /**
     * @see Service#service(nextapp.echo.webcontainer.Connection)
     */
    public void service(Connection conn) throws IOException {
        conn.setContentType(ContentType.TEXT_XML);
        conn.getWriter().write("<async-monitor " + REQUEST_SYNC_ATTR + "=\"" + Boolean.toString(conn.getUserInstance().getApplicationInstance().hasQueuedTasks()) + "\"/>");
    }
}
