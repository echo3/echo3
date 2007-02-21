package nextapp.echo.webcontainer.sync.property;

import nextapp.echo.app.util.Context;
import nextapp.echo.app.xml.XmlPropertyPeer;

import org.w3c.dom.Element;

public class IntegerPeer 
implements XmlPropertyPeer {

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(Context, Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) {
        String valueText = propertyElement.getAttribute("v"); 
        return valueText == null ? null : new Integer(valueText);
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(Context, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context rc, Class objectClass, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "i");
        propertyElement.setAttribute("v", propertyValue.toString());
    }
}
