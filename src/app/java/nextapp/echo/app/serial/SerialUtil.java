package nextapp.echo.app.serial;

import org.w3c.dom.Element;
import nextapp.echo.app.util.Context;

/**
 * Serialization utilities.
 */
public class SerialUtil {
    
    /**
     * Translates an arbitrary property to XML.
     * The appropriate peer for the property will be retrieved and the property will be 
     * handed to it for processing.  An XML representation of the property will be added
     * as a child to the specified <code>parentElement</code>.
     * 
     * @param context the relevant <code>Context</code> (must provide a <code>SerialContext</code>
     *        and a <code>PropertyPeerFactory</code>)
     * @param objectClass the class on which the property is set.
     * @param parentElement the XML element to which the property value's XML 
     *        representation will be added as a child
     * @param propertyName the name of the property
     * @param propertyValue the value of the property
     */
    public static void toXml(Context context, Class objectClass, Element parentElement, String propertyName, 
            Object propertyValue) 
    throws SerialException {
        if (propertyValue != null) {
            SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
            Element childPropertyElement = serialContext.getDocument().createElement("p");
            childPropertyElement.setAttribute("n", propertyName);
            
            PropertyPeerFactory peerFactory = (PropertyPeerFactory) context.get(PropertyPeerFactory.class);
            
            peerFactory.getPeerForProperty(propertyValue.getClass())
                    .toXml(context, objectClass, childPropertyElement, propertyValue);
            parentElement.appendChild(childPropertyElement);
        }
    }
}
