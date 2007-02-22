package nextapp.echo.app.serial;

import org.w3c.dom.Document;

public interface SerialContext {
    
    public Document getDocument();

    public ClassLoader getClassLoader();
}
