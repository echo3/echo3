package nextapp.echo.app.xml.property;

import org.w3c.dom.Element;

import nextapp.echo.app.Extent;
import nextapp.echo.app.ResourceImageReference;
import nextapp.echo.app.util.DomUtil;
import nextapp.echo.app.xml.XmlContext;
import nextapp.echo.app.xml.XmlPropertyPeer;

public class ResourceImageReferencePeer 
implements XmlPropertyPeer {
    
    /**
     * @see nextapp.echo.app.xml.XmlPropertyPeer#toProperty(nextapp.echo.app.xml.XmlContext, org.w3c.dom.Element)
     */
    public Object toProperty(XmlContext context, Element propertyElement) {
        Element iElement = DomUtil.getChildElementByTagName(propertyElement, "i");
        String contentType = iElement.hasAttribute("t") ? iElement.getAttribute("t") : null;
        String resourceName = iElement.getAttribute("r");
        Extent width = iElement.hasAttribute("w") ? ExtentPeer.fromString(iElement.getAttribute("w")) : null;
        Extent height = iElement.hasAttribute("h") ? ExtentPeer.fromString(iElement.getAttribute("h")) : null;
        ResourceImageReference resourceImage = new ResourceImageReference(resourceName, contentType, width, height);
        return resourceImage;
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(nextapp.echo.webcontainer.OutputContext, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(XmlContext context, Element propertyElement, Object propertyValue) {
        ResourceImageReference resourceImage = (ResourceImageReference) propertyValue;
        Element iElement = context.getDocument().createElement("i");
        propertyElement.appendChild(iElement);
        iElement.setAttribute("t", resourceImage.getContentType());
        iElement.setAttribute("r", resourceImage.getResource());
        if (resourceImage.getWidth() != null) {
            iElement.setAttribute("w", ExtentPeer.toString(resourceImage.getWidth()));
        }
        if (resourceImage.getHeight() != null) {
            iElement.setAttribute("h", ExtentPeer.toString(resourceImage.getHeight()));
        }
    }
}
