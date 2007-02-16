package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.FillImage;
import nextapp.echo.app.ImageReference;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.app.xml.ConstantMap;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPeerFactory;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class FillImagePeer
implements XmlPropertyPeer {
    
    private static final ConstantMap REPEAT_CONSTANTS = new ConstantMap();
    static {
        REPEAT_CONSTANTS.add(FillImage.NO_REPEAT, "0");
        REPEAT_CONSTANTS.add(FillImage.REPEAT_HORIZONTAL, "x");
        REPEAT_CONSTANTS.add(FillImage.REPEAT_VERTICAL, "y");
        REPEAT_CONSTANTS.add(FillImage.REPEAT, "xu");
    }

    public static Element createFillImageElement(XmlContext context, FillImage fillImage) {
        Element fiElement = context.getDocument().createElement("fi");
        
        ImageReference imageReference = fillImage.getImage();
        XmlPeerFactory factory = XmlPeerFactory.forClassLoader(context.getClassLoader());
        XmlPropertyPeer propertyPeer = factory.getPeerForProperty(imageReference.getClass());
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
    
    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Element propertyElement) {
        Element fiElement = DomUtil.getChildElementByTagName(propertyElement, "fi");
        String imageType = fiElement.getAttribute("t");
        ImageReference imageReference = null;
        if ("r".equals(imageType)) {
            imageReference = ResourceImageReferencePeer.load(context, fiElement);
        }
        int repeat = REPEAT_CONSTANTS.get(fiElement.getAttribute("r"), FillImage.REPEAT);
        Extent x = propertyElement.hasAttribute("x") ? ExtentPeer.fromString(propertyElement.getAttribute("x") ) : null;
        Extent y = propertyElement.hasAttribute("y") ? ExtentPeer.fromString(propertyElement.getAttribute("y") ) : null;
        return new FillImage(imageReference, x, y, repeat);
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(OutputContext, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Element propertyElement, Object propertyValue) {
        FillImage fillImage = (FillImage) propertyValue;
        propertyElement.setAttribute("t", "FillImage");
        propertyElement.appendChild(createFillImageElement(context, fillImage));
    }
}
