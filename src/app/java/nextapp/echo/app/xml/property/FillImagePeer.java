package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.app.xml.ConstantMap;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlException;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class FillImagePeer
implements XmlPropertyPeer {
    
    private static final ConstantMap REPEAT_CONSTANTS = new ConstantMap();
    static {
        REPEAT_CONSTANTS.add(FillImage.NO_REPEAT, "0");
        REPEAT_CONSTANTS.add(FillImage.REPEAT_HORIZONTAL, "x");
        REPEAT_CONSTANTS.add(FillImage.REPEAT_VERTICAL, "y");
        REPEAT_CONSTANTS.add(FillImage.REPEAT, "xy");
    }

    public static Element createFillImageElement(XmlContext context, FillImage fillImage) {
        Element fiElement = context.getDocument().createElement("fi");
        ImageReference imageReference = fillImage.getImage();
        XmlPropertyPeer propertyPeer = context.getPropertyPeer(imageReference.getClass());
        if (propertyPeer == null) {
            throw new IllegalArgumentException("Image peer not found for container image");
        } else if (!(propertyPeer instanceof ImageReferencePeer)) {
            throw new IllegalArgumentException("Property peer not found for contained image is not an ImageReferencePeer");
        }
        
        ImageReferencePeer imagePeer = (ImageReferencePeer) propertyPeer ;
        fiElement.setAttribute("u", imagePeer.getImageUrl(context, imageReference));
        
        fiElement.setAttribute("r", REPEAT_CONSTANTS.get(fillImage.getRepeat()));
        return fiElement;
    }
    
    public static FillImage parseFillImageElement(XmlContext context, Element fiElement) 
    throws XmlException {
        String imageType = fiElement.getAttribute("t");
        ImageReference imageReference = null;
        if ("r".equals(imageType)) {
            XmlPropertyPeer imagePropertyPeer = context.getPropertyPeer(ResourceImageReference.class);
            imageReference = (ImageReference) imagePropertyPeer.toProperty(context, FillImage.class, fiElement);
        }
        int repeat = REPEAT_CONSTANTS.get(fiElement.getAttribute("r"), FillImage.REPEAT);
        Extent x = fiElement.hasAttribute("x") ? ExtentPeer.fromString(fiElement.getAttribute("x") ) : null;
        Extent y = fiElement.hasAttribute("y") ? ExtentPeer.fromString(fiElement.getAttribute("y") ) : null;
        return new FillImage(imageReference, x, y, repeat);
    }
    
    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Class objectClass, Element propertyElement) 
    throws XmlException {
        Element fiElement = DomUtil.getChildElementByTagName(propertyElement, "fi");
        return parseFillImageElement(context, fiElement);
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(OutputContext, Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Class objectClass, Element propertyElement, Object propertyValue) {
        FillImage fillImage = (FillImage) propertyValue;
        propertyElement.setAttribute("t", "FillImage");
        propertyElement.appendChild(createFillImageElement(context, fillImage));
    }
}
