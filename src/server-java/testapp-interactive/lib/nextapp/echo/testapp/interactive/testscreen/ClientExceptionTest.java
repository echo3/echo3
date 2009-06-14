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

package nextapp.echo.testapp.interactive.testscreen;

import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.Insets;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.util.Context;
import nextapp.echo.webcontainer.AbstractComponentSynchronizePeer;
import nextapp.echo.webcontainer.ServerMessage;
import nextapp.echo.webcontainer.Service;
import nextapp.echo.webcontainer.WebContainerServlet;
import nextapp.echo.webcontainer.service.JavaScriptService;

/**
 * A test for the command infrastructures and browser control commands.
 */
public class ClientExceptionTest extends Column {

    private static final Service EX_TEST_FAIL_SERVICE = JavaScriptService.forResource("Test.Ex", 
            "nextapp/echo/testapp/interactive/resource/js/ExceptionComponent.js");
    
    private static final Service EX_TEST_EPIC_FAIL_SERVICE = JavaScriptService.forResource("Test.Ex2", 
            "nextapp/echo/testapp/interactive/resource/js/ExceptionScript.js");
    
    static {
        WebContainerServlet.getServiceRegistry().add(EX_TEST_FAIL_SERVICE);
        WebContainerServlet.getServiceRegistry().add(EX_TEST_EPIC_FAIL_SERVICE);
    }
    
    public class RenderFail extends Component { }
    
    public static class RenderFailPeer extends AbstractComponentSynchronizePeer {
    
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
         */
        public String getClientComponentType(boolean mode) {
            return "ExTest.RenderFail";
        }

        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
         */
        public Class getComponentClass() {
            return RenderFail.class;
        }
        
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
         */
        public void init(Context context, Component component) {
            super.init(context, component);
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(EX_TEST_FAIL_SERVICE.getId());
        }
    }
    
    public class RenderEpicFail extends Component { }
    
    public static class RenderEpicFailPeer extends AbstractComponentSynchronizePeer {
    
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#getClientComponentType(boolean)
         */
        public String getClientComponentType(boolean mode) {
            return "ExTest.RenderEpicFail";
        }

        /**
         * @see nextapp.echo.webcontainer.AbstractComponentSynchronizePeer#getComponentClass()
         */
        public Class getComponentClass() {
            return RenderEpicFail.class;
        }
        
        /**
         * @see nextapp.echo.webcontainer.ComponentSynchronizePeer#init(nextapp.echo.app.util.Context, Component)
         */
        public void init(Context context, Component component) {
            super.init(context, component);
            ServerMessage serverMessage = (ServerMessage) context.get(ServerMessage.class);
            serverMessage.addLibrary(EX_TEST_EPIC_FAIL_SERVICE.getId());
        }
    }
    
    public ClientExceptionTest() {
        super();
        
        SplitPaneLayoutData splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(10));
        setLayoutData(splitPaneLayoutData);
        
        Button button;
        
        button = new Button("Add RenderFail Component (will throw client exception, application will enter unusable state.)");
        button.setStyleName("Default");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                add(new RenderFail());
            }
        });
        add(button);
        
        button = new Button("Add RenderEpicFail Component (service contains malformed script, will fail attempting to load, " +
                "application will enter unusable state.)");
        button.setStyleName("Default");
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                add(new RenderEpicFail());
            }
        });
        add(button);
    }
}
