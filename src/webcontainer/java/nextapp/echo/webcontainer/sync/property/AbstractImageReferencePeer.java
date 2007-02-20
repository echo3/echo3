package nextapp.echo.webcontainer.sync.property;

import nextapp.echo.app.ImageReference;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.PropertySynchronizePeer;

public abstract class AbstractImageReferencePeer 
implements PropertySynchronizePeer {
    
    /**
     * @param rc
     * @param imageReference
     * @return
     */
    public abstract String getImageUrl(Context context, ImageReference imageReference);
}
