package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

public class StringPeer 
implements PropertySynchronizePeer {

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(Context, Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) {
        return propertyElement.getAttribute("v");
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(Context, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context rc, Class objectClass, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "s");
        propertyElement.setAttribute("v", (String) propertyValue);
    }
}
