package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.xml.ConstantMap;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class ExtentPeer 
implements XmlPropertyPeer {

    private static final ConstantMap suffixConstantMap = new ConstantMap();
    static {
        suffixConstantMap.add(Extent.PX, "px");
        suffixConstantMap.add(Extent.CM, "cm");
        suffixConstantMap.add(Extent.EM, "em");
        suffixConstantMap.add(Extent.EX, "ex");
        suffixConstantMap.add(Extent.IN, "in");
        suffixConstantMap.add(Extent.MM, "mm");
        suffixConstantMap.add(Extent.PC, "pc");
        suffixConstantMap.add(Extent.PT, "pt");
        suffixConstantMap.add(Extent.PERCENT, "%");
    }
    
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
            throw new IllegalArgumentException(
                    "Cannot create extent from value: " + value);
        }
        int extentValue = Integer.parseInt(value.substring(0, separatorPoint));
        String unitString = value.substring(separatorPoint);
        
        int extentUnits = suffixConstantMap.get(unitString, -1);
        if (extentUnits == -1) {
            return null;
        }
        
        return new Extent(extentValue, extentUnits);
    }

    public static String toString(Extent extent) {
        return extent.getValue() + suffixConstantMap.get(extent.getUnits());
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.InputContext,
     *      Class, org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement) {
        return fromString(propertyElement.getAttribute("v"));
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext,
     *      Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Class objectClass, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "Extent");
        Extent extent = (Extent) propertyValue;
        propertyElement.setAttribute("v", toString(extent));
    }
}
