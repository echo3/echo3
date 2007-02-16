package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.layout.ColumnLayoutData;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;
import nextapp.echo.app.xml.XmlUtil;

public class ColumnLayoutDataPeer
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
    public void toXml(XmlContext out, Element propertyElement, Object propertyValue) {
        ColumnLayoutData layoutData = (ColumnLayoutData) propertyValue;
        propertyElement.setAttribute("t", "LayoutData");
        XmlUtil.toXml(out, propertyElement, "alignment", layoutData.getAlignment());
        XmlUtil.toXml(out, propertyElement, "background", layoutData.getBackground());
        XmlUtil.toXml(out, propertyElement, "backgroundImage", layoutData.getBackgroundImage());
        XmlUtil.toXml(out, propertyElement, "insets", layoutData.getInsets());
    }
}
