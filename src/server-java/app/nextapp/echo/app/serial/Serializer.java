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

package nextapp.echo.app.serial;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.w3c.dom.Element;

import nextapp.echo.app.MutableStyle;
import nextapp.echo.app.Style;
import nextapp.echo.app.reflect.IntrospectorFactory;
import nextapp.echo.app.reflect.ObjectIntrospector;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

public class Serializer {
    
    /**
     * Map of <code>ClassLoader</code>s to <code>PropertyLoader</code>s.
     */
    private static final Map classLoaderToPropertyLoaderMap = new HashMap();
    
    /**
     * Creates or retrieves a <code>Serializer</code>.
     * 
     * @param classLoader the <code>ClassLoader</code> to use for 
     *        dynamically loading peer classes
     * @return the <code>Serializer</code>
     */
    public static Serializer forClassLoader(ClassLoader classLoader) {
        synchronized(classLoaderToPropertyLoaderMap) {
            Serializer serializer = (Serializer) classLoaderToPropertyLoaderMap.get(classLoader);
            if (serializer == null) {
                serializer = new Serializer(classLoader);
                classLoaderToPropertyLoaderMap.put(classLoader, serializer);
            }
            return serializer;
        }
    }
    
    //FIXME.  Hardoding?  Maybe not too bad here, but these need to be spec'd in one place only.
    private static final Map javaLangTypeMap;
    static {
        Map m = new HashMap();
        m.put("b", Boolean.class);
        m.put("i", Integer.class);
        m.put("s", String.class);
        javaLangTypeMap = Collections.unmodifiableMap(m);
    }
    
    private SerialPeerFactory factory;
    private Map typeMap;
    private ClassLoader classLoader;
    
    private Serializer(final ClassLoader classLoader) {
        super();
        
        this.classLoader = classLoader;
        factory = SerialPeerFactory.forClassLoader(classLoader);
        
        typeMap = new HashMap();
    }

    public Class getClass(String type) 
    throws ClassNotFoundException {
        // Attempt to retrieve class from core types.
        Class clazz = (Class) javaLangTypeMap.get(type);
        if (clazz != null) {    
            return clazz;
        }
        
        // Attempt to retrieve class from cached types.
        clazz = (Class) typeMap.get(type);
        if (clazz != null) {    
            return clazz;
        }
        
        // If type is shorthand (no package name) prepend "nextapp.echo.app." to type and attempt to load. 
        if (type.indexOf(".") == -1) {
            String echoType = "nextapp.echo.app." + type; 
            try {
                clazz = Class.forName(echoType, true, classLoader);
                typeMap.put(type, clazz);
                return clazz;
            } catch (ClassNotFoundException ex) {
                // Do nothing.
            }
        }

        // Attempt to load specified type.
        clazz = Class.forName(type, true, classLoader);
        typeMap.put(type, clazz);
        return clazz;
    }
    
    public Style loadStyle(final SerialContext serialContext, String componentType, Element containerElement) 
    throws SerialException {
        try {
            ObjectIntrospector introspector = IntrospectorFactory.get(componentType, classLoader);
            MutableStyle style = new MutableStyle();

            Context context = new Context() {
                public Object get(Class specificContextClass) {
                    if (specificContextClass == SerialContext.class) {
                        return serialContext;
                    } else if (specificContextClass == PropertyPeerFactory.class) {
                        return factory;
                    }
                    return null;
                }
            };
            
            Element[] pElements = DomUtil.getChildElementsByTagName(containerElement, "p");
            for (int i = 0; i < pElements.length; ++i) {
                // Retrieve property name.
                if (!pElements[i].hasAttribute("n")) {
                    throw new SerialException("Found property without type in component \"" + componentType + "\".", null);
                }
                String name = pElements[i].getAttribute("n");

                SerialPropertyPeer peer = null;
                Class propertyClass = null;
                if (pElements[i].hasAttribute("t")) {
                    String type = pElements[i].getAttribute("t");
                    propertyClass = getClass(type);
                    peer = (SerialPropertyPeer) factory.getPeerForProperty(propertyClass);
                }
                
                int index = -1;
                if (pElements[i].hasAttribute("x")) {
                    index = Integer.parseInt(pElements[i].getAttribute("x"));
                }
                
                if (peer == null) {
                    propertyClass = introspector.getPropertyClass(name);
                    peer = (SerialPropertyPeer) factory.getPeerForProperty(propertyClass);
                }
                
                if (propertyClass == null) {
                    throw new SerialException("Cannot find class for property: " + componentType + "." + name, null);
                }
                
                if (peer == null) {
                    // Unsupported property.
                    continue;
                }
                
                Object value = peer.toProperty(context, introspector.getObjectClass(), pElements[i]);

                if (index == -1) {
                    style.setProperty(name, value);
                } else {
                    style.setIndexedProperty(name, index, value);
                }
            }
            
            return style;
        } catch (ClassNotFoundException ex) {
            throw new SerialException("Error loading class.", ex);
        }
    }
}
