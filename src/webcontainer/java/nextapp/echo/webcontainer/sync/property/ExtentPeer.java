package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

public class ExtentPeer 
implements PropertySynchronizePeer {
    
    public static Extent fromString(String value) {
        int separatorPoint = -1;
        int length = value.length();
        for (int i = length - 1; i >= 0; --i) {
            if (Character.isDigit(value.charAt(i))) {
                separatorPoint = i + 1;
                break;
            }
        }
        if (separatorPoint == -1) {
            throw new IllegalArgumentException("Cannot create extent from value: " + value);
        }
        int extentValue = Integer.parseInt(value.substring(0, separatorPoint));
        String unitString = value.substring(separatorPoint);
        int extentUnits = -1;
        if ("px".equals(unitString)) {
            extentUnits = Extent.PX;
        } else if ("%".equals(unitString)) {
            extentUnits = Extent.PERCENT;
        } else if ("cm".equals(unitString)) {
            extentUnits = Extent.CM;
        } else if ("em".equals(unitString)) {
            extentUnits = Extent.EM;
        } else if ("ex".equals(unitString)) {
            extentUnits = Extent.EX;
        } else if ("in".equals(unitString)) {
            extentUnits = Extent.IN;
        } else if ("mm".equals(unitString)) {
            extentUnits = Extent.MM;
        } else if ("pc".equals(unitString)) {
            extentUnits = Extent.PC;
        } else if ("pt".equals(unitString)) {
            extentUnits = Extent.PT;
        }
        
        if (extentUnits == -1) {
            return null;
        } else {
            return new Extent(extentValue, extentUnits);
        }
    }
    
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
        return fromString(propertyElement.getAttribute("v"));
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(OutputContext, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(OutputContext rc, Class objectClass, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "Extent");
        Extent extent = (Extent) propertyValue;
        propertyElement.setAttribute("v", toString(extent));
    }
}
