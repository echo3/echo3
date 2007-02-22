package nextapp.echo.app.serial;

public interface PropertyPeerFactory {

    public SerialPropertyPeer getPeerForProperty(Class propertyClass);
}
