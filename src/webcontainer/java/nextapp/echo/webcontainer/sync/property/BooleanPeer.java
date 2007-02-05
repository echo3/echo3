package nextapp.echo.webcontainer.sync.property;

import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

import org.w3c.dom.Element;

public class BooleanPeer 
implements PropertySynchronizePeer {

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(org.w3c.dom.Element)
     */
    public Object toProperty(Element propertyElement) {
        String valueText = propertyElement.getAttribute("v"); 
        return valueText == null ? null : new Boolean(valueText);
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(OutputContext, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(OutputContext rc, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "b");
        propertyElement.setAttribute("v", propertyValue.toString());
    }
}
