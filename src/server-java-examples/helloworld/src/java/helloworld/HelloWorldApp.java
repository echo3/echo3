package helloworld;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.ContentPane;
import nextapp.echo.app.Label;
import nextapp.echo.app.Window;

/**
 * Hello World Tutorial Application.
 */
public class HelloWorldApp extends ApplicationInstance {

    /**
     * @see nextapp.echo.app.ApplicationInstance#init()
     */
    public Window init() {
        Window window = new Window();

        ContentPane contentPane = new ContentPane();
        window.setContent(contentPane);

        Label label = new Label("Hello, world!");
        contentPane.add(label);
        
        return window;
    }
}    
