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
    
    //BUGBUG. doc.
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
     * @return True if <code>superClass</code> is a superclass of 
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
