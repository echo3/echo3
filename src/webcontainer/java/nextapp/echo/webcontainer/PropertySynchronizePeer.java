package nextapp.echo.webcontainer;

import nextapp.echo.app.xml.XmlContext;

import org.w3c.dom.Element;

public interface PropertySynchronizePeer {

    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement);
    
    public void toXml(OutputContext context, Class objectClass, Element propertyElement, Object propertyValue);
}
