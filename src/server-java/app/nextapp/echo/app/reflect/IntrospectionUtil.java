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

package nextapp.echo.app.reflect;

import java.util.ArrayList;
import java.util.List;

/**
 * Provides stateless utilities used for object introspection.
 */
public class IntrospectionUtil {

    /**
     * Returns a parent type hierarchy as an array containing the provided 
     * type and all of its parent types (excluding 
     * <code>java.lang.Object</code>).  The highest-level types appear first, 
     * with the provided type at the first index.
     * 
     * @param type the top-level type
     * @param classLoader the <code>ClassLoader</code> through which 
     *        introspection may be performed
     * @return the type hierarchy
     */
    public static String[] getTypeHierarchy(String type, ClassLoader classLoader) 
    throws ClassNotFoundException {
        List hierarchy = new ArrayList();
        Class clazz = Class.forName(type, true, classLoader);
        while (clazz != Object.class) {
            hierarchy.add(clazz.getName());
            clazz = clazz.getSuperclass();
        }
        return (String[]) hierarchy.toArray(new String[hierarchy.size()]);
    }
    
    /**
     * Determines if the type specified by <code>testType</code> can be assigned to objects of the type
     * specified by <code>baseType</code>.
     * This simply uses Class.isAssignableFrom after loading classes using the specified <code>ClassLoader</code>.
     * 
     * @param baseType the base type
     * @param testType the test type
     * @param classLoader the <code>ClassLoader</code> to use to load the classes for testing
     */
    public static boolean isAssignableFrom(String testType, String baseType, ClassLoader classLoader) 
    throws ClassNotFoundException {
        Class baseClass = Class.forName(baseType, true, classLoader);
        Class testClass = Class.forName(testType, true, classLoader);
        return baseClass.isAssignableFrom(testClass);
    }

    /**
     * Determines if the provided <code>Class</code> is a 
     * <code>java.util.EventObject</code>.
     * 
     * @param type the <code>Class</code> to analyze
     * @return true if <code>type</code> type extends
     *         <code>java.util.EventObject</code>
     */
    public static boolean isEventObject(Class type) {
        if ("java.util.EventObject".equals(type.getName())) {
            return true;
        } else if ("java.lang.Object".equals(type.getName())) {
            return false;
        } else {
            return isEventObject(type.getSuperclass());
        }
    }
    
    /**
     * Determines if <code>superClass</code> is a superclass of 
     * <code>testClass</code>.
     * 
     * @param testType the name class to test
     * @param superType a class name which may/may not be a superclass of
     *        <code>testClass</code>
     * @param classLoader a <code>ClassLoader</code> to use for the analysis.
     * @return true if <code>superClass</code> is a superclass of 
     *         <code>testClass</code>
     */
    public static boolean isSuperType(String testType, String superType, ClassLoader classLoader) {
        try {
            Class clazz = classLoader.loadClass(testType);
            while (clazz != Object.class) {
                if (clazz.getName().equals(superType)) {
                    return true;
                }
                clazz = clazz.getSuperclass();
            }
            return false;
        } catch (ClassNotFoundException ex) {
            return false;
        }
    }
    
    /**
     * Removes the package name from a type name.
     * 
     * @param type a fully qualified type name
     * @return a relative version of the type name
     */
    public static String removePackageFromType(String type) {
        int lastDot = type.lastIndexOf(".");
        if (lastDot == -1) {
            // Unpackaged object (highly unlikely, or at least a very bad practice).
            return type;
        } else {
            return type.substring(lastDot + 1);
        }
    }
}
