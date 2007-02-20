package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.PropertySynchronizePeer;
import nextapp.echo.webcontainer.sync.SyncUtil;

public class SplitPaneLayoutDataPeer
implements PropertySynchronizePeer {

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
    public void toXml(Context out, Class objectClass, Element propertyElement, Object propertyValue) {
        SplitPaneLayoutData layoutData = (SplitPaneLayoutData) propertyValue;
        propertyElement.setAttribute("t", "LayoutData");
        SyncUtil.toXml(out, objectClass, propertyElement, "alignment", layoutData.getAlignment());
        SyncUtil.toXml(out, objectClass, propertyElement, "background", layoutData.getBackground());
        SyncUtil.toXml(out, objectClass, propertyElement, "backgroundImage", layoutData.getBackgroundImage());
        SyncUtil.toXml(out, objectClass, propertyElement, "insets", layoutData.getInsets());
        SyncUtil.toXml(out, objectClass, propertyElement, "maximumSize", layoutData.getMaximumSize());
        SyncUtil.toXml(out, objectClass, propertyElement, "minimumSize", layoutData.getMinimumSize());
    }
}
