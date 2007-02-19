package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.FillImageBorder;
import nextapp.echo.webcontainer.InputContext;
import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

public class FillImageBorderPeer
implements PropertySynchronizePeer {

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(InputContext, Class, org.w3c.dom.Element)
     */
    public Object toProperty(InputContext context, Class objectClass, Element propertyElement) {
        // TODO Auto-generated method stub
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(
     *      nextapp.echo.webcontainer.OutputContext, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(OutputContext rc, Class objectClass, Element propertyElement, Object propertyValue) {
        FillImageBorder border = (FillImageBorder) propertyValue;
        propertyElement.setAttribute("t", "FillImageBorder");
        
        Element fibElement = rc.getServerMessage().getDocument().createElement("fib");
        
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
            fibElement.appendChild(FillImagePeer.createFillImageElement(rc, border.getFillImage(i)));
        }
        
        propertyElement.appendChild(fibElement);
    }
}
