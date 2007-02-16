package nextapp.echo.app.xml;

import org.w3c.dom.Document;

public interface XmlContext {
    
    public Document getDocument();

    public ClassLoader getClassLoader();
}
