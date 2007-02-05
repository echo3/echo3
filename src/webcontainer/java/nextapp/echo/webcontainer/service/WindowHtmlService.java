/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2005 NextApp, Inc.
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

import org.w3c.dom.Element;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.webcontainer.BaseHtmlDocument;
import nextapp.echo.webcontainer.Connection;
import nextapp.echo.webcontainer.ContentType;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.WebContainerServlet;

/**
 * Completely re-renders a browser window.
 * This is the default service invoked when the user visits an application.
 */
public class WindowHtmlService 
implements Service {
    
    public static final WindowHtmlService INSTANCE = new WindowHtmlService();

    /**
     * Root element identifier.
     */
    public static final String ROOT_ID = "c_root";
    
    /**
     * @see Service#getId()
     */
    public String getId() {
        return WebContainerServlet.SERVICE_ID_DEFAULT;
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
        UserInstance instance = (UserInstance) conn.getUserInstance();
        conn.setContentType(ContentType.TEXT_HTML);
        
        boolean debug = !("false".equals(conn.getServlet().getInitParameter("echo.debug")));

        BaseHtmlDocument baseDoc = new BaseHtmlDocument(ROOT_ID);
        baseDoc.setGenarator(ApplicationInstance.ID_STRING);
        baseDoc.addJavaScriptInclude(instance.getServiceUri(BootService.SERVICE));

        // Add initialization directive.
        baseDoc.getBodyElement().setAttribute("onload", "EchoBoot.boot('" + instance.getServletUri() + "', " 
                + debug + ");");
        
        Element bodyElement = baseDoc.getBodyElement(); 
        
        // Set body element CSS style.
        bodyElement.setAttribute("style",
                "position: absolute; font-family: verdana, arial, helvetica, sans-serif; "
                + "font-size: 10pt; height: 100%; width: 100%; padding: 0px; margin: 0px; overflow: hidden;");
        
        // Render.
        baseDoc.render(conn.getWriter());
    }
}
