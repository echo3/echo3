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

package nextapp.echo.app.reflect;

import java.beans.Introspector;
import java.util.HashMap;
import java.util.Map;

/**
 * Factory for creating <code>ClassLoader</code>-specific <code>ObjectIntrospector</code> instances.
 */
public class IntrospectorFactory {

    /**
     * A map containing references from class loaders to <code>ObjectIntrospector</code> instances.
     */
    private static final Map classLoaderCache = new HashMap();
    
    /**
     * Creates a <b>new</b> <code>ObjectIntrospector</code> for a specific type
     * and <code>ClassLoader</code>.
     * 
     * @param typeName the type name
     * @param classLoader the <code>ClassLoader</code>
     * @return the <code>ObjectIntrospector</code>
     * @throws ClassNotFoundException if the type does not exist for the specified <code>ClassLoader</code>
     */
    private static ObjectIntrospector createIntrospector(String typeName, ClassLoader classLoader) 
    throws ClassNotFoundException {
        if (IntrospectionUtil.isSuperType(typeName, "nextapp.echo.app.Component", classLoader)) {
            return new ComponentIntrospector(typeName, classLoader);
        } else {
            return new ObjectIntrospector(typeName, classLoader);
        }
    }
    
    /**
     * Disposes an <code>IntrospectorFactory</code> for a specific <code>ClassLoader</code>.
     * 
     * @param classLoader the <code>ClassLoader</code>
     */
    public static void dispose(ClassLoader classLoader) {
        synchronized (classLoaderCache) {
            Map oiStore = (Map) classLoaderCache.remove(classLoader);
            if (oiStore == null) {
                throw new IllegalStateException("ObjectIntrospectorFactory does not exist for specified ClassLoader.");
            }
            Introspector.flushCaches();
        }
    }
    
    /**
     * Retrieves or creates an <code>ObjectIntrospector</code> instance for a specific type
     * from a specific <code>ClassLoader</code>
     * 
     * @param typeName the type to introspect
     * @param classLoader the <code>ClassLoader</code>
     * @return an <code>ObjectIntrospector</code> for the appropriate type 
     *         (a <code>ComponentIntrospector</code> in the event the type is an <code>Component</code>)
     * @throws ClassNotFoundException if the type is not provided by the <code>ClassLoader</code>
     */
    public static ObjectIntrospector get(String typeName, ClassLoader classLoader) 
    throws ClassNotFoundException {
        // Find or Create Object Introspector Store based on ClassLoader Cache.
        Map oiStore;
        synchronized (classLoaderCache) {
            oiStore = (Map) classLoaderCache.get(classLoader);
            if (oiStore == null) {
                init(classLoader);
                oiStore = (Map) classLoaderCache.get(classLoader);
            }
        }
        
        // Find or Create Object Introspector from Object Introspector Store.
        ObjectIntrospector oi;
        synchronized (oiStore) {
            oi =  (ObjectIntrospector) oiStore.get(typeName);
            if (oi == null) {
                oi = createIntrospector(typeName, classLoader);
                oiStore.put(typeName, oi);
            }
        }
        return oi;
    }
    
    /**
     * Initializes an <code>IntrospectorFactory</code> for a specific <code>ClassLoader</code>
     * This method must be invoked before any calls to <code>get()</code> if manual
     * initialization is enabled.
     * 
     * @param classLoader the <code>ClassLoader</code>
     */
    public static void init(ClassLoader classLoader) {
        synchronized (classLoaderCache) {
            Map oiStore = (Map) classLoaderCache.get(classLoader);
            if (oiStore != null) {
                throw new IllegalStateException("ObjectIntrospectorFactory already initialized for specified ClassLoader.");
            }
            
            oiStore = new HashMap();
            classLoaderCache.put(classLoader, oiStore);
        }
    }
}
