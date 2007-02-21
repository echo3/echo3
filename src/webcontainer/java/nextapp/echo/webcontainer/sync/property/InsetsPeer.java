package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Insets;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class InsetsPeer 
implements XmlPropertyPeer {
    
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
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(Context, Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) {
        //TODO. Implement.
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(Context, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context rc, Class objectClass, Element propertyElement, Object propertyValue) {
        propertyElement.setAttribute("t", "Insets");
        Insets insets = (Insets) propertyValue;
        propertyElement.setAttribute("v", toString(insets));
    }
}
