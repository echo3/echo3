package nextapp.echo.app.reflect;

import java.beans.Introspector;
import java.util.HashMap;
import java.util.Map;

/**
 * Factory for creating <code>ClassLoader</code>-specific
 * <code>ObjectIntrospector</code> instances.
 */
public class IntrospectorFactory {

    /**
     * A map containing weak references from class loaders to 
     * <code>ObjectIntrospector</code> instances.
     */
    private static final Map classLoaderCache = new HashMap();
    
    private static boolean manualInitialization = false;
    
    private static ObjectIntrospector createIntrospector(String typeName, ClassLoader classLoader) 
    throws ClassNotFoundException {
        if (IntrospectionUtil.isSuperType(typeName, "nextapp.echo.app.Component", classLoader)) {
            return new ComponentIntrospector(typeName, classLoader);
        } else {
            return new ObjectIntrospector(typeName, classLoader);
        }
    }
    
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
    
    public static void dispose(ClassLoader classLoader) {
        synchronized (classLoaderCache) {
            Map oiStore = (Map) classLoaderCache.remove(classLoader);
            if (oiStore == null) {
                throw new IllegalStateException("ObjectIntrospectorFactory does not exist for specified ClassLoader.");
            }
            Introspector.flushCaches();
        }
    }
    
    public static ObjectIntrospector get(String typeName, ClassLoader classLoader) 
    throws ClassNotFoundException {
        // Find or Create Object Introspector Store based on ClassLoader Cache.
        Map oiStore;
        synchronized (classLoaderCache) {
            oiStore = (Map) classLoaderCache.get(classLoader);
            if (oiStore == null) {
                if (manualInitialization) {
                    throw new IllegalStateException("ObjectIntrospectorFactory does not exist for specified ClassLoader.");
                } else {
                    init(classLoader);
                    oiStore = (Map) classLoaderCache.get(classLoader);
                }
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

    //FIXME. Verify manual initialization flag still makes sense for purposes like EchoStudio.
    /**
     * Sets whether the init() method must be invoked with a specific <code>ClassLoader</code> before
     * introspecting types at the behest of that <code>ClassLoader</code>.  Initial value is false.
     * When true, <code>get()</code> will throw an exception if the <code>IntrospectorFactory</codE>
     * has not been initilaized.  Requiring manual initialization (and disposal) is important in
     * environments where multiple classloaders are being managed.
     * 
     * @param newValue the new manual initialization state
     */
    public static void setManualInitialization(boolean newValue) {
        manualInitialization = newValue;
    }
}
