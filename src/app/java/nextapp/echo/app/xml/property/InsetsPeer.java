package nextapp.echo.app.xml.property;

import java.util.StringTokenizer;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlException;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class InsetsPeer 
implements XmlPropertyPeer {
    
    public static Insets fromString(String value) 
    throws XmlException {
        Extent[] extents = new Extent[4];
        StringTokenizer st = new StringTokenizer(value, " ");
        int count = 0;
        for (int i = 0; i < extents.length && st.hasMoreTokens(); ++i) {
            extents[i] = ExtentPeer.fromString(st.nextToken());
            ++count;
        }
        switch (count) {
        case 1:
            return new Insets(extents[0]);
        case 2:
            return new Insets(extents[1], extents[0]);
        case 3:
            return new Insets(extents[1], extents[0], extents[1], extents[2]);
        case 4:
            return new Insets(extents[3], extents[0], extents[1], extents[2]);
        default:
            throw new XmlException("Invalid extent string: " + value, null);
        }
    }
    
    public static String toString(Insets insets) {
        if (insets.getTop().equals(insets.getBottom())) {
            if (insets.getLeft().equals(insets.getRight())) {
                if (insets.getTop().equals(insets.getLeft())) {
                    // All sides are equals.
                    return ExtentPeer.toString(insets.getTop());
                } else {
                    // Horizontal and vertical are equal.
                    return ExtentPeer.toString(insets.getTop()) + " " + ExtentPeer.toString(insets.getLeft());
                }
            }
        }
        return ExtentPeer.toString(insets.getTop()) 
                + " " + ExtentPeer.toString(insets.getRight())
                + " " + ExtentPeer.toString(insets.getBottom())
                + " " + ExtentPeer.toString(insets.getLeft());
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext,
     *      org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Element propertyElement) 
    throws XmlException {
        return fromString(propertyElement.getAttribute("v"));
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.xml.XmlContext,
     *      org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Element propertyElement,
            Object propertyValue) {
        propertyElement.setAttribute("t", "Insets");
        Insets insets = (Insets) propertyValue;
        propertyElement.setAttribute("v", toString(insets));
    }
}
