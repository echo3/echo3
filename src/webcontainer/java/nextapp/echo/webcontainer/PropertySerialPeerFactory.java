package nextapp.echo.webcontainer;

import nextapp.echo.app.serial.PropertyPeerFactory;
import nextapp.echo.app.serial.SerialPropertyPeer;
import nextapp.echo.app.util.PeerFactory;

//FIXME.  This is a temporary class to be used in refactoring the peer stuff between app and webcontaienr.
// this code will be exterminated.
//FIXME. replace with an XmlPropertyPeerFactory from app...that's the good one, with the 1-per-classloader stuff.

class PropertySerialPeerFactory 
implements PropertyPeerFactory {

    private static final String RESOURCE_NAME = "META-INF/nextapp/echo/SynchronizePeerBindings.properties";
    private static final PeerFactory peerFactory 
            = new PeerFactory(RESOURCE_NAME, Thread.currentThread().getContextClassLoader());

    public static final PropertySerialPeerFactory INSTANCE = new PropertySerialPeerFactory();
    
    /**
     * Retrieves the appropriate <code>PropertySynchronizePeer</code> for a given 
     * property class.
     * 
     * @param propertyClass the property class
     * @return the appropriate <code>PropertySynchronizePeer</code>
     */
    public SerialPropertyPeer getPeerForProperty(Class propertyClass) {
        return (SerialPropertyPeer) peerFactory.getPeerForObject(propertyClass, true);
    }
}
