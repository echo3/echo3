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

package nextapp.echo.app.componentxml.propertypeer;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Iterator;

import nextapp.echo.app.LayoutData;
import nextapp.echo.app.Style;
import nextapp.echo.app.componentxml.ComponentIntrospector;
import nextapp.echo.app.componentxml.ComponentXmlException;
import nextapp.echo.app.componentxml.InvalidPropertyException;
import nextapp.echo.app.componentxml.PropertyLoader;
import nextapp.echo.app.componentxml.PropertyXmlPeer;
import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Element;

/**
 * <code>PropertyXmlPeer</code> implementation for 
 * <code>nextapp.echo.app.LayoutData</code>-derived properties.
 * <p>
 * This peer will load properties for arbitrary <code>LayoutData</code> 
 * implementations using class introspection and reflection.  The
 * implementation does not currently support the setting of indexed
 * properties.   
 */
public class LayoutDataPeer 
implements PropertyXmlPeer {
    
    /**
     * @see nextapp.echo.app.componentxml.PropertyXmlPeer#getValue(java.lang.ClassLoader, 
     *      java.lang.Class, org.w3c.dom.Element)
     */
    public Object getValue(ClassLoader classLoader, Class objectClass, Element propertyElement)
    throws InvalidPropertyException {
        try {
            Element layoutDataElement = DomUtil.getChildElementByTagName(propertyElement, "layout-data");
            String type = layoutDataElement.getAttribute("type");

            // Load properties from XML into Style.
            PropertyLoader propertyLoader = PropertyLoader.forClassLoader(classLoader);
            Element propertiesElement = DomUtil.getChildElementByTagName(layoutDataElement, "properties");
            Style propertyStyle = propertyLoader.createStyle(propertiesElement, type);
            
            // Instantiate LayoutData instance.
            Class propertyClass = Class.forName(type, true, classLoader);
            LayoutData layoutData = (LayoutData) propertyClass.newInstance();
            
            // Create introspector to analyze LayoutData class.
            ComponentIntrospector ci = ComponentIntrospector.forName(type, classLoader);
            
            // Set property values of LayoutData instance.
            Iterator it = propertyStyle.getPropertyNames();
            while (it.hasNext()) {
                String propertyName = (String) it.next();
                Method writeMethod = ci.getWriteMethod(propertyName);
                writeMethod.invoke(layoutData, new Object[]{propertyStyle.getProperty(propertyName)});
            }
            
            return layoutData;
        } catch (ClassNotFoundException ex) {
            throw new InvalidPropertyException("Unable to process properties.", ex);
        } catch (ComponentXmlException ex) {
            throw new InvalidPropertyException("Unable to process properties.", ex);
        } catch (InstantiationException ex) {
            throw new InvalidPropertyException("Unable to process properties.", ex);
        } catch (IllegalAccessException ex) {
            throw new InvalidPropertyException("Unable to process properties.", ex);
        } catch (IllegalArgumentException ex) {
            throw new InvalidPropertyException("Unable to process properties.", ex);
        } catch (InvocationTargetException ex) {
            throw new InvalidPropertyException("Unable to process properties.", ex);
        }
    }
}
