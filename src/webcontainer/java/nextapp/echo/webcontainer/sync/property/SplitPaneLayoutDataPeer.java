package nextapp.echo.webcontainer.sync.property;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.webcontainer.OutputContext;
import nextapp.echo.webcontainer.PropertySynchronizePeer;
import nextapp.echo.webcontainer.SynchronizePeerFactory;

public class SplitPaneLayoutDataPeer
implements PropertySynchronizePeer {

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toProperty(org.w3c.dom.Element)
     */
    public Object toProperty(Element propertyElement) {
        throw new UnsupportedOperationException();
    }

    /**
     * @see nextapp.echo.webcontainer.PropertySynchronizePeer#toXml(
     *      nextapp.echo.webcontainer.OutputContext, org.w3c.dom.Element, java.lang.Object)
     */
    public void toXml(OutputContext rc, Element propertyElement, Object propertyValue) {
        SplitPaneLayoutData layoutData = (SplitPaneLayoutData) propertyValue;
        propertyElement.setAttribute("t", "LayoutData");
        
        Document document = rc.getServerMessage().getDocument();       
        Element childPropertyElement;
        
        if (layoutData.getBackground() != null) {
            childPropertyElement = document.createElement("p");
            childPropertyElement.setAttribute("n", "background");
            SynchronizePeerFactory.getPeerForProperty(layoutData.getBackground().getClass())
                    .toXml(rc, childPropertyElement,layoutData.getBackground());
            propertyElement.appendChild(childPropertyElement);
        }
        
        if (layoutData.getBackgroundImage() != null) {
            childPropertyElement = document.createElement("p");
            childPropertyElement.setAttribute("n", "backgroundImage");
            SynchronizePeerFactory.getPeerForProperty(layoutData.getBackgroundImage().getClass())
                    .toXml(rc, childPropertyElement,layoutData.getBackgroundImage());
            propertyElement.appendChild(childPropertyElement);
        }
        
        if (layoutData.getInsets() != null) {
            childPropertyElement = document.createElement("p");
            childPropertyElement.setAttribute("n", "insets");
            SynchronizePeerFactory.getPeerForProperty(layoutData.getInsets().getClass())
                    .toXml(rc, childPropertyElement,layoutData.getInsets());
            propertyElement.appendChild(childPropertyElement);
        }
        
        if (layoutData.getMaximumSize() != null) {
            childPropertyElement = document.createElement("p");
            childPropertyElement.setAttribute("n", "maximumSize");
            SynchronizePeerFactory.getPeerForProperty(layoutData.getMaximumSize().getClass())
                    .toXml(rc, childPropertyElement,layoutData.getMaximumSize());
            propertyElement.appendChild(childPropertyElement);
        }
        
        if (layoutData.getMinimumSize() != null) {
            childPropertyElement = document.createElement("p");
            childPropertyElement.setAttribute("n", "minimumSize");
            SynchronizePeerFactory.getPeerForProperty(layoutData.getMinimumSize().getClass())
                    .toXml(rc, childPropertyElement,layoutData.getMinimumSize());
            propertyElement.appendChild(childPropertyElement);
        }
    }
}
