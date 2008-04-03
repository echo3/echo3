package helloworld;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.webcontainer.WebContainerServlet;

/**
 * Hello World Tutorial Application Servlet Implementation.
 */
public class HelloWorldServlet extends WebContainerServlet {

    /**
     * @see nextapp.echo.webcontainer.WebContainerServlet#newApplicationInstance()
     */
    public ApplicationInstance newApplicationInstance() {
        return new HelloWorldApp();
    }
}
