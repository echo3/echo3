package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

public class ExtentPeer 
implements PropertySynchronizePeer {

    public static String toString(Extent extent) {
        StringBuffer out = new StringBuffer();
        out.append(extent.getValue());
        switch (extent.getUnits()) {
        case Extent.CM:
            out.append("cm");
            break;
        case Extent.EM:
            out.append("em");
            break;
        case Extent.EX:
            out.append("ex");
            break;
        case Extent.IN:
            out.append("in");
            break;
        case Extent.MM:
            out.append("mm");
            break;
        case Extent.PC:
            out.append("pc");
            break;
        case Extent.PERCENT:
            out.append("%");
            break;
        case Extent.PT:
            out.append("pt");
            break;
        case Extent.PX:
            out.append("px");
            break;
        }
        return out.toString();
    }
    
    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(org.w3c.dom.Element)
     */
    public Object toProperty(Element propertyElement) {
        //TODO. Implement.
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(OutputContext, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(OutputContext rc, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "Extent");
        Extent extent = (Extent) propertyValue;
        propertyElement.setAttribute("v", toString(extent));
    }
}
