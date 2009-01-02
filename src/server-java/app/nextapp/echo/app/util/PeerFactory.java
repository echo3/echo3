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
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import nextapp.echo.app.util.PropertiesDiscovery;

/**
 * A mechanism for retrieving instances of singleton peer objects which are 
 * defined to each support a specific <code>Class</code>.
 * A properties file is used to associate peer classes with their supported
 * classes.  The properties file should contain the fully qualified class 
 * names of the supported objects as its keys.  The values of the properties
 * file should contain the fully qualified class names of the peer objects.
 * A single instance of each peer class will be used to support ALL instances
 * of the supported class.
 */
public class PeerFactory {
    
    private final Map objectClassNameToPeerMap = new HashMap();
    
    /**
     * Creates a new <code>PeerFactory</code>.
     * 
     * @param resourceName the name of the resource properties file from which
     *        the peer bindings may be retrieved (this file will be retrieved
     *        using the <code>PropertiesDiscovery</code> system, so multiple
     *        instances of the file within the <code>CLASSPATH</code> will be
     *        automatically discovered.
     * @param classLoader the <code>ClassLoader</code> to use for retrieving the
     *        resource file and for instantiating the peer singleton instances
     */
    public PeerFactory(String resourceName, ClassLoader classLoader) {
        try {
            Map peerNameMap = PropertiesDiscovery.loadProperties(resourceName, classLoader);
            Iterator it = peerNameMap.keySet().iterator();
            while (it.hasNext()) {
                String objectClassName = (String) it.next();
                String peerClassName = (String) peerNameMap.get(objectClassName);
                Class peerClass = classLoader.loadClass(peerClassName);
                Object peer = peerClass.newInstance();
                objectClassNameToPeerMap.put(objectClassName, peer);
            }
        } catch (ClassNotFoundException ex) {
            throw new RuntimeException("Unable to load synchronize peer bindings.", ex);
        } catch (IOException ex) {
            throw new RuntimeException("Unable to load synchronize peer bindings.", ex);
        } catch (InstantiationException ex) {
            throw new RuntimeException("Unable to load synchronize peer bindings.", ex);
        } catch (IllegalAccessException ex) {
            throw new RuntimeException("Unable to load synchronize peer bindings.", ex);
        }
    }
    
    /**
     * Retrieves the appropriate peer instance for a given object 
     * <code>Class</code>.  Returns null in the event that no peer is provided
     * to support the specified class.
     * 
     * @param objectClass the supported object class
     * @param searchSuperClasses flag indicating whether superclasses
     *        of <code>objectClass</code> should be searched for peers if
     *        none can be found for <code>objectClass</code> itself
     * @return the relevant peer, or null if none can be found
     */
    public Object getPeerForObject(Class objectClass, boolean searchSuperClasses) {
        Object peer = null;
        do {
            peer = objectClassNameToPeerMap.get(objectClass.getName());
            if (peer != null) {
                return peer;
            }
            if (searchSuperClasses) {
                Class[] interfaces = objectClass.getInterfaces();
                for (int i = 0; i < interfaces.length; i++) {
                    peer = getPeerForObject(interfaces[i], true);
                    if (peer != null) {
                        return peer;
                    }
                }
                objectClass = objectClass.getSuperclass();
            }
        } while (searchSuperClasses && objectClass != null);
        return null;
    }
}
