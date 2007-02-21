package nextapp.echo.webcontainer.sync.property;

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.util.Context;
import nextapp.echo.app.xml.XmlPropertyPeer;

public abstract class AbstractImageReferencePeer 
implements XmlPropertyPeer {
    
    /**
     * @param rc
     * @param imageReference
     * @return
     */
    public abstract String getImageUrl(Context context, ImageReference imageReference);
}
