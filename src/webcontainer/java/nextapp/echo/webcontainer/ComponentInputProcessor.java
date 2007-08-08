package nextapp.echo.webcontainer;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import nextapp.echo.app.Component;
import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.update.UpdateManager;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

import org.w3c.dom.Element;

public class ComponentInputProcessor
implements ClientMessage.Processor {
    
    private Element eventElement;
    private String eventType;
    private String eventComponentId;
    
    private Map componentUpdateMap = new HashMap();
    
    private void parseDirElement(Element dirElement) {
        // Retrieve event.
        eventElement = DomUtil.getChildElementByTagName(dirElement, "e");
        if (eventElement != null) {
            eventType = eventElement.getAttribute("t");
            eventComponentId = eventElement.getAttribute("i");
        }
        
        // Retrieve property updates.
        Element[] pElements = DomUtil.getChildElementsByTagName(dirElement, "p");
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
    
    public void process(Context context, Element dirElement) 
    throws IOException {
        parseDirElement(dirElement);
        
        UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
        PropertyPeerFactory propertyPeerFactory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
        UpdateManager updateManager = userInstance.getApplicationInstance().getUpdateManager();

        Iterator updatedComponentIdIt  = getUpdatedComponentIds();
        while (updatedComponentIdIt.hasNext()) {
            String componentId = (String) updatedComponentIdIt.next();
            Component component = userInstance.getComponentByClientRenderId(componentId);
            ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(component.getClass());
            
            Iterator updatedPropertyIt = getUpdatedPropertyNames(componentId);
            while (updatedPropertyIt.hasNext()) {
                String propertyName = (String) updatedPropertyIt.next();
                Element propertyElement = getUpdatedProperty(componentId, propertyName);

                Class propertyClass = componentPeer.getInputPropertyClass(propertyName);
                if (propertyClass == null) {
                    //FIXME. add ex handling.
                    System.err.println("Could not determine class of property: " + propertyName);
                    continue;
                }
                
                SerialPropertyPeer propertyPeer = propertyPeerFactory.getPeerForProperty(propertyClass);
                
                if (propertyPeer == null) {
                    //FIXME. add ex handling.
                    System.err.println("No peer available for property: " + propertyName + " of class: " + propertyClass);
                    continue;
                }
                
                try {
                    Object propertyValue = propertyPeer.toProperty(context, component.getClass(), propertyElement);
                    componentPeer.storeInputProperty(context, component, propertyName, -1, propertyValue);
                } catch (SerialException ex) {
                    //FIXME. bad ex handling.
                    throw new IOException(ex.toString());
                }
            }
        }
        
        if (getEvent() != null) {
            Component component = userInstance.getComponentByClientRenderId(getEventComponentId());
            ComponentSynchronizePeer componentPeer = SynchronizePeerFactory.getPeerForComponent(component.getClass());
            Class eventDataClass = componentPeer.getEventDataClass(getEventType());
            if (eventDataClass == null) {
                componentPeer.processEvent(context, component, getEventType(), null);
            } else {
                SerialPropertyPeer propertyPeer = propertyPeerFactory.getPeerForProperty(eventDataClass);
                if (propertyPeer == null) {
                    //FIXME. add ex handling.
                    System.err.println("No peer available for event data for event type: " + getEventType() 
                            + " of class: " + eventDataClass);
                }
                try {
                    Object eventData = propertyPeer.toProperty(context, component.getClass(), getEvent());
                    componentPeer.processEvent(context, component, getEventType(), eventData);
                } catch (SerialException ex) {
                    //FIXME. bad ex handling.
                    throw new IOException(ex.toString());
                }
            }
        }

        updateManager.processClientUpdates();
        
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
    
    public Element getEvent() {
        return eventElement;
    }
    
    public String getEventType() {
        return eventType;
    }
    
    public String getEventComponentId() {
        return eventComponentId;
    }
        

}
