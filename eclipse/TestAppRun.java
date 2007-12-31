import java.io.IOException;
import java.io.InputStream;
import java.net.ConnectException;
import java.net.URL;
import java.net.URLConnection;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import nextapp.echo.testapp.interactive.InteractiveServlet;

import org.mortbay.jetty.Server;
import org.mortbay.jetty.servlet.Context;
import org.mortbay.jetty.servlet.ServletHolder;

public class TestAppRun {
   
    private static final Class SERVLET_CLASS = InteractiveServlet.class;
    private static final String CONTEXT_PATH = "/TestApp";
    private static final String PATH_SPEC = "/app";
    private static final int PORT = 8001;

    public static void main(String[] arguments)
    throws Exception {
        try {
            URL url = new URL("http://localhost:" + PORT + "/__SHUTDOWN__/");
            URLConnection conn = url.openConnection();
            InputStream in = conn.getInputStream();
            in.close();
        } catch (ConnectException ex) {
            // Do nothing.
        }
        
        Server server = new Server(PORT);
        Context testContext = new Context(server, CONTEXT_PATH, Context.SESSIONS);
        testContext.addServlet(new ServletHolder(SERVLET_CLASS), PATH_SPEC);
        
        Context shutdownContext = new Context(server, "/__SHUTDOWN__");
        shutdownContext.addServlet(new ServletHolder(new HttpServlet() {

            private static final long serialVersionUID = 1L;

            protected void service(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
                System.out.println("Shutdown request received: terminating.");
                System.exit(0);
            }
            
        }), "/");

        System.out.println("Deploying " + SERVLET_CLASS.getName() + " on http://localhost:" + PORT + CONTEXT_PATH + PATH_SPEC); 
        
        server.start();
        server.join();
    }
}
