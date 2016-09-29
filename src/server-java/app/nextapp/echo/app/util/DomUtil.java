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

package nextapp.echo.app.util;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.DOMImplementation;
import org.w3c.dom.Document;
import org.w3c.dom.DocumentType;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;
import org.xml.sax.EntityResolver;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

/**
 * A utility class which provides methods for working with a W3C DOM.
 */
public class DomUtil {

    public static final Properties OUTPUT_PROPERTIES_INDENT;
    static {
        OUTPUT_PROPERTIES_INDENT = new Properties();
        OUTPUT_PROPERTIES_INDENT.setProperty(OutputKeys.INDENT, "yes");
        OUTPUT_PROPERTIES_INDENT.setProperty("{http://xml.apache.org/xalan}indent-amount", "4");    
    }
    
    /**
     * Entity resolver which throws a SAXException when invoked to avoid external entity injection.
     */
    private static final EntityResolver entityResolver = new EntityResolver() {
    
        /**
         * @see org.xml.sax.EntityResolver#resolveEntity(java.lang.String, java.lang.String)
         */
        public InputSource resolveEntity(String publicId, String systemId)
        throws SAXException, IOException {
            throw new SAXException("External entities not supported.");
        }
    };
    
    /**
     * The factory which will be used to produce identity transformers
     */
    private static final TransformerFactory transformerFactory = TransformerFactory.newInstance();
    
    /**
     * Creates a new document.
     * 
     * @param qualifiedName the qualified name of the document type to be 
     *        created
     * @param publicId the external subset public identifier
     * @param systemId the external subset system identifier
     * @param namespaceUri the namespace URI of the document element to create
     */
    public static Document createDocument(String qualifiedName, String publicId, String systemId, String namespaceUri) {
        DocumentBuilder builder = DomUtil.getDocumentBuilder();
        try {
			DOMImplementation dom = builder.getDOMImplementation();
	        DocumentType docType = dom.createDocumentType(qualifiedName, publicId, systemId);
	        Document document = dom.createDocument(namespaceUri, qualifiedName, docType);
	        if (namespaceUri != null) {
	            document.getDocumentElement().setAttribute("xmlns", namespaceUri);
	        }
	        return document;
        } finally {
        	releaseDocumentBuilder(builder);
        }
    }

    /**
     * Retrieves a <code>DocumentBuilder</code> from the pool
     * As it is a shared resource, the returned object should not be reconfigured in any fashion.
     * 
     * @return the <code>DocumentBuilder</code> serving the current thread.
     */
    public static DocumentBuilder getDocumentBuilder() {
        DocumentBuilder builder = DocumentBuilderPool.getBuilder();
        builder.setEntityResolver(entityResolver);
		return builder;
    }
    
    public static void releaseDocumentBuilder(DocumentBuilder builder) {
    	DocumentBuilderPool.release(builder);
    }
    
