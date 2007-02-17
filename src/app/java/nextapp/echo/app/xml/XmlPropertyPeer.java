package nextapp.echo.app.xml;

import org.w3c.dom.Element;

public interface XmlPropertyPeer {

    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement)
    throws XmlException;
    
    public void toXml(XmlContext context, Class objectClass, Element propertyElement, Object propertyValue);
}
