package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.layout.ColumnLayoutData;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;
import nextapp.echo.app.xml.XmlUtil;

public class ColumnLayoutDataPeer
implements XmlPropertyPeer {

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext, Class, org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement) {
        throw new UnsupportedOperationException();
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext out, Class objectClass, Element propertyElement, Object propertyValue) {
        ColumnLayoutData layoutData = (ColumnLayoutData) propertyValue;
        propertyElement.setAttribute("t", "LayoutData");
        XmlUtil.toXml(out, ColumnLayoutData.class, propertyElement, "alignment", layoutData.getAlignment());
        XmlUtil.toXml(out, ColumnLayoutData.class, propertyElement, "background", layoutData.getBackground());
        XmlUtil.toXml(out, ColumnLayoutData.class, propertyElement, "backgroundImage", layoutData.getBackgroundImage());
        XmlUtil.toXml(out, ColumnLayoutData.class, propertyElement, "insets", layoutData.getInsets());
    }
}
