package nextapp.echo.webcontainer;

import org.w3c.dom.Element;

public interface PropertySynchronizePeer {

    public Object toProperty(Element propertyElement);
    
    public void toXml(OutputContext context, Class objectClass, Element propertyElement, Object propertyValue);
}
