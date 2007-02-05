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

package nextapp.echo.webcontainer;

import java.util.Properties;
import javax.xml.transform.OutputKeys;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import nextapp.echo.webcontainer.output.HtmlDocument;

/**
 * The initial document rendered when a user visits an application.
 */
public class BaseHtmlDocument extends HtmlDocument {

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
    
    private String contentId;
    
    /**
     * Creates a new <code>BaseHtmlDocument</code>.
     * 
     * @param contentId The desired id which will be used for the element to 
     *        which content should be added, i.e., the FORM element.
     */
    public BaseHtmlDocument(String contentId) {
        super(XHTML_1_0_TRANSITIONAL_PUBLIC_ID, XHTML_1_0_TRANSITIONAL_SYSTSEM_ID, XHTML_1_0_NAMESPACE_URI);
        setOutputProperties(OUTPUT_PROPERTIES);
        this.contentId = contentId;
        Document document = getDocument();
        
        Element styleElement = document.createElement("style");
        styleElement.setAttribute("type", "text/css");
        styleElement.appendChild(document.createTextNode(" "));
        getHeadElement().appendChild(styleElement);
        
        Element formElement = document.createElement("form");
        formElement.setAttribute("style", "padding:0px;margin:0px;");
        formElement.setAttribute("action", "#");
        formElement.setAttribute("id", contentId);
        formElement.setAttribute("onsubmit", "return false;");

        getBodyElement().appendChild(formElement);
    }
    
    /**
     * Retrieves the element of the document to which content should be added,
     * i.e., the FORM element.
     * 
     * @return the element to which content should be added.
     */
    public Element getContentElement() {
        return getDocument().getElementById(contentId);
    }
}
