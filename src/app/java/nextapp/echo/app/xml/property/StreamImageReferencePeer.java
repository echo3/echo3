package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.StreamImageReference;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class StreamImageReferencePeer implements XmlPropertyPeer {

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext, org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Element propertyElement) {
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(nextapp.echo.webcontainer.OutputContext, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Element propertyElement, Object propertyValue) {
        StreamImageReference imageReference = (StreamImageReference) propertyValue;
        propertyElement.setAttribute("t", "ImageReference");
        propertyElement.setAttribute("v", "");
    }
}
