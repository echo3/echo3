package nextapp.echo.webcontainer;

import nextapp.echo.app.util.Context;

import org.w3c.dom.Element;

public interface PropertySynchronizePeer {

    public Object toProperty(Context context, Class objectClass, Element propertyElement);
    
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue);
}
