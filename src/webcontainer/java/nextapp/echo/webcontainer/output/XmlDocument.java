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

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Properties;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.DOMImplementation;
import org.w3c.dom.Document;
import org.w3c.dom.DocumentType;

/**
 * A simple wrapper around JAXP/W3C DOM APIs to generate and render an XML 
 * document.
 */
public class XmlDocument {
    
    private Document document;
    private Properties outputProperties;
    
    /**
     * Creates a new <code>XmlDocument</code>.
     * 
     * @param qualifiedName the qualified name of the document type to be 
     *        created
     * @param publicId the external subset public identifier
     * @param systemId the external subset system identifier
     * @param namespaceUri the namespace URI of the document element to create
     */
    public XmlDocument(String qualifiedName, String publicId, String systemId, String namespaceUri) {
        super();
        DOMImplementation dom = DomUtil.getDocumentBuilder().getDOMImplementation();
        DocumentType docType = dom.createDocumentType(qualifiedName, publicId, systemId);
        document = dom.createDocument(namespaceUri, qualifiedName, docType);
        if (namespaceUri != null) {
            document.getDocumentElement().setAttribute("xmlns", namespaceUri);
        }
    }
    
    /**
     * Returns the W3C DOM implementation <code>Document</code> object.
     * 
     * @return the <code>Document</code> object
     */
    public Document getDocument() {
        return document;
    }
    
    /**
     * Renders the document to a <code>PrintWriter</code>.
     * 
     * @param pw the <code>PrintWriter</code>
     */
    public void render(PrintWriter pw)
    throws IOException {
        try {
            TransformerFactory tFactory = DomUtil.getTransformerFactory();
            Transformer transformer = tFactory.newTransformer();
            if (outputProperties != null) {
                transformer.setOutputProperties(outputProperties);
            }
            DOMSource source = new DOMSource(document);
            StreamResult result = new StreamResult(pw);
            transformer.transform(source, result);
        } catch (TransformerException ex) {
            throw new IOException("Unable to write document to OutputStream: " + ex.toString());
        }
    }

    /**
     * Sets the output properties which will be used by the rendering
     * <code>javax.xml.transform.Transformer</code>.
     * 
     * @param newValue the new output properties
     */
    public void setOutputProperties(Properties newValue) {
        outputProperties = newValue;
    }
}
