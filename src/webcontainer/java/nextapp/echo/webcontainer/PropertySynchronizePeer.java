package nextapp.echo.webcontainer;

import org.w3c.dom.Element;

public interface PropertySynchronizePeer {

    public Object toProperty(Element propertyElement);
    
    public void toXml(OutputContext rc, Element propertyElement, Object propertyValue);
}
