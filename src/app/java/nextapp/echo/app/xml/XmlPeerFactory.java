/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2007 NextApp, Inc.
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

package nextapp.echo.app.xml;

import java.util.HashMap;
import java.util.Map;

import nextapp.echo.app.util.PeerFactory;

/**
 * Factory for obtaining XML peer implementations.
 */
public class XmlPeerFactory 
implements PropertyPeerFactory {

    private static final String RESOURCE_NAME = "META-INF/nextapp/echo/XmlPeers.properties";

    private PeerFactory peerFactory;
    
    /**
     * Map of <code>ClassLoader</code>s to <code>PropertyLoader</code>s.
     */
    private static final Map classLoaderToPropertyLoaderMap = new HashMap();
    
    /**
     * Creates or retrieves a <code>XmlPeerFactory</code>.
     * 
     * @param classLoader the <code>ClassLoader</code> to use for 
     *        dynamically loading peer classes
     * @return the <code>XmlPeerFactory</code>
     */
    public static XmlPeerFactory forClassLoader(ClassLoader classLoader) {
        synchronized(classLoaderToPropertyLoaderMap) {
            XmlPeerFactory xmlPeerFactory = (XmlPeerFactory) classLoaderToPropertyLoaderMap.get(classLoader);
            if (xmlPeerFactory == null) {
                xmlPeerFactory = new XmlPeerFactory(classLoader);
                classLoaderToPropertyLoaderMap.put(classLoader, xmlPeerFactory);
            }
            return xmlPeerFactory;
        }
    }
    
    private XmlPeerFactory(ClassLoader classLoader) {
        peerFactory = new PeerFactory(RESOURCE_NAME, classLoader);
    }
    
    /**
     * Retrieves the appropriate <code>XmlPropertyPeer</code> for a given 
     * property class.
     * 
     * @param propertyClass the property class
     * @return the appropriate <code>XmlPropertyPeer</code>
     */
    public XmlPropertyPeer getPeerForProperty(Class propertyClass) {
        return (XmlPropertyPeer) peerFactory.getPeerForObject(propertyClass, true);
    }
}
