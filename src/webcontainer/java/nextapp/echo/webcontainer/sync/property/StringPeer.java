package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

public class StringPeer 
implements PropertySynchronizePeer {

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(org.w3c.dom.Element)
     */
    public Object toProperty(Element propertyElement) {
        return propertyElement.getAttribute("v");
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(OutputContext, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(OutputContext rc, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "s");
        propertyElement.setAttribute("v", (String) propertyValue);
    }
}
