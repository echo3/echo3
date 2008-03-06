/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2008 NextApp, Inc.
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
import java.util.Iterator;
import java.util.Properties;

import javax.xml.transform.OutputKeys;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Text;
import org.xml.sax.SAXException;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.util.DomUtil;
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
    
    public static final String XHTML_1_0_TRANSITIONAL_PUBLIC_ID = "-//W3C//DTD XHTML 1.0 Transitional//EN";
    public static final String XHTML_1_0_TRANSITIONAL_SYSTSEM_ID = "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd";
    public static final String XHTML_1_0_NAMESPACE_URI = "http://www.w3.org/1999/xhtml";
    
    public static final String ROOT_ELEMENT_ID = "root";

    /**
     * <code>OutputProperties</code> used for XML transformation.
     */
    private static final Properties OUTPUT_PROPERTIES = new Properties();
    static {
        // The XML declaration is omitted as Internet Explorer 6 will operate in quirks mode if it is present.
        OUTPUT_PROPERTIES.setProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
        OUTPUT_PROPERTIES.setProperty(OutputKeys.INDENT, "yes");
        
        OUTPUT_PROPERTIES.setProperty(OutputKeys.DOCTYPE_PUBLIC, XHTML_1_0_TRANSITIONAL_PUBLIC_ID);
        OUTPUT_PROPERTIES.setProperty(OutputKeys.DOCTYPE_SYSTEM, XHTML_1_0_TRANSITIONAL_SYSTSEM_ID);
    }
    
    public static final WindowHtmlService INSTANCE = new WindowHtmlService();

    /**
     * Create a new root window HTML document.
     * 
     * @param userInstance the user instance
     * @param debug flag indicating whether debug capabilities should be enabled
     * @return the created document
     */
    private Document createHtmlDocument(Connection conn, UserInstance userInstance, boolean debug) {
        Document document = DomUtil.createDocument("html", XHTML_1_0_TRANSITIONAL_PUBLIC_ID, 
                XHTML_1_0_TRANSITIONAL_SYSTSEM_ID, XHTML_1_0_NAMESPACE_URI);
        
        Element htmlElement = document.getDocumentElement();

        Element headElement = document.createElement("head");
        htmlElement.appendChild(headElement);
        
        Element metaGeneratorElement = document.createElement("meta");
        metaGeneratorElement.setAttribute("name", "generator");
        metaGeneratorElement.setAttribute("content", ApplicationInstance.ID_STRING);
        headElement.appendChild(metaGeneratorElement);

        Element titleElement = document.createElement("title");
        titleElement.appendChild(document.createTextNode(" "));
        headElement.appendChild(titleElement);
        
        Element styleElement = document.createElement("style");
        styleElement.setAttribute("type", "text/css");
        styleElement.appendChild(document.createTextNode(" "));
        headElement.appendChild(styleElement);

        Element scriptElement = document.createElement("script");
        Text textNode = document.createTextNode(" ");
        scriptElement.appendChild(textNode);
        scriptElement.setAttribute("type", "text/javascript");
        scriptElement.setAttribute("src", userInstance.getServiceUri(BootService.SERVICE));
        headElement.appendChild(scriptElement);
        
        WebContainerServlet servlet = conn.getServlet();
        Iterator scriptIt = servlet.getStartupScripts();
        if (scriptIt != null) {
            while (scriptIt.hasNext()) {
                Service scriptService = (Service) scriptIt.next();
                scriptElement = document.createElement("script");
                textNode = document.createTextNode(" ");
                scriptElement.appendChild(textNode);
                scriptElement.setAttribute("type", "text/javascript");
                scriptElement.setAttribute("src", userInstance.getServiceUri(scriptService));
                headElement.appendChild(scriptElement);
            }
        }
        
        Element bodyElement = document.createElement("body");
        bodyElement.setAttribute("id", "body");
        bodyElement.setAttribute("onload", "EchoBoot.boot('" + userInstance.getServletUri() + "', " + debug + ");");
        bodyElement.setAttribute("style",
                "height:100%;width:100%;margin:0px;padding: 0px;overflow:auto;" +
                "font-family:verdana, arial, helvetica, sans-serif;font-size:10pt");
        htmlElement.appendChild(bodyElement);

        Element rootDivElement = document.createElement("div");
        rootDivElement.setAttribute("style", "position:absolute;width:100%;height:100%;");
        rootDivElement.setAttribute("id", userInstance.getRootHtmlElementId());
        bodyElement.appendChild(rootDivElement);
        
        return document;
    }
    
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
        try {
            UserInstance userInstance = (UserInstance) conn.getUserInstance();
            boolean debug = !("false".equals(conn.getServlet().getInitParameter("echo.debug")));
            Document document = createHtmlDocument(conn, userInstance, debug);
            
            conn.setContentType(ContentType.TEXT_HTML);
            DomUtil.save(document, conn.getWriter(), OUTPUT_PROPERTIES);
        } catch (SAXException ex) {
            throw new IOException("Failed to write HTML document: " + ex);
        }
    }
}
