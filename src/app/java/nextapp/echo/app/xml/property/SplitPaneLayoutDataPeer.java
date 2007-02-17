package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlUtil;

public class SplitPaneLayoutDataPeer
extends LayoutDataPeer {

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext, 
     *      Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Class objectClass, Element propertyElement, Object propertyValue) {
        SplitPaneLayoutData layoutData = (SplitPaneLayoutData) propertyValue;
        propertyElement.setAttribute("t", "LayoutData");
        XmlUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "alignment", layoutData.getAlignment());
        XmlUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "background", layoutData.getBackground());
        XmlUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "backgroundImage", layoutData.getBackgroundImage());
        XmlUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "insets", layoutData.getInsets());
        XmlUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "maximumSize", layoutData.getMaximumSize());
        XmlUtil.toXml(context, SplitPaneLayoutData.class, propertyElement, "minimumSize", layoutData.getMinimumSize());
    }
}
