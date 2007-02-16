package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.layout.RowLayoutData;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;
import nextapp.echo.app.xml.XmlUtil;

public class RowLayoutDataPeer
implements XmlPropertyPeer {

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext, org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Element propertyElement) {
        throw new UnsupportedOperationException();
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Element propertyElement, Object propertyValue) {
        RowLayoutData layoutData = (RowLayoutData) propertyValue;
        propertyElement.setAttribute("t", "LayoutData");
        XmlUtil.toXml(context, propertyElement, "alignment", layoutData.getAlignment());
        XmlUtil.toXml(context, propertyElement, "background", layoutData.getBackground());
        XmlUtil.toXml(context, propertyElement, "backgroundImage", layoutData.getBackgroundImage());
        XmlUtil.toXml(context, propertyElement, "insets", layoutData.getInsets());
    }
}
