package nextapp.echo.webcontainer;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.w3c.dom.Element;

import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.util.DomUtil;

public class ClientPropertiesInputProcessor
implements ClientMessage.Processor {

    private static final Map TYPE_MAP;
    static {
        Map m = new HashMap();
        m.put(ClientProperties.SCREEN_WIDTH, Integer.class);
        m.put(ClientProperties.SCREEN_HEIGHT, Integer.class);
        m.put(ClientProperties.SCREEN_COLOR_DEPTH, Integer.class);
        m.put(ClientProperties.UTC_OFFSET, Integer.class);
        
        TYPE_MAP = Collections.unmodifiableMap(m);
    }
    
    public void process(Context context, Element dirElement) 
    throws IOException {
        ClientProperties clientProperties = new ClientProperties();
        try {
            PropertyPeerFactory propertyPeerFactory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
            Element[] pElements = DomUtil.getChildElementsByTagName(dirElement, "p");
            for (int i = 0; i < pElements.length; ++i) {
                String propertyName = pElements[i].getAttribute("n");
                Class propertyClass = (Class) TYPE_MAP.get(propertyName);
                if (propertyClass == null) {
                    throw new IOException("Illegal property in ClientProperties message: " + propertyName);
                }
                SerialPropertyPeer propertyPeer = propertyPeerFactory.getPeerForProperty(propertyClass);
                Object propertyValue = propertyPeer.toProperty(context, propertyClass, pElements[i]);
                clientProperties.setProperty(propertyName, propertyValue);
            }
        } catch (SerialException ex) {
            throw new IOException("Cannot serialize ClientProperties: " + ex);
        }
        
        UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
        userInstance.setClientProperties(clientProperties);
    }
}
