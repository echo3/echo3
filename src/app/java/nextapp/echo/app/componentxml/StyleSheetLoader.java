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

package nextapp.echo.app.componentxml;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import nextapp.echo.app.DerivedMutableStyle;
import nextapp.echo.app.MutableStyleSheet;
import nextapp.echo.app.Style;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

/**
 * Loads XML style sheets.
 */
public class StyleSheetLoader {
    
    /**
     * Parses an XML style sheet and returns a <code>StyleSheet</code> 
     * instance.
     * <p>
     * Styles for components that cannot be loaded by the specified 
     * <code>ClassLoader</code> will be ignored.
     * 
     * @param resourceName the name of the resource on the 
     *        <code>CLASSPATH</code> containing the XML data
     * @param classLoader the <code>ClassLoader</code> with which to 
     *        instantiate property objects
     * @return the created <code>StyleSheet</code> or null if the resource 
     *         does not exist
     * @throws ComponentXmlException if parsing/instantiation errors occur
     */
    public static StyleSheet load(String resourceName, ClassLoader classLoader)
    throws ComponentXmlException {
        InputStream in = null;
        try {
            in = classLoader.getResourceAsStream(resourceName);
            if (in == null) {
                return null;
            }
            return load(in, classLoader);
        } finally {
            if (in != null) { try { in.close(); } catch (IOException ex) { } }
        }
    }

    /**
     * Parses an XML style sheet and returns a <code>StyleSheet</code> 
     * instance.
     * <p>
     * Styles for components that cannot be loaded by the specified 
     * <code>ClassLoader</code> will be ignored.
     * 
     * @param in the <code>InputStream</code> containing the XML data
     * @param classLoader the <code>ClassLoader</code> with which to 
     *        instantiate property objects
     * @return the created <code>StyleSheet</code>
     * @throws ComponentXmlException if parsing/instantiation errors occur
     */
    public static StyleSheet load(InputStream in, ClassLoader classLoader)
    throws ComponentXmlException {
        Document document;
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            document = builder.parse(in);
        } catch (IOException ex) {
            throw new ComponentXmlException("Failed to parse InputStream.", ex);
        } catch (ParserConfigurationException ex) {
            throw new ComponentXmlException("Failed to parse InputStream.", ex);
        } catch (SAXException ex) {
            throw new ComponentXmlException("Failed to parse InputStream.", ex);
        }        
        
        PropertyLoader propertyLoader = PropertyLoader.forClassLoader(classLoader);

        Map namedStyleMap = new HashMap();
        
        MutableStyleSheet styleSheet = new MutableStyleSheet();
        Element styleSheetElement = document.getDocumentElement();
        Element[] styleElements = DomUtil.getChildElementsByTagName(styleSheetElement, "style");
        
        // First pass, load style information.
        for (int i = 0; i < styleElements.length; ++i) {
            String name = styleElements[i].getAttribute("name");
            if (!styleElements[i].hasAttribute("type")) {
                throw new ComponentXmlException("Component type not specified in style: " + name, null);
            }
            String type = styleElements[i].getAttribute("type");
            
            Class componentClass;
            try {
                componentClass = Class.forName(type, true, classLoader);
            } catch (ClassNotFoundException ex) {
                // StyleSheet contains reference to Component which does not exist in this ClassLoader,
                // and thus should be ignored.
                continue;
            }
            
            DerivedMutableStyle style  = new DerivedMutableStyle();
            
            Element propertiesElement = DomUtil.getChildElementByTagName(styleElements[i], "properties");
            Style propertyStyle = propertyLoader.createStyle(propertiesElement, type);
            style.addStyleContent(propertyStyle);

            Map classToStyleMap = (Map) namedStyleMap.get(name);
            if (classToStyleMap == null) {
                classToStyleMap = new HashMap();
                namedStyleMap.put(name, classToStyleMap);
            }
            classToStyleMap.put(componentClass, style); 
            
            styleSheet.addStyle(componentClass, name, style);
        }
        
        // Second pass, bind derived styles to base styles where applicable.
        for (int i = 0; i < styleElements.length; ++i) {
            if (styleElements[i].hasAttribute("base-name")) {
                String name = styleElements[i].getAttribute("name");
                String type = styleElements[i].getAttribute("type");
                Class componentClass;
                try {
                    componentClass = Class.forName(type, true, classLoader);
                } catch (ClassNotFoundException ex) {
                    // StyleSheet contains reference to Component which does not exist in this ClassLoader,
                    // and thus should be ignored.
                    continue;
                }

                Map classToStyleMap = (Map) namedStyleMap.get(name);
                DerivedMutableStyle style = (DerivedMutableStyle) classToStyleMap.get(componentClass); 
                
                String baseName = styleElements[i].getAttribute("base-name");
                
                classToStyleMap = (Map) namedStyleMap.get(baseName);
                if (classToStyleMap == null) {
                    throw new ComponentXmlException("Invalid base style name for style name " + name + ".", null);
                }
                Style baseStyle = (Style) classToStyleMap.get(componentClass);
                while (baseStyle == null && componentClass != Object.class) {
                    componentClass = componentClass.getSuperclass();
                    baseStyle = (Style) classToStyleMap.get(componentClass);
                }
                if (baseStyle == null) {
                    throw new ComponentXmlException("Invalid base style name for style name " + name + ".", null);
                }
                
                style.setParentStyle(baseStyle);
            }
        }
    
        return styleSheet;
    }
}
