/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2005 NextApp, Inc.
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

import java.util.Arrays;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.http.Cookie;

import nextapp.echo.app.ApplicationInstance;
import nextapp.echo.app.Button;
import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.Row;
import nextapp.echo.app.Table;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.table.AbstractTableModel;
import nextapp.echo.app.table.DefaultTableModel;
import nextapp.echo.app.table.TableCellRenderer;
import nextapp.echo.webcontainer.ContainerContext;
import nextapp.echo.webcontainer.ClientProperties;

/**
 * A test which displays the contents of the <code>ClientProperties</code> 
 * object.
 * <p>
 * Note that this object has a dependency on the Web Application Container 
 * and Web Renderer.
 */
public class ContainerContextTest extends Column {
    
    private class CookiesTableModel extends AbstractTableModel {
        
        private Cookie[] cookies;
        
        CookiesTableModel(ContainerContext containerContext) {
            this.cookies = containerContext.getCookies();
        }
        
        /**
         * @see nextapp.echo.app.table.AbstractTableModel#getColumnName(int)
         */
        public String getColumnName(int column) {
            switch (column) {
            case 0: return "Name";
            case 1: return "Max Age";
            case 2: return "Value";
            default: throw new IndexOutOfBoundsException(Integer.toString(column));
            }
        }
             
        /**
         * @see nextapp.echo.app.table.TableModel#getValueAt(int, int)
         */
        public Object getValueAt(int column, int row) {
            switch (column) {
            case 0: return cookies[row].getName();
            case 1: return new Integer(cookies[row].getMaxAge());
            case 2: return cookies[row].getValue();
            default: throw new IndexOutOfBoundsException(Integer.toString(column));
            }
        }
    
        /**
         * @see nextapp.echo.app.table.TableModel#getRowCount()
         */
        public int getRowCount() {
            return cookies.length;
        }
    
        /**
         * @see nextapp.echo.app.table.TableModel#getColumnCount()
         */
        public int getColumnCount() {
            return 3;
        }
    };
    
    private class PropertyTableCellRenderer 
    implements TableCellRenderer {

        /**
         * @see nextapp.echo.app.table.TableCellRenderer#getTableCellRendererComponent(nextapp.echo.app.Table, 
         *      java.lang.Object, int, int)
         */
        public Component getTableCellRendererComponent(Table table, Object value, int column, int row) {
            String labelValue;
            if (value instanceof Object[]) {
                Object[] array = (Object[]) value;
                StringBuffer out = new StringBuffer();
                for (int i = 0; i < array.length; ++i) {
                    out.append(array[i]);
                    if (i < array.length - 1) {
                        out.append(",");
                    }
                }
                labelValue = out.toString();
            } else {
                labelValue = value == null ? null : value.toString();
            }
            
            Label label = new Label(labelValue);
            label.setStyleName(row % 2 == 0 ? "EvenCellLabel" : "OddCellLabel");
            return label;
        }
    }

    public ContainerContextTest() {
        super();
        
        setCellSpacing(new Extent(10));
        
        SplitPaneLayoutData splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(10));
        setLayoutData(splitPaneLayoutData);
        
        ApplicationInstance app = ApplicationInstance.getActive();
        final ContainerContext containerContext 
                = (ContainerContext) app.getContextProperty(ContainerContext.CONTEXT_PROPERTY_NAME);
        
        Table clientPropertiesTable = createClientPropertiesTable(containerContext);
        if (clientPropertiesTable != null) {
            Column clientPropertiesColumn = new Column();
            add(clientPropertiesColumn);
            clientPropertiesColumn.add(new Label("Client Properties"));
            clientPropertiesColumn.add(clientPropertiesTable);
        }
        
        Column initialParametersColumn = new Column();
        add(initialParametersColumn);
        initialParametersColumn.add(new Label("Initial Parameters"));
        initialParametersColumn.add(createInitialParametersTable(containerContext));
        
        Column applicationPropertiesColumn = new Column();
        add(applicationPropertiesColumn);
        applicationPropertiesColumn.add(new Label("ApplicationInstance Properties"));
        applicationPropertiesColumn.add(createApplicationPropertiesTable(app));
        
        final Table cookiesTable = createCookieTable(containerContext);
        Column cookiesColumn = new Column();
        add(cookiesColumn);
        cookiesColumn.add(new Label("Cookies"));
        cookiesColumn.add(cookiesTable);
        Row controlsRow = new Row();

        Button setCookieButton = new Button("Add Cookie");
        setCookieButton.setStyleName("Default");
        setCookieButton.setWidth(new Extent(150));
        setCookieButton.addActionListener(new ActionListener() {
        
            public void actionPerformed(ActionEvent e) {
                int value = (int) (Math.random() * 3);
                Cookie cookie = new Cookie("EchoTestCookie" + value, "Mmmmm Cookies " + value);
                containerContext.addCookie(cookie);
            }
        });
        controlsRow.add(setCookieButton);
        
        Button refreshCookiesButton = new Button("Refresh Cookies");
        refreshCookiesButton.setStyleName("Default");
        refreshCookiesButton.setWidth(new Extent(150));
        refreshCookiesButton.addActionListener(new ActionListener() {
        
            public void actionPerformed(ActionEvent e) {
                cookiesTable.setModel(new CookiesTableModel(containerContext));
            }
        });
        controlsRow.add(refreshCookiesButton);
        
        cookiesColumn.add(controlsRow);
    }
    
    private Table createApplicationPropertiesTable(ApplicationInstance app) {
        Table table = new Table();
        table.setStyleName("Default");
        table.setDefaultRenderer(Object.class, new PropertyTableCellRenderer());
        
        DefaultTableModel model = (DefaultTableModel) table.getModel();
        model.setColumnCount(2);

        table.getColumnModel().getColumn(0).setHeaderValue("Property");
        table.getColumnModel().getColumn(1).setHeaderValue("Value");
        
        model.addRow(new Object[]{"Locale", app.getLocale()});
        model.addRow(new Object[]{"Layout Direction", app.getLayoutDirection()});
        
        return table;
    }

    private Table createClientPropertiesTable(ContainerContext containerContext) {
        ClientProperties clientProperties = containerContext.getClientProperties();
        if (clientProperties == null) {
            return null;
        }
        String[] propertyNames = clientProperties.getPropertyNames();
        Arrays.sort(propertyNames);
        
        Table table = new Table();
        table.setStyleName("Default");
        table.setDefaultRenderer(Object.class, new PropertyTableCellRenderer());
        
        DefaultTableModel model = (DefaultTableModel) table.getModel();
        model.setColumnCount(2);

        table.getColumnModel().getColumn(0).setHeaderValue("Property");
        table.getColumnModel().getColumn(1).setHeaderValue("Value");

        for (int i = 0; i < propertyNames.length; ++i) {
            Object propertyValue = clientProperties.get(propertyNames[i]);
            model.addRow(new Object[]{propertyNames[i], propertyValue});
        }
        
        return table;
    }
    
    private Table createCookieTable(ContainerContext containerContext) {
        Table table = new Table(new CookiesTableModel(containerContext));
        table.setStyleName("Default");
        table.setDefaultRenderer(Object.class, new PropertyTableCellRenderer());
        return table;
    }
    
    private Table createInitialParametersTable(ContainerContext containerContext) {
        Map initialParameterMap = containerContext.getInitialRequestParameterMap();
        
        Table table = new Table();
        table.setStyleName("Default");
        table.setDefaultRenderer(Object.class, new PropertyTableCellRenderer());
        
        DefaultTableModel model = (DefaultTableModel) table.getModel();
        model.setColumnCount(2);

        table.getColumnModel().getColumn(0).setHeaderValue("Property");
        table.getColumnModel().getColumn(1).setHeaderValue("Value");
        
        Iterator it = initialParameterMap.keySet().iterator();
        while (it.hasNext()) {
            String key = (String) it.next();
            model.addRow(new Object[]{key, initialParameterMap.get(key)});
        }
        
        return table;
    }
}
