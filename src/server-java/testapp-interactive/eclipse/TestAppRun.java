/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2009 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

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
        
        final Context testContext = new Context(server, CONTEXT_PATH, Context.SESSIONS);
        testContext.addServlet(new ServletHolder(SERVLET_CLASS), PATH_SPEC);
        
        Context shutdownContext = new Context(server, "/__SHUTDOWN__");
        shutdownContext.addServlet(new ServletHolder(new HttpServlet() {

            private static final long serialVersionUID = 1L;

            protected void service(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
                try {
                    // Manually stopping session handler to test Application.dispose().
                    testContext.getSessionHandler().stop();
                    System.out.println("Shutdown request received: terminating.");
                    System.exit(0);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
            
        }), "/");

        System.out.println("Deploying " + SERVLET_CLASS.getName() + " on http://localhost:" + PORT + CONTEXT_PATH + PATH_SPEC); 
        
        server.start();
        server.join();
    }
}
