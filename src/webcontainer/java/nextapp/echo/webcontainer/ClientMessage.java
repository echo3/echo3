package nextapp.echo.webcontainer;

import java.io.IOException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import nextapp.echo.app.util.DomUtil;
import nextapp.echo.webcontainer.util.XmlRequestParser;

public class ClientMessage {
    
    public static final String TYPE_INITIALIZE = "init";

    private Document document;
    
    private String eventType;
    private String eventComponentId;
    private String type;
    
    public ClientMessage(Connection conn) 
    throws IOException {
        super();
        document = XmlRequestParser.parse(conn.getRequest(), conn.getUserInstance().getCharacterEncoding());
        
        //FIXME. Debug code
        try {
            DomUtil.save(document, System.err, DomUtil.OUTPUT_PROPERTIES_INDENT);
        } catch (SAXException ex) {
            throw new RuntimeException(ex);
        }

        // Retrieve message type.
        type = document.getDocumentElement().getAttribute("t");
        
        // Retrieve event.
        Element eElement = DomUtil.getChildElementByTagName(document.getDocumentElement(), "e");
        if (eElement != null) {
            eventType = eElement.getAttribute("t");
            eventComponentId = eElement.getAttribute("i");
        }
    }
    
    public String getType() {
        return type;
    }
    
    public String getEventType() {
        return eventType;
    }
    
    public String getEventComponentId() {
        return eventComponentId;
    }
}
