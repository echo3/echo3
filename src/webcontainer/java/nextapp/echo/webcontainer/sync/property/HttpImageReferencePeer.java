package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.HttpImageReference;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.serial.SerialContext;
import nextapp.echo.app.serial.SerialException;
import nextapp.echo.app.serial.property.ExtentPeer;
import nextapp.echo.app.serial.property.ImageReferencePeer;
import nextapp.echo.app.util.Context;

public class HttpImageReferencePeer 
implements ImageReferencePeer {

    /**
     * @see nextapp.echo.app.serial.property.ImageReferencePeer#getImageUrl(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.ImageReference)
     */
    public String getImageUrl(Context context, ImageReference imageReference) {
        HttpImageReference httpImageReference = (HttpImageReference) imageReference;
        return httpImageReference.getUri();
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toProperty(nextapp.echo.app.util.Context, 
     *      java.lang.Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) 
    throws SerialException {
        throw new UnsupportedOperationException();
    }

    /**
     * @see nextapp.echo.app.serial.SerialPropertyPeer#toXml(nextapp.echo.app.util.Context, 
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context context, Class objectClass, Element propertyElement, Object propertyValue) 
    throws SerialException {
        ImageReference imageReference = (ImageReference) propertyValue;
        propertyElement.setAttribute("t", "ImageReference");
        propertyElement.setAttribute("v", getImageUrl(context, imageReference));

        Extent width = imageReference.getWidth();
        Extent height = imageReference.getHeight();
        if (width != null || height != null) {
            SerialContext serialContext = (SerialContext) context.get(SerialContext.class);
            Element sizeElement = serialContext.getDocument().createElement("size");
            if (width != null ) {
                sizeElement.setAttribute("w", ExtentPeer.toString(width));
            }
            if (height != null) {
                sizeElement.setAttribute("h", ExtentPeer.toString(height));
            }
            propertyElement.appendChild(sizeElement);
        }
    }
}
