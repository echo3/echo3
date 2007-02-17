package nextapp.echo.app.xml;

import org.w3c.dom.Document;

public class DefaultXmlContext 
implements XmlContext {
        
    private ClassLoader classLoader;
    private Document document;
    
    public DefaultXmlContext(ClassLoader classLoader, Document document) {
        this.classLoader = classLoader;
        this.document = document;
    }
    
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
}
