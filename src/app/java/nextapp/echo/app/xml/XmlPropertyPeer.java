package nextapp.echo.app.xml;

import nextapp.echo.app.util.Context;

import org.w3c.dom.Element;

public interface XmlPropertyPeer {

    public Object toProperty(Context context, Class objectClass, Element propertyElement)
    throws XmlException;
    
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue);
}
