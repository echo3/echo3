package nextapp.echo.app.xml;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import nextapp.echo.app.MutableStyle;
import nextapp.echo.app.Style;
import nextapp.echo.app.util.DomUtil;

public class Serializer {

    //FIXME.  Hardoding?  Maybe not too bad here, but these need to be spec'd in one place only.
    private static final Map javaLangTypeMap;
    static {
        Map m = new HashMap();
        m.put("b", Boolean.class);
        m.put("i", Integer.class);
        m.put("s", String.class);
        javaLangTypeMap = Collections.unmodifiableMap(m);
    }
    
    private XmlContext context;
    private XmlPeerFactory factory;
    private Map typeMap;
    
    public Serializer(final ClassLoader classLoader, final Document document) {
        super();
        
        factory = XmlPeerFactory.forClassLoader(classLoader);
        
        context = new XmlContext(){
        
            /**
             * @see nextapp.echo.app.xml.XmlContext#getClassLoader()
             */
            public ClassLoader getClassLoader() {
                return classLoader;
            }
        
            /**
             * @see nextapp.echo.app.xml.XmlContext#getDocument()
             */
            public Document getDocument() {
                return document;
            }
            
            /**
             * @see nextapp.echo.app.xml.XmlContext#getPropertyPeer(java.lang.Class)
             */
            public XmlPropertyPeer getPropertyPeer(Class propertyClass) {
                return XmlPeerFactory.forClassLoader(classLoader).getPeerForProperty(propertyClass);
            }
            
            public Serializer getSerializer() {
                return Serializer.this;
            }
        };
        
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
                clazz = Class.forName(echoType, true, context.getClassLoader());
                typeMap.put(type, clazz);
                return clazz;
            } catch (ClassNotFoundException ex) {
                // Do nothing.
            }
        }

        // Attempt to load specified type.
        clazz = Class.forName(type, true, context.getClassLoader());
        typeMap.put(type, clazz);
        return clazz;
    }
    
    public Style loadStyle(String componentType, Element containerElement) 
    throws XmlException {
        try {
            ComponentIntrospector ci = ComponentIntrospector.forName(componentType, context.getClassLoader());
            MutableStyle style = new MutableStyle();

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
                    propertyClass = ci.getPropertyClass(name);
                    peer = (XmlPropertyPeer) factory.getPeerForProperty(propertyClass);
                }
                
                if (propertyClass == null) {
                    throw new XmlException("Cannot find class for property: " + componentType + "." + name, null);
                }
                
                if (peer == null) {
                    // Unsupported property.
                    continue;
                }
                Object value = peer.toProperty(context, ci.getObjectClass(), pElements[i]);
                style.setProperty(name, value);
            }
            
            return style;
        } catch (ClassNotFoundException ex) {
            throw new XmlException("Error loading class.", ex);
        }
    }
}
