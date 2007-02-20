package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.FillImageBorder;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

public class FillImageBorderPeer
implements PropertySynchronizePeer {

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(Context, Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) {
        // TODO Auto-generated method stub
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(
     *      Context, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) {
        XmlContext xmlContext = (XmlContext) context.get(XmlContext.class);
        
        FillImageBorder border = (FillImageBorder) propertyValue;
        propertyElement.setAttribute("t", "FillImageBorder");
        
        Element fibElement = xmlContext.getDocument().createElement("fib");
        
        if (border.getBorderInsets() != null) {
            fibElement.setAttribute("bi", InsetsPeer.toString(border.getBorderInsets()));
        }
        if (border.getContentInsets() != null) {
            fibElement.setAttribute("ci", InsetsPeer.toString(border.getContentInsets()));
        }
        if (border.getColor() != null) {
            fibElement.setAttribute("bc", ColorPeer.toString(border.getColor()));
        }
        
        //FIXME. Handle nulls.
        for (int i = 0; i < 8; ++i) {
            fibElement.appendChild(FillImagePeer.createFillImageElement(context, border.getFillImage(i)));
        }
        
        propertyElement.appendChild(fibElement);
    }
}
