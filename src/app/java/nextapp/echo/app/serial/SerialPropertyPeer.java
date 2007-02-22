package nextapp.echo.app.serial;

import nextapp.echo.app.util.Context;

import org.w3c.dom.Element;

/**
 * Peer to serialize and deserialize property objects between Java and XML.
 */
public interface SerialPropertyPeer {

    /**
     * @param context
     * @param objectClass
     * @param propertyElement
     * @return
     * @throws SerialException when the property cannot be de-serialized.
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement)
    throws SerialException;
    
    /**
     * @param context
     * @param objectClass
     * @param propertyElement
     * @param propertyValue
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue)
    throws SerialException;
}
