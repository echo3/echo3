package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.StreamImageReference;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.xml.property.ImageReferencePeer;
import nextapp.echo.webcontainer.UserInstance;
import nextapp.echo.webcontainer.service.StreamImageService;

public class WebStreamImageReferencePeer implements ImageReferencePeer {

    static {
        StreamImageService.install();
    }
    
    /**
     * @see nextapp.echo.app.xml.property.ImageReferencePeer#getImageUrl(nextapp.echo.app.util.Context,
     *      nextapp.echo.app.ImageReference)
     */
    public String getImageUrl(Context context, ImageReference imageReference) {
        UserInstance userInstance = (UserInstance) context.get(UserInstance.class);
        userInstance.getIdTable().register(imageReference);
        return "!S!" + imageReference.getRenderId();
    }
    
    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element)
     */
    public Object toProperty(Context context, Class objectClass, Element propertyElement) {
        // TODO Auto-generated method stub
        return null;
    }

    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toXml(nextapp.echo.app.util.Context,
     *      java.lang.Class, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(Context rc, Class objectClass, Element propertyElement, Object propertyValue) {
        StreamImageReference imageReference = (StreamImageReference) propertyValue;
        propertyElement.setAttribute("t", "ImageReference");
        propertyElement.setAttribute("v", getImageUrl(rc, imageReference));
    }
}
