package nextapp.echo.app.serial;

import nextapp.echo.app.util.Context;

import org.w3c.dom.Element;

public interface SerialPropertyPeer {

    public Object toProperty(Context context, Class objectClass, Element propertyElement)
    throws SerialException;
    
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue);
}
