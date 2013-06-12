/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2012 NextApp, Inc.
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

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.util.Log;
import nextapp.echo.app.util.Uid;

/**
 * An abstract WebSocket connection handler. Implementations must provide a container 
 * specific implementation (currently only available for Jetty) till JSR 356
 * (http://jcp.org/en/jsr/detail?id=356) is commonly available
 * 
 * @author Miro Yozov
 */
public abstract class WebSocketConnectionHandler {

    private WebContainerServlet parent;

    void assignParent(WebContainerServlet parent) {
        this.parent = parent;
    }

    WebContainerServlet getParent() {
        return this.parent;
    }

    public ApplicationWebSocket process(HttpServlet servlet, HttpServletRequest request, String protocol) {
        WSConnection conn = null;
        try {
            conn = new WSConnection(servlet, request, protocol);
            if (!conn.isReady()) {
                final HttpSession session = request.getSession();
                if (session == null) {
                    throw new RuntimeException("WebSocketConnectionHandler: initialization of WSConnection is impossible without session!");
                }
                String key = AbstractConnection.getUserInstanceContainerSessionKey(this.parent);
                UserInstanceContainer userInstanceContainer = (UserInstanceContainer) session.getAttribute(key);
                conn.preInit(userInstanceContainer);
                conn.postInit(newApplicationWebSocket(conn.getUserInstance().getApplicationInstance()));
            }
        } catch (Exception ex) {
            String exceptionId = Uid.generateUidString();
            Log.log("Server Exception. ID: " + exceptionId, ex);
            throw new RuntimeException(ex);
        }
        return conn.getApplicationWebSocket();
    }

    public abstract ApplicationWebSocket newApplicationWebSocket(ApplicationInstance applicationInstance);
}