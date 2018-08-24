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
import java.util.Iterator;
import java.util.Properties;
import java.util.regex.Pattern;

import javax.xml.transform.OutputKeys;

import nextapp.echo.webcontainer.*;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Text;
import org.xml.sax.SAXException;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.util.DomUtil;

/**
 * Completely re-renders a browser window.
 * This is the default service invoked when the user visits an application.
 */
public class WindowHtmlService 
implements Service {
    
    /** The XHTML 1.0 Transitional Public ID. */
    public static final String XHTML_1_0_TRANSITIONAL_PUBLIC_ID = "-//W3C//DTD XHTML 1.0 Transitional//EN";

    /** The XHTML 1.0 Transitional System ID. */
    public static final String XHTML_1_0_TRANSITIONAL_SYSTEM_ID = "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd";
    
    /** The XHTML 1.0 Namespace URI. */
    public static final String XHTML_1_0_NAMESPACE_URI = "http://www.w3.org/1999/xhtml";
    
    /** DOM identifier to use for root element. */
    public static final String ROOT_ELEMENT_ID = "root";

    /**
     * <code>OutputProperties</code> used for XML transformation.
     */
    private static final Properties OUTPUT_PROPERTIES = new Properties();
    static {
        // The XML declaration is omitted as Internet Explorer 6 will operate in quirks mode if it is present.
        OUTPUT_PROPERTIES.setProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
        OUTPUT_PROPERTIES.putAll(DomUtil.OUTPUT_PROPERTIES_INDENT);
        OUTPUT_PROPERTIES.setProperty(OutputKeys.DOCTYPE_PUBLIC, XHTML_1_0_TRANSITIONAL_PUBLIC_ID);
        OUTPUT_PROPERTIES.setProperty(OutputKeys.DOCTYPE_SYSTEM, XHTML_1_0_TRANSITIONAL_SYSTEM_ID);
    }
    
    private static final Pattern USER_AGENT_MSIE8 = Pattern.compile("MSIE 8\\.");

    /** Singleton instance. */
    public static final WindowHtmlService INSTANCE = new WindowHtmlService();

    /**
     * Create a new root window HTML document.
     * 
     * @param conn the <code>Connection</code>
     * @param debug flag indicating whether debug capabilities should be enabled
     * @return the created document
     */
    private Document createHtmlDocument(Connection conn, boolean debug) {
        UserInstanceContainer userInstanceContainer = conn.getUserInstanceContainer();
        String userAgent = conn.getRequest().getHeader("User-Agent");
        Document document = DomUtil.createDocument("html", XHTML_1_0_TRANSITIONAL_PUBLIC_ID, 
                XHTML_1_0_TRANSITIONAL_SYSTEM_ID, XHTML_1_0_NAMESPACE_URI);
        
        Element htmlElement = document.getDocumentElement();

        Element headElement = document.createElement("head");
        htmlElement.appendChild(headElement);
        
        Element metaGeneratorElement = document.createElement("meta");
        metaGeneratorElement.setAttribute("name", "generator");
        metaGeneratorElement.setAttribute("content", ApplicationInstance.ID_STRING);
        headElement.appendChild(metaGeneratorElement);

        if (ServerConfiguration.IE_EDGE_MODE) {
            Element metaCompElement = document.createElement("meta");
            metaCompElement.setAttribute("http-equiv", "X-UA-Compatible");
            metaCompElement.setAttribute("content", "IE=edge");
            headElement.appendChild(metaCompElement);
        }
        else if (userAgent != null && USER_AGENT_MSIE8.matcher(userAgent).find()) {
            // Force Internet Explorer 8 standards-compliant mode.
            Element metaCompElement = document.createElement("meta");
            metaCompElement.setAttribute("http-equiv", "X-UA-Compatible");
            metaCompElement.setAttribute("content", "IE=8");
            headElement.appendChild(metaCompElement);
        }

        // Force UTF-8 document code for IE9. See http://echo.nextapp.com/site/node/6658
        Element contentTypeElement = document.createElement("meta");
        contentTypeElement.setAttribute("http-equiv", "Content-Type");
        contentTypeElement.setAttribute("content", "text/html; charset=utf-8");
        headElement.appendChild(contentTypeElement);

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
        scriptElement.setAttribute("src", userInstanceContainer.getServiceUri(BootService.SERVICE, null));
        headElement.appendChild(scriptElement);

        WebContainerServlet servlet = conn.getServlet();
        
        // Include application-provided initialization scripts.
        Iterator scriptIt = servlet.getInitScripts();
        if (scriptIt != null) {
            while (scriptIt.hasNext()) {
                Service scriptService = (Service) scriptIt.next();
                scriptElement = document.createElement("script");
                textNode = document.createTextNode(" ");
                scriptElement.appendChild(textNode);
                scriptElement.setAttribute("type", "text/javascript");
                scriptElement.setAttribute("src", userInstanceContainer.getServiceUri(scriptService, null));
                headElement.appendChild(scriptElement);
            }
        }
        
        // Include application-provided stylesheet(s).
        Iterator styleSheetIt = servlet.getInitStyleSheets();
        if (styleSheetIt != null) {
            while (styleSheetIt.hasNext()) {
                Service styleSheetService = (Service) styleSheetIt.next();
                Element linkElement = document.createElement("link");
                linkElement.setAttribute("rel", "StyleSheet");
                linkElement.setAttribute("type", "text/css");
                linkElement.setAttribute("href", userInstanceContainer.getServiceUri(styleSheetService, null));
                headElement.appendChild(linkElement);
            }
        }
        
        Element bodyElement = document.createElement("body");
        bodyElement.setAttribute("id", "body");
        bodyElement.setAttribute("onload", "Echo.Boot.boot('" + userInstanceContainer.getServletUri() + "', '" + 
                userInstanceContainer.createInitId(conn) + "', " + debug + ");");
        bodyElement.setAttribute("style",
                "height:100%;width:100%;margin:0px;padding:0px;" +
                "font-family:verdana, arial, helvetica, sans-serif;font-size:10pt");
        htmlElement.appendChild(bodyElement);

        Element rootDivElement = document.createElement("div");
        rootDivElement.setAttribute("style", "position:absolute;width:100%;height:100%;");
        rootDivElement.setAttribute("id", userInstanceContainer.getRootHtmlElementId());
        bodyElement.appendChild(rootDivElement);

        // Add a <noscript> element that shows up when JavaScript is disabled in the browser (and echo therefor
        // does not work at all)
        if (ServerConfiguration.NOSCRIPT_MESSAGE != null && !"".equals(ServerConfiguration.NOSCRIPT_MESSAGE)) {
            Element jsDisabledDiv = document.createElement("noscript");
            jsDisabledDiv.setTextContent(ServerConfiguration.NOSCRIPT_MESSAGE);
            jsDisabledDiv.setAttribute("style", "padding: 10px; font-weight: bold; font-size: 14pt;");
            bodyElement.appendChild(jsDisabledDiv);

            if (ServerConfiguration.NOSCRIPT_URL != null && !"".equals(ServerConfiguration.NOSCRIPT_URL)) {
                Element jsA = document.createElement("a");
                jsA.setAttribute("href", ServerConfiguration.NOSCRIPT_URL);
                jsA.setTextContent(ServerConfiguration.NOSCRIPT_URL);
                jsDisabledDiv.appendChild(jsA);
            }
        }

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
            Document document = createHtmlDocument(conn, ServerConfiguration.DEBUG);
            conn.setContentType(ContentType.TEXT_HTML);
            DomUtil.save(document, conn.getWriter(), OUTPUT_PROPERTIES);
        } catch (SAXException ex) {
            throw new SynchronizationException("Failed to write HTML document.", ex);
        }
    }
}
