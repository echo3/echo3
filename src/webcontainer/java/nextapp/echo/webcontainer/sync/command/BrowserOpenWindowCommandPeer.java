package nextapp.echo.webcontainer.sync.command;

import nextapp.echo.app.Command;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.CommandSynchronizePeer;

//FIXME. temporarily abstract.
public abstract class BrowserOpenWindowCommandPeer 
implements CommandSynchronizePeer {

    /**
     * @see nextapp.echo.webcontainer.CommandSynchronizePeer#render(
     *      nextapp.echo.app.util.Context, nextapp.echo.app.Command)
     */
    public void render(Context context, Command command) {
        
    }
}
