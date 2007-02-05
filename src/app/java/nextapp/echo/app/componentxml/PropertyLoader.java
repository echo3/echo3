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

import java.util.HashMap;
import java.util.Map;

import nextapp.echo.app.MutableStyle;
import nextapp.echo.app.Style;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.app.util.PeerFactory;

import org.w3c.dom.Element;

/**
 * Parses "properties" <code>Element</code>s into maps associating property 
 * names with instantiated property values. 
 */
public class PropertyLoader {
    
    private static final String PROPERTY_XML_PEERS_PATH = "META-INF/nextapp/echo/PropertyXmlPeers.properties";
    
    /**
     * Map of <code>ClassLoader</code>s to <code>PropertyLoader</code>s.
     */
    private static final Map classLoaderToPropertyLoaderMap = new HashMap();
    
    /**
     * Creates or retrieves a <code>PropertyLoader</code>.
     * 
     * @param classLoader the <code>ClassLoader</code> to use for 
     *        dynamically loading property classes
     * @return the <code>PropertyLoader</code>
     */
    public static PropertyLoader forClassLoader(ClassLoader classLoader) {
        synchronized(classLoaderToPropertyLoaderMap) {
            PropertyLoader propertyLoader = (PropertyLoader) classLoaderToPropertyLoaderMap.get(classLoader);
            if (propertyLoader == null) {
                propertyLoader = new PropertyLoader(classLoader);
                classLoaderToPropertyLoaderMap.put(classLoader, propertyLoader);
            }
            return propertyLoader;
        }
    }
    
    private ClassLoader classLoader;
    private PeerFactory propertyXmlPeerFactory;
    
    /**
     * Creates a new <code>PropertyLoader</code>.
     * 
     * @param classLoader the <code>ClassLoader</code> to use for 
     *        dynamically loading property classes
     */
    private PropertyLoader(ClassLoader classLoader) {
        super();
        this.classLoader = classLoader;
        propertyXmlPeerFactory = new PeerFactory(PROPERTY_XML_PEERS_PATH, classLoader);
    }
    
    /**
     * Parses a "properties" <code>Element</code> and returns a
     * <code>Style</code> mapping between property names and values.
     * 
     * @param propertiesElement the properties <code>Element</code> to be
     *        parsed
     * @param type the fully-qualified component type name
     * @return a style representing the retrieved property names and values
     * @throws ComponentXmlException
     */
    public Style createStyle(Element propertiesElement, String type)
    throws ComponentXmlException {
        MutableStyle propertyStyle = new MutableStyle();
        
        if (propertiesElement == null) {
            // No properties.
            return new MutableStyle();
        }
        
        ComponentIntrospector ci;
        try {
            ci = ComponentIntrospector.forName(type, classLoader);
        } catch (ClassNotFoundException ex) {
            throw new ComponentXmlException("Unable to introspect component: " + type, ex);
        }
        
        Element[] propertyElements = DomUtil.getChildElementsByTagName(propertiesElement, "property");
        for (int i = 0; i < propertyElements.length; ++i) {
            String propertyName = propertyElements[i].getAttribute("name");
            Class propertyClass;
            if (propertyElements[i].hasAttribute("type")) {
                try {
                    propertyClass = Class.forName(propertyElements[i].getAttribute("type"));
                } catch (ClassNotFoundException ex) {
                    throw new ComponentXmlException("Custom property class not found: " 
                            + propertyElements[i].getAttribute("type"), ex); 
                }
            } else {
                propertyClass = ci.getPropertyClass(propertyName);
            }
            
            if (propertyClass == null) {
                throw new ComponentXmlException("Property does not exist: " + propertyName, null);
            }
            
            Object propertyValue = getPropertyValue(ci.getObjectClass(), propertyClass, propertyElements[i]);
            
            if (ci.isIndexedProperty(propertyName)) {
                try {
                    int index = Integer.parseInt(propertyElements[i].getAttribute("index"));
                    propertyStyle.setIndexedProperty(propertyName, index, propertyValue);
                } catch (NumberFormatException ex) {
                    throw new ComponentXmlException("Index not set.", ex);
                }
            } else {
                propertyStyle.setProperty(propertyName, propertyValue);
            }
        }
        
        return propertyStyle;
    }
    
    /**
     * Retrieves a property value from an property element.
     *
     * @param objectClass the object containing the property 
     * @param propertyClass the class of the property
     * @param propertyElement the property element to analyze
     * @return the property value
     * @throws InvalidPropertyException
     */
    public Object getPropertyValue(Class objectClass, Class propertyClass, Element propertyElement) 
    throws InvalidPropertyException {
        PropertyXmlPeer propertyXmlPeer 
               = (PropertyXmlPeer) propertyXmlPeerFactory.getPeerForObject(propertyClass, false);
        if (propertyXmlPeer == null) {
            throw new InvalidPropertyException("Peer not found for property class: " + propertyClass, null);
        }
        Object propertyValue = propertyXmlPeer.getValue(classLoader, objectClass, propertyElement);
        return propertyValue;
    }

    /**
     * Returns the <code>PropertyXmlPeer</code> for the given property class.
     * 
     * @param propertyClass the property class
     * @return the XML parsing peer
     */
    public PropertyXmlPeer getPropertyXmlPeer(Class propertyClass) {
        return (PropertyXmlPeer) propertyXmlPeerFactory.getPeerForObject(propertyClass, false);
    }
}
