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

package nextapp.echo.testapp.interactive;

import jetty.JettyWebSocket;
import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.webcontainer.ApplicationWebSocket;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.WebSocketConnectionHandler;
import nextapp.echo.webcontainer.service.JavaScriptService;
import nextapp.echo.webcontainer.service.StaticTextService;

/**
 * Interactive Test Application <code>WebContainerServlet</code> implementation.
 */
public class InteractiveServlet extends WebContainerServlet {

    /**
     * Enable/disable this flag to test custom wait indicator.
     */
    private static final boolean USE_CUSTOM_WAIT_INDICATOR = false;

    /**
     * Enable/disable this flag to test custom CSS.
     */
    private static final boolean USE_CUSTOM_CSS = false;

    private static final Service CUSTOM_WAIT_INDICATOR = JavaScriptService.forResource("CustomWaitIndicator", 
            "nextapp/echo/testapp/interactive/resource/js/CustomWaitIndicator.js");

    private static final Service CUSTOM_STYLE_SHEET = StaticTextService.forResource("CustomCSS", "text/css",
            "nextapp/echo/testapp/interactive/resource/css/Custom.css");
    
    
    static {
        System.setProperty("echo.js.enablecaching", "true");
        System.setProperty("echo.allowiecompression", "true");
    }

    public static final WebSocketConnectionHandler wsHandler = new WebSocketConnectionHandler() {
        @Override
        public ApplicationWebSocket newApplicationWebSocket(ApplicationInstance applicationInstance) {
            return new JettyWebSocket();
        }
    };

    public InteractiveServlet() {
        super();
        setWebSocketConnectionHandler(wsHandler);
        if (USE_CUSTOM_WAIT_INDICATOR) {
            addInitScript(CUSTOM_WAIT_INDICATOR);
        }
        if (USE_CUSTOM_CSS) {
            addInitStyleSheet(CUSTOM_STYLE_SHEET);
        }
    }
    
    /**
     * @see nextapp.echo.webcontainer.WebContainerServlet#getInstanceMode()
     */
    public int getInstanceMode() {
        return INSTANCE_MODE_SINGLE;
    }

    /**
     * @see nextapp.echo.webcontainer.WebContainerServlet#newApplicationInstance()
     */
    public ApplicationInstance newApplicationInstance() {
        return new InteractiveApp();
    }
}