package nextapp.echo.webcontainer.service;

import java.security.AccessControlException;
import nextapp.echo.webcontainer.Service;

/**
 * A service with a string version attribute.  This may be used in the case
 * that a service wishes to produce a uid representing its content to allow
 * long term caching, for example a MD5 hash.  It is not possible to represent
 * that using the {@link Service#getVersion()} method that returns an integer.
 * @author developer
 *
 */
public interface StringVersionService extends Service {
    
    public static class Manager {
      
        private static final String PROPERTY_ALLOW_IE_COMPRESSION = "echo.allowiecompression";
        private static final String PROPERTY_ENABLE_JS_CACHING = "echo.js.enablecaching";
        private static final String PROPERTY_JS_CACHE_SECONDS = "echo.js.cacheseconds";
	
        public static boolean allowIEcompression = false;
        static {
            try {
                if (Boolean.valueOf(System.getProperty(PROPERTY_ALLOW_IE_COMPRESSION, "false"))) {
                    allowIEcompression = true;
                }
            }
            catch(AccessControlException ignored) {}
        }

        public static boolean allowCaching = false;
        static {
            try {
                if (Boolean.valueOf(System.getProperty(PROPERTY_ENABLE_JS_CACHING, "false"))) {
                    allowCaching = true;
                }
            }
            catch(AccessControlException ignored) {}
        }

        public static long cacheSeconds = -1l;
        static {
            try {
                if (System.getProperty(PROPERTY_JS_CACHE_SECONDS) != null) {
                    cacheSeconds = Long.valueOf(System.getProperty(PROPERTY_JS_CACHE_SECONDS)).longValue();
                }
            }
            catch(AccessControlException ignored) {}
        }
    }
  
    /**
     * Returns the service version expressed as a string, or
     * <code>null</code> if the service has no version set.
     * @return the service version expressed as a string, or
     * <code>null</code> if the service has no version set.
     */
    public String getVersionAsString();
    
}