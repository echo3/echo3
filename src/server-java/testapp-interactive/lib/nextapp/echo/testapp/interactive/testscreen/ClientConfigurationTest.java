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

import nextapp.echo.app.Alignment;
import nextapp.echo.app.Border;
import nextapp.echo.app.Button;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Grid;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.MutableStyle;
import nextapp.echo.app.Style;
import nextapp.echo.app.TextField;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.GridLayoutData;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.webcontainer.ClientConfiguration;
import nextapp.echo.webcontainer.ContainerContext;
import nextapp.echo.webcontainer.WebContainerServlet;

/**
 * Interactive test for client configuration settings.
 */
public class ClientConfigurationTest extends Column {

    private static final Style PROMPT_STYLE;
    static {
        MutableStyle style = new MutableStyle();
        GridLayoutData layoutData = new GridLayoutData();
        layoutData.setAlignment(new Alignment(Alignment.RIGHT, Alignment.TOP));
        style.set(PROPERTY_LAYOUT_DATA, layoutData);
        PROMPT_STYLE = style;
    }

    private TextField serverErrorUriText, serverErrorMessageText, sessionExpirationUriText, sessionExpirationMessageText;
    
    /**
     * Default constructor. 
     */
    public ClientConfigurationTest() {
        super();
        SplitPaneLayoutData splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(10));
        setLayoutData(splitPaneLayoutData);
        setCellSpacing(new Extent(20));
        
        Grid grid = new Grid(2);
        grid.setBorder(new Border(2, Color.BLUE, Border.STYLE_GROOVE));
        grid.setInsets(new Insets(10, 5));
        add(grid);
        
        Label label;
        
        label = new Label("Server Error URI:");
        label.setStyle(PROMPT_STYLE);
        grid.add(label);
        
        serverErrorUriText = new TextField();
        serverErrorUriText.setStyleName("Default");
        grid.add(serverErrorUriText);
        
        label = new Label("Server Error Message:");
        label.setStyle(PROMPT_STYLE);
        grid.add(label);
        
        serverErrorMessageText = new TextField();
        serverErrorMessageText.setStyleName("Default");
        grid.add(serverErrorMessageText);
        
        label = new Label("Session Expiration URI:");
        label.setStyle(PROMPT_STYLE);
        grid.add(label);
        
        sessionExpirationUriText = new TextField();
        sessionExpirationUriText.setStyleName("Default");
        grid.add(sessionExpirationUriText);
        
        label = new Label("Session Expiration Message:");
        label.setStyle(PROMPT_STYLE);
        grid.add(label);
        
        sessionExpirationMessageText = new TextField();
        sessionExpirationMessageText.setStyleName("Default");
        grid.add(sessionExpirationMessageText);
        
        Button updateButton = new Button("Update ClientConfiguration");
        updateButton.setStyleName("Default");
        updateButton.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                updateClientConfiguration();
            }
        });
        add(updateButton);
        
        Button exceptionButton = new Button("Throw a RuntimeException");
        exceptionButton.setStyleName("Default");
        exceptionButton.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                throw new RuntimeException("Test RuntimeException thrown at user request by ClientConfigurationTest.");
            }
        });
        add(exceptionButton);
        
        Button expireSessionButton = new Button("Expire Session");
        expireSessionButton.setStyleName("Default");
        expireSessionButton.addActionListener(new ActionListener(){
            public void actionPerformed(ActionEvent e) {
                WebContainerServlet.getActiveConnection().getRequest().getSession().invalidate();
            }
        });
        add(expireSessionButton);
    }
    
    /**
     * Performs <code>ClientConfigurationUpdate</code>.
     */
    private void updateClientConfiguration() {
        ClientConfiguration clientConfiguration = new ClientConfiguration();
        if (serverErrorUriText.getText().trim().length() > 0) {
            clientConfiguration.setProperty(ClientConfiguration.PROPERTY_SERVER_ERROR_URI, serverErrorUriText.getText());
        }
        if (serverErrorMessageText.getText().trim().length() > 0) {
            clientConfiguration.setProperty(ClientConfiguration.PROPERTY_SERVER_ERROR_MESSAGE, serverErrorMessageText.getText());
        }
        if (sessionExpirationUriText.getText().trim().length() > 0) {
            clientConfiguration.setProperty(ClientConfiguration.PROPERTY_SESSION_EXPIRATION_URI, 
                    sessionExpirationUriText.getText());
        }
        if (sessionExpirationMessageText.getText().trim().length() > 0) {
            clientConfiguration.setProperty(ClientConfiguration.PROPERTY_SESSION_EXPIRATION_MESSAGE, 
                    sessionExpirationMessageText.getText());
        }
        
        ContainerContext containerContext 
                = (ContainerContext) getApplicationInstance().getContextProperty(ContainerContext.CONTEXT_PROPERTY_NAME);
        containerContext.setClientConfiguration(clientConfiguration);
    }
}
