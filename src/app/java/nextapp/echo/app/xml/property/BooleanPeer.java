package nextapp.echo.app.xml.property;

import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;

import org.w3c.dom.Element;

public class BooleanPeer 
implements XmlPropertyPeer {

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext,
     *      org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Element propertyElement) {
        String valueText = propertyElement.getAttribute("v");
        return valueText == null ? null : new Boolean(valueText);
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext,
     *      org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext rc, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "b");
        propertyElement.setAttribute("v", propertyValue.toString());
    }
}
