package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Alignment;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.app.xml.ConstantMap;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;

/**
 * <code>XmlPropertyPeer</code> for <code>Alignment</code> properties.
 */
public class AlignmentPeer 
implements XmlPropertyPeer {
    
    private static final ConstantMap HORIZONTAL_CONSTANTS = new ConstantMap();
    static {
        HORIZONTAL_CONSTANTS.add(Alignment.LEADING, "leading");
        HORIZONTAL_CONSTANTS.add(Alignment.TRAILING, "trailing");
        HORIZONTAL_CONSTANTS.add(Alignment.LEFT, "left");
        HORIZONTAL_CONSTANTS.add(Alignment.CENTER, "center");
        HORIZONTAL_CONSTANTS.add(Alignment.RIGHT, "right");
    }
    
    private static final ConstantMap VERTICAL_CONSTANTS = new ConstantMap();
    static {
        VERTICAL_CONSTANTS.add(Alignment.TOP, "top");
        VERTICAL_CONSTANTS.add(Alignment.CENTER, "center");
        VERTICAL_CONSTANTS.add(Alignment.BOTTOM, "bottom");
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext, 
     *      org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Element propertyElement) {
        Element alignmentElement = DomUtil.getChildElementByTagName(propertyElement, "a");
        String horizontal = alignmentElement.getAttribute("h");
        String vertical = alignmentElement.getAttribute("v");
        return new Alignment(HORIZONTAL_CONSTANTS.get(horizontal, Alignment.DEFAULT),
                VERTICAL_CONSTANTS.get(vertical, Alignment.DEFAULT));
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext, org.w3c.dom.Element, 
     *      java.lang.Object)
     */
    public void toXml(XmlContext context, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "Alignment");
        Alignment alignment = (Alignment) propertyValue;
        Element element = context.getDocument().createElement("a");
        String horizontal = HORIZONTAL_CONSTANTS.get(alignment.getHorizontal());
        if (horizontal != null) {
            element.setAttribute("h", horizontal);
        }
        String vertical = VERTICAL_CONSTANTS.get(alignment.getVertical());
        if (vertical != null) {
            element.setAttribute("v", vertical);
        }
    }
}
