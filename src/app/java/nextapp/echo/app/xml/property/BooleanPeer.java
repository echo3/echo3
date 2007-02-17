package nextapp.echo.app.xml.property;

import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;

import org.w3c.dom.Element;

public class BooleanPeer 
implements XmlPropertyPeer {

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext,
     *      Class, org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement) {
        String valueText = propertyElement.getAttribute("v");
        if (valueText == null) {
            return null;
        }
        return "1".equals(valueText) ? Boolean.TRUE : Boolean.FALSE;
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext,
     *      Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext rc, Class objectClass, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "b");
        propertyElement.setAttribute("v", propertyValue.toString());
    }
}
