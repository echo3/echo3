package nextapp.echo.app.serial;

import org.w3c.dom.Document;

class DefaultSerialContext 
implements SerialContext {
        
    private ClassLoader classLoader;
    private Document document;
    
    DefaultSerialContext(ClassLoader classLoader, Document document) {
        this.classLoader = classLoader;
        this.document = document;
    }
    
    /**
     * @see nextapp.echo.app.serial.SerialContext#getClassLoader()
     */
    public ClassLoader getClassLoader() {
        return classLoader;
    }

    /**
     * @see nextapp.echo.app.serial.SerialContext#getDocument()
     */
    public Document getDocument() {
        return document;
    }
    
    /**
     * @see nextapp.echo.app.serial.SerialContext#getPropertyPeer(java.lang.Class)
     */
    public SerialPropertyPeer getPropertyPeer(Class propertyClass) {
        return SerialPeerFactory.forClassLoader(classLoader).getPeerForProperty(propertyClass);
    }
}
