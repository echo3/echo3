package nextapp.echo.webcontainer;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.xml.sax.SAXException;

import nextapp.echo.app.Component;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.webcontainer.util.XmlRequestParser;

public class ClientMessage {
    
    public static final String TYPE_INITIALIZE = "init";

    private Document document;
    
    private String eventType;
    private String eventComponentId;
    private String type;
    private Map componentUpdateMap;
    
    public ClientMessage(InputContext context) 
    throws IOException {
        super();
        
        Connection conn = context.getConnection();
        
        UserInstance ui = conn.getUserInstance();
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
        
        // Retrieve property updates.
        componentUpdateMap = new HashMap();
        Element[] pElements = DomUtil.getChildElementsByTagName(document.getDocumentElement(), "p");
        for (int i = 0; i < pElements.length; ++i) {
            String componentId = pElements[i].getAttribute("i");
            String propertyName = pElements[i].getAttribute("n");
            Component component = ui.getComponentByElementId(componentId);
            if (component == null) {
                continue;
            }
            
            Map propertyMap = (Map) componentUpdateMap.get(component);
            if (propertyMap == null) {
                propertyMap = new HashMap();
                componentUpdateMap.put(component, propertyMap);
            }
            
            ComponentSynchronizePeer componentPeer = 
                    (ComponentSynchronizePeer) SynchronizePeerFactory.getPeerForComponent(component.getClass());
            Class propertyClass = componentPeer.getPropertyClass(propertyName);
            if (propertyClass == null) {
                continue;
            }
            PropertySynchronizePeer propertyPeer = 
                    (PropertySynchronizePeer) SynchronizePeerFactory.getPeerForProperty(propertyClass);
            if (propertyPeer == null) {
                continue;
            }
            Object value = propertyPeer.toProperty(pElements[i]);
            propertyMap.put(propertyName, value);
        }
        
        //FIXME. Debug code
        System.err.println("INPUT PROPERTY MAP============");
        System.err.println(componentUpdateMap);
    }
    
    public Document getDocument() {
        return document;
    }
    
    public Iterator getUpdatedComponents() {
        return componentUpdateMap.keySet().iterator();
    }
    
    public Iterator getUpdatedPropertyNames(Component component) {
        Map propertyMap = (Map) componentUpdateMap.get(component);
        return propertyMap.keySet().iterator();
    }
    
    public Object getUpdatedPropertyValue(Component component, String propertyName) {
        Map propertyMap = (Map) componentUpdateMap.get(component);
        return propertyMap.get(propertyName);
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
