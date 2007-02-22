package nextapp.echo.app.serial;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import nextapp.echo.app.DerivedMutableStyle;
import nextapp.echo.app.MutableStyleSheet;
import nextapp.echo.app.Style;
import nextapp.echo.app.StyleSheet;
import nextapp.echo.app.util.DomUtil;

/**
 * Loads style sheet data from XML format into a <code>StyleSheet</code> instance. 
 */
public class StyleSheetLoader {

    /**
     * Parses an XML style sheet and returns a <code>StyleSheet</code> 
     * instance.
     * <p>
     * Styles for components that cannot be loaded by the specified 
     * <code>ClassLoader</code> will be ignored.
     * 
     * @param resourceName the name of the resource on the 
     *        <code>CLASSPATH</code> containing the XML data
     * @param classLoader the <code>ClassLoader</code> with which to 
     *        instantiate property objects
     * @return the created <code>StyleSheet</code> or null if the resource 
     *         does not exist
     * @throws ComponentXmlException if parsing/instantiation errors occur
     */
    public static StyleSheet load(String resourceName, ClassLoader classLoader)
    throws SerialException {
        InputStream in = null;
        try {
            in = classLoader.getResourceAsStream(resourceName);
            if (in == null) {
                return null;
            }
            return load(in, classLoader);
        } finally {
            if (in != null) { try { in.close(); } catch (IOException ex) { } }
        }
    }

    /**
     * Parses an XML style sheet and returns a <code>StyleSheet</code> 
     * instance.
     * <p>
     * Styles for components that cannot be loaded by the specified 
     * <code>ClassLoader</code> will be ignored.
     * 
     * @param in the <code>InputStream</code> containing the XML data
     * @param classLoader the <code>ClassLoader</code> with which to 
     *        instantiate property objects
     * @return the created <code>StyleSheet</code>
     * @throws ComponentXmlException if parsing/instantiation errors occur
     */
    public static StyleSheet load(InputStream in, final ClassLoader classLoader)
    throws SerialException {
        final Document document;
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            document = builder.parse(in);
        } catch (IOException ex) {
            throw new SerialException("Failed to parse InputStream.", ex);
        } catch (ParserConfigurationException ex) {
            throw new SerialException("Failed to parse InputStream.", ex);
        } catch (SAXException ex) {
            throw new SerialException("Failed to parse InputStream.", ex);
        }      
        
        Map namedStyleMap = new HashMap();
        
        MutableStyleSheet styleSheet = new MutableStyleSheet();
        Element styleSheetElement = document.getDocumentElement();
        Element[] styleElements = DomUtil.getChildElementsByTagName(styleSheetElement, "s");
        
        Serializer serializer = Serializer.forClassLoader(classLoader);
        
        // First pass, load style information.
        for (int i = 0; i < styleElements.length; ++i) {
            String name = styleElements[i].getAttribute("n");
            if (!styleElements[i].hasAttribute("t")) {
                throw new SerialException("Component type not specified in style: " + name, null);
            }
            String type = styleElements[i].getAttribute("t");
            
            Class componentClass;
            try {
                componentClass = serializer.getClass(type);
            } catch (ClassNotFoundException ex) {
                // StyleSheet contains reference to Component which does not exist in this ClassLoader,
                // and thus should be ignored.
                continue;
            }
            
            DerivedMutableStyle style  = new DerivedMutableStyle();
            
            SerialContext context = new SerialContext() {
            
                public ClassLoader getClassLoader() {
                    return classLoader;
                }
            
                public Document getDocument() {
                    return document;
                }
            };
            
            Style propertyStyle = serializer.loadStyle(context, type, styleElements[i]);
            style.addStyleContent(propertyStyle);

            Map classToStyleMap = (Map) namedStyleMap.get(name);
            if (classToStyleMap == null) {
                classToStyleMap = new HashMap();
                namedStyleMap.put(name, classToStyleMap);
            }
            classToStyleMap.put(componentClass, style); 
            
            styleSheet.addStyle(componentClass, name, style);
        }
        
        // Second pass, bind derived styles to base styles where applicable.
        for (int i = 0; i < styleElements.length; ++i) {
            if (styleElements[i].hasAttribute("b")) {
                String name = styleElements[i].getAttribute("n");
                String type = styleElements[i].getAttribute("t");
                Class componentClass;
                try {
                    componentClass = Class.forName(type, true, classLoader);
                } catch (ClassNotFoundException ex) {
                    // StyleSheet contains reference to Component which does not exist in this ClassLoader,
                    // and thus should be ignored.
                    continue;
                }

                Map classToStyleMap = (Map) namedStyleMap.get(name);
                DerivedMutableStyle style = (DerivedMutableStyle) classToStyleMap.get(componentClass); 
                
                String baseName = styleElements[i].getAttribute("b");
                
                classToStyleMap = (Map) namedStyleMap.get(baseName);
                if (classToStyleMap == null) {
                    throw new SerialException("Invalid base style name for style name " + name + ".", null);
                }
                Style baseStyle = (Style) classToStyleMap.get(componentClass);
                while (baseStyle == null && componentClass != Object.class) {
                    componentClass = componentClass.getSuperclass();
                    baseStyle = (Style) classToStyleMap.get(componentClass);
                }
                if (baseStyle == null) {
                    throw new SerialException("Invalid base style name for style name " + name + ".", null);
                }
                
                style.setParentStyle(baseStyle);
            }
        }
    
        return styleSheet;
    }
}
