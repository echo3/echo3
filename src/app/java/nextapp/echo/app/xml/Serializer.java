package nextapp.echo.app.xml;

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
    
    private XmlPeerFactory factory;
    private Map typeMap;
    private ClassLoader classLoader;
    
    private Serializer(final ClassLoader classLoader) {
        super();
        
        this.classLoader = classLoader;
        factory = XmlPeerFactory.forClassLoader(classLoader);
        
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
    
    public Style loadStyle(final XmlContext xmlContext, String componentType, Element containerElement) 
    throws XmlException {
        try {
            ObjectIntrospector introspector = IntrospectorFactory.get(componentType, classLoader);
            MutableStyle style = new MutableStyle();

            Context context = new Context() {
                public Object get(Class specificContextClass) {
                    if (specificContextClass == XmlContext.class) {
                        return xmlContext;
                    } else if (specificContextClass == XmlPeerFactory.class) {
                        return factory;
                    }
                    return null;
                }
            };
            
            Element[] pElements = DomUtil.getChildElementsByTagName(containerElement, "p");
            for (int i = 0; i < pElements.length; ++i) {
                // Retrieve property name.
                if (!pElements[i].hasAttribute("n")) {
                    throw new XmlException("Found property without type in component \"" + componentType + "\".", null);
                }
                String name = pElements[i].getAttribute("n");

                XmlPropertyPeer peer = null;
                Class propertyClass = null;
                if (pElements[i].hasAttribute("t")) {
                    String type = pElements[i].getAttribute("t");
                    propertyClass = getClass(type);
                    peer = (XmlPropertyPeer) factory.getPeerForProperty(propertyClass);
                }
                
                if (peer == null) {
                    propertyClass = introspector.getPropertyClass(name);
                    peer = (XmlPropertyPeer) factory.getPeerForProperty(propertyClass);
                }
                
                if (propertyClass == null) {
                    throw new XmlException("Cannot find class for property: " + componentType + "." + name, null);
                }
                
                if (peer == null) {
                    // Unsupported property.
                    continue;
                }
                
                Object value = peer.toProperty(context, introspector.getObjectClass(), pElements[i]);
                style.setProperty(name, value);
            }
            
            return style;
        } catch (ClassNotFoundException ex) {
            throw new XmlException("Error loading class.", ex);
        }
    }
}
