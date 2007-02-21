package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.layout.ColumnLayoutData;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.xml.XmlPropertyPeer;
import nextapp.echo.webcontainer.sync.SyncUtil;

public class ColumnLayoutDataPeer
implements XmlPropertyPeer {

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(Context, Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) {
        throw new UnsupportedOperationException();
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(
     *      Context, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) {
        ColumnLayoutData layoutData = (ColumnLayoutData) propertyValue;
        propertyElement.setAttribute("t", "LayoutData");
        SyncUtil.toXml(context, objectClass, propertyElement, "alignment", layoutData.getAlignment());
        SyncUtil.toXml(context, objectClass, propertyElement, "background", layoutData.getBackground());
        SyncUtil.toXml(context, objectClass, propertyElement, "backgroundImage", layoutData.getBackgroundImage());
        SyncUtil.toXml(context, objectClass, propertyElement, "insets", layoutData.getInsets());
    }
}
