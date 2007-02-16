package nextapp.echo.app.xml.property;

import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;

import org.w3c.dom.Element;

public class IntegerPeer 
implements XmlPropertyPeer {

    public Object toProperty(XmlContext context, Element propertyElement) {
        String valueText = propertyElement.getAttribute("v"); 
        return valueText == null ? null : new Integer(valueText);
    }

    public void toXml(XmlContext context, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "i");
        propertyElement.setAttribute("v", propertyValue.toString());
    }
}
