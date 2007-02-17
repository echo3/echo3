package nextapp.echo.app.xml.property;

import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;

import org.w3c.dom.Element;

public class StringPeer 
implements XmlPropertyPeer {

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext, 
     *      Class, org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement) {
        return propertyElement.getAttribute("v");
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext,
     *      Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Class objectClass,
            Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "s");
        propertyElement.setAttribute("v", (String) propertyValue);
    }
}
