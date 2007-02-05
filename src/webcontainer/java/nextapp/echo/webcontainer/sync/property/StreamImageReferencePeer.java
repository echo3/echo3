package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Element;

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.StreamImageReference;
import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.service.StreamImageService;

public class StreamImageReferencePeer extends AbstractImageReferencePeer {

    static {
        StreamImageService.install();
    }
    
    /**
     * @see nextapp.echo.webcontainer.sync.property.AbstractImageReferencePeer#getImageUrl(
     *      nextapp.echo.webcontainer.OutputContext, nextapp.echo.app.ImageReference)
     */
    public String getImageUrl(OutputContext rc, ImageReference imageReference) {
        rc.getUserInstance().getIdTable().register(imageReference);
        return "!S!" + imageReference.getRenderId();
    }
    
    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(org.w3c.dom.Element)
     */
    public Object toProperty(Element propertyElement) {
        // TODO Auto-generated method stub
        return null;
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(nextapp.echo.webcontainer.OutputContext, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(OutputContext rc, Element propertyElement, Object propertyValue) {
        StreamImageReference imageReference = (StreamImageReference) propertyValue;
        propertyElement.setAttribute("t", "ImageReference");
        propertyElement.setAttribute("v", getImageUrl(rc, imageReference));
    }
}
