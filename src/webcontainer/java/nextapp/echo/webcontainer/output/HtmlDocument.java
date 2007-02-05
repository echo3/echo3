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

package nextapp.echo.webcontainer.output;

import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

/**
 * A simple wrapper around JAXP/W3C DOM APIs to generate and render an 
 * XHTML 1.0 Transitional document.
 */
public class HtmlDocument extends XmlDocument {
    
    public static final String XHTML_1_0_TRANSITIONAL_PUBLIC_ID = "-//W3C//DTD XHTML 1.0 Transitional//EN";
    public static final String XHTML_1_0_TRANSITIONAL_SYSTSEM_ID = "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd";
    public static final String XHTML_1_0_NAMESPACE_URI = "http://www.w3.org/1999/xhtml";
    
    /**
     * Creates a new <code>HtmlDocument</code>.
     */
    public HtmlDocument(String publicId, String systemId, String namespaceUri) {
        super("html", publicId, systemId, namespaceUri);
        Document document = getDocument();
        Element htmlElement = document.getDocumentElement();
        Element headElement = document.createElement("head");
        Element titleElement = document.createElement("title");
        titleElement.appendChild(document.createTextNode(" "));
        Element bodyElement = document.createElement("body");
        bodyElement.setAttribute("id", "body");
        htmlElement.appendChild(headElement);
        headElement.appendChild(titleElement);
        htmlElement.appendChild(bodyElement);
    }
    
    /**
     * Adds inline JavaScript code to the document.
     * 
     * @param code the inline code
     */
    public void addJavaScriptText(String code) {
        Document document = getDocument();
        Element headElement = (Element) document.getElementsByTagName("head").item(0);
        Element scriptElement = document.createElement("script");
        Text textNode = document.createTextNode(code);
        scriptElement.appendChild(textNode);
        scriptElement.setAttribute("type", "text/javascript");
        headElement.appendChild(scriptElement);
    }
    
    /**
     * Adds a JavaScript include reference to the document.
     * 
     * @param uri the URI of the JavaScript code 
     */
    public void addJavaScriptInclude(String uri) {
        Document document = getDocument();
        Element headElement = (Element) document.getElementsByTagName("head").item(0);
        Element scriptElement = document.createElement("script");
        Text textNode = document.createTextNode(" ");
        scriptElement.appendChild(textNode);
        scriptElement.setAttribute("type", "text/javascript");
        scriptElement.setAttribute("src", uri);
        headElement.appendChild(scriptElement);
    }
    
    /**
     * Retrieves the BODY element of the document.
     * 
     * @return the BODY element
     */
    public Element getBodyElement() {
        return (Element) getDocument().getElementsByTagName("body").item(0);
    }
    
    /**
     * Retrieves the HEAD element of the document.
     * 
     * @return the HEAD element
     */
    public Element getHeadElement() {
        return (Element) getDocument().getElementsByTagName("head").item(0);
    }
    
    /**
     * Sets the value of the "generator" META element.
     * 
     * @param value the value
     */
    public void setGenarator(String value) {
        Element metaGeneratorElement = getDocument().createElement("meta");
        metaGeneratorElement.setAttribute("name", "generator");
        metaGeneratorElement.setAttribute("content", value);
        getHeadElement().appendChild(metaGeneratorElement);
    }
    
    /**
     * Convenience method to set the title of the document.
     * 
     * @param value The new title value.
     */
    public void setTitle(String value) {
        NodeList titles = getDocument().getElementsByTagName("title");
        if (titles.getLength() == 1) {
            DomUtil.setElementText((Element) titles.item(0), value == null ? "" : value);
        }
    }
}