    /**
     * Determines whether a specific boolean flag is set on an element.
     * 
     * @param element The element to analyze.
     * @param attributeName The name of the boolean 'flag' attribute.
     * @return True if the value of the attribute is 'true', false if it is
     *         not or if the attribute does not exist.
     */
    public static boolean getBooleanAttribute(Element element, String attributeName) {
        String value = element.getAttribute(attributeName);
        if (value == null) {
            return false;
        } else if (value.equals("true")) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Retrieves the first immediate child element of the specified element  
     * whose name matches the provided <code>name</code> parameter.
     * 
     * @param parentElement The element to search.
     * @param name The name of the child element.
     * @return The child element, or null if none was found. 
     */
    public static Element getChildElementByTagName(Element parentElement, String name) {
        NodeList nodes = parentElement.getChildNodes();
        int length = nodes.getLength();
        for (int index = 0; index < length; ++index) {
            if (nodes.item(index).getNodeType() == Node.ELEMENT_NODE
                    && name.equals(nodes.item(index).getNodeName())) {
                return (Element) nodes.item(index);
            }
        }
        return null;
    }
    
    /**
     * Retrieves all immediate child elements of the specified element whose
     * names match the provided <code>name</code> parameter.
     * 
     * @param parentElement The element to search.
     * @param name The name of the child element.
     * @return An array of matching child elements.
     */
    public static Element[] getChildElementsByTagName(Element parentElement, String name) {
        List children = new ArrayList();
        NodeList nodes = parentElement.getChildNodes();
        int length = nodes.getLength();
        for (int index = 0; index < length; ++index) {
            if (nodes.item(index).getNodeType() == Node.ELEMENT_NODE
                    && name.equals(nodes.item(index).getNodeName())) {
                children.add(nodes.item(index));
            }
        }
        Element[] childElements = new Element[children.size()];
        return (Element[]) children.toArray(childElements);
    }

    /**
     * Counts the number of immediate child elements of the specified element
     * whose names match the provided <code>name</code> parameter.
     * 
     * @param parentElement The element to analyze.
     * @param name The name of the child element.
     * @return The number of matching child elements.
     */
    public static int getChildElementCountByTagName(Element parentElement, String name) {
        NodeList nodes = parentElement.getChildNodes();
        int length = nodes.getLength();
        int count = 0;
        for (int index = 0; index < length; ++index) {
            if (nodes.item(index).getNodeType() == Node.ELEMENT_NODE
                    && name.equals(nodes.item(index).getNodeName())) {
                ++count;
            }
        }
        return count;
    }
    
    /**
     * Returns the text content of a DOM <code>Element</code>.
     * 
     * @param element The <code>Element</code> to analyze.
     */
    public static String getElementText(Element element) {
        NodeList children = element.getChildNodes();
        int childCount = children.getLength();
        for (int index = 0; index < childCount; ++index) {
            if (children.item(index) instanceof Text) {
                Text text = (Text) children.item(index);
                return text.getData();
            }
        }
        return null;
    }
    
    /**
     * Writes the <code>Document</code> to the specified <code>OutputStream</code>.
     * 
     * @param document the <code>Document</code>
     * @param out the <code>OutputStream</code>
     * @param outputProperties output properties passed to XML transformer
     * @throws SAXException
     */
    public static void save(Document document, OutputStream out, Properties outputProperties) 
    throws SAXException {
        saveImpl(document, new StreamResult(out), outputProperties);
    }
    
    /**
     * Writes the <code>Document</code> to the specified <code>PrintWriter</code>.
     * 
     * @param document the <code>Document</code>
     * @param w the <code>PrintWriter</code>
     * @param outputProperties output properties passed to XML transformer
     * @throws SAXException
     */
    public static void save(Document document, PrintWriter w, Properties outputProperties) 
    throws SAXException {
        saveImpl(document, new StreamResult(w), outputProperties);
    }
    
    /**
     * Work method for public save() methods.
     */
    private static void saveImpl(Document document, StreamResult output, Properties outputProperties) 
    throws SAXException {
        try {
        	// We can build an identity transformer from a single factory because it's cheap and there are no thread-safety issues
            Transformer transformer = transformerFactory.newTransformer();
            if (outputProperties != null) {
                transformer.setOutputProperties(outputProperties);
            }
            DOMSource source = new DOMSource(document);
            
            transformer.transform(source, output);
        } catch (TransformerException ex) {
            throw new SAXException("Unable to write document to OutputStream.", ex);
        }
    }

    /**
     * Sets the text content of a DOM <code>Element</code>.
     * 
     * @param element The <code>Element</code> to modify.
     * @param value The new text value.
     */
    public static void setElementText(Element element, String value) {
        NodeList children = element.getChildNodes();
        int childCount = children.getLength();
        for (int index = 0; index < childCount; ++index) {
            if (children.item(index) instanceof Text) {
                Text text = (Text) children.item(index);
                text.setData(value);
                return;
            }
        }
        Text text = element.getOwnerDocument().createTextNode(value);
        element.appendChild(text);
    }
    
    /** Non-instantiable class. */
    private DomUtil() { }
}
