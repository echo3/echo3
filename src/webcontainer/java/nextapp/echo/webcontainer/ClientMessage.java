package nextapp.echo.webcontainer;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import nextapp.echo.app.util.DomUtil;
import nextapp.echo.webcontainer.util.XmlRequestParser;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class ClientMessage {
    
    public static final String TYPE_INITIALIZE = "init";

    private Document document;
    private String type;
    private Map componentUpdateMap;
    
    private String eventType;
    private String eventComponentId;
    
    public ClientMessage(Connection conn) 
    throws IOException {
        super();
        
        document = XmlRequestParser.parse(conn.getRequest(), conn.getUserInstance().getCharacterEncoding());

        // Retrieve message type.
        type = document.getDocumentElement().getAttribute("t");
        
        // Retrieve event.
        Element eElement = DomUtil.getChildElementByTagName(document.getDocumentElement(), "e");
        if (eElement != null) {
            eventType = eElement.getAttribute("t");
            eventComponentId = eElement.getAttribute("i");
        }
        
        // Retrieve property updates.
        componentUpdateMap = new HashMap();
        Element[] pElements = DomUtil.getChildElementsByTagName(document.getDocumentElement(), "p");
        for (int i = 0; i < pElements.length; ++i) {
            String componentId = pElements[i].getAttribute("i");
            String propertyName = pElements[i].getAttribute("n");
        
            Map propertyMap = (Map) componentUpdateMap.get(componentId);
            if (propertyMap == null) {
                propertyMap = new HashMap();
                componentUpdateMap.put(componentId, propertyMap);
            }
            
            propertyMap.put(propertyName, pElements[i]);
        }
    }

    public Iterator getUpdatedComponentIds() {
        return componentUpdateMap.keySet().iterator();
    }
    
    public Iterator getUpdatedPropertyNames(String componentId) {
        Map propertyMap = (Map) componentUpdateMap.get(componentId);
        return propertyMap.keySet().iterator();
    }
    
    public Element getUpdatedProperty(String componentId, String propertyName) {
        Map propertyMap = (Map) componentUpdateMap.get(componentId);
        return (Element) propertyMap.get(propertyName);
    }
    
    public Document getDocument() {
        return document;
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
