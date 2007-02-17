package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Color;
import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.Insets;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlException;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class FillImageBorderPeer
implements XmlPropertyPeer {

    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement) throws XmlException {
        Element fibElement = DomUtil.getChildElementByTagName(propertyElement, "fib");
        
        Color borderColor = fibElement.hasAttribute("bc") ? ColorPeer.fromString(fibElement.getAttribute("bc")) : null;
        Insets borderInsets = fibElement.hasAttribute("bi") ? InsetsPeer.fromString(fibElement.getAttribute("bi")) : null;
        Insets contentInsets = fibElement.hasAttribute("ci") ? InsetsPeer.fromString(fibElement.getAttribute("ci")) : null;
        FillImageBorder border = new FillImageBorder(borderColor, borderInsets, contentInsets);
        
        Element[] fiElements = DomUtil.getChildElementsByTagName(fibElement, "fi");
        for (int i = 0; i < fiElements.length && i < 8; ++i) {
            border.setFillImage(i, FillImagePeer.parseFillImageElement(context, fiElements[i]));
        }

        return border;
    }

    public void toXml(XmlContext context, Class objectClass, Element propertyElement, Object propertyValue) {
        FillImageBorder border = (FillImageBorder) propertyValue;
        propertyElement.setAttribute("t", "FillImageBorder");
        
        Element fibElement = context.getDocument().createElement("fib");
        
        if (border.getBorderInsets() != null) {
            fibElement.setAttribute("bi", InsetsPeer.toString(border.getBorderInsets()));
        }
        if (border.getContentInsets() != null) {
            fibElement.setAttribute("ci", InsetsPeer.toString(border.getContentInsets()));
        }
        if (border.getColor() != null) {
            fibElement.setAttribute("bc", ColorPeer.toString(border.getColor()));
        }
        
        for (int i = 0; i < 8; ++i) {
            fibElement.appendChild(FillImagePeer.createFillImageElement(context, border.getFillImage(i)));
        }
        
        propertyElement.appendChild(fibElement);
    }
}