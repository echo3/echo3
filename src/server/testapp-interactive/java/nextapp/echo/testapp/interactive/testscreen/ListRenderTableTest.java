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

import nextapp.echo.app.Column;
import nextapp.echo.app.Component;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.SelectField;
import nextapp.echo.app.Table;
import nextapp.echo.app.TextField;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.list.AbstractListModel;
import nextapp.echo.app.list.DefaultListModel;
import nextapp.echo.app.list.ListModel;
import nextapp.echo.app.table.DefaultTableModel;
import nextapp.echo.app.table.TableCellRenderer;
import nextapp.echo.app.text.StringDocument;

/**
 * A test to determine bandwidth consumption of large numbers of list boxes 
 * with identical models.
 */
public class ListRenderTableTest extends Column {
    
    private ListModel monthModel = new DefaultListModel(new Object[]{ "January", "Februrary", "March", "April", "May", 
            "June", "July", "August", "September", "October", "November", "December"});

    private ListModel dayModel = new AbstractListModel(){
    
        /**
         * @see nextapp.echo.app.list.ListModel#size()
         */
        public int size() {
            return 31;
        }
    
        /**
         * @see nextapp.echo.app.list.ListModel#get(int)
         */
        public Object get(int index) {
            return Integer.toString(index + 1);
        }
    };
    
    private ListModel yearModel = new AbstractListModel(){
    
        /**
         * @see nextapp.echo.app.list.ListModel#size()
         */
        public int size() {
            return 200;
        }
    
        /**
         * @see nextapp.echo.app.list.ListModel#get(int)
         */
        public Object get(int index) {
            return Integer.toString(index + 1850);
        }
    };
    
    public ListRenderTableTest() {
        setCellSpacing(new Extent(10));
        
        SplitPaneLayoutData splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(10));
        setLayoutData(splitPaneLayoutData);
        
        DefaultTableModel model = new DefaultTableModel();
        model.setColumnCount(4);
        for (int i = 0; i < 10; ++i) {
            model.addRow(new Object[]{"John Smith", new Integer(0), new Integer(4), new Integer(1982)});
        }
        
        TableCellRenderer renderer = new TableCellRenderer() {
        
            public Component getTableCellRendererComponent(Table table, Object value, int column, int row) {
                switch (column) {
                case 0:
                    TextField tf = new TextField(new StringDocument(), value.toString(), 30);
                    return tf;
                case 1:
                    SelectField monthField = new SelectField(monthModel);
                    monthField.setSelectedIndex(((Integer) value).intValue());
                    return monthField;
                case 2:
                    SelectField dayField = new SelectField(dayModel);
                    dayField.setSelectedIndex(((Integer) value).intValue() - 1);
                    return dayField;
                case 3:
                    SelectField yearField = new SelectField(yearModel);
                    yearField.setSelectedIndex(((Integer) value).intValue() - 1850);
                    return yearField;
                }
                return null;
            }
        };
        
        Table table = new Table(model);
        table.setStyleName("Default");
        table.setDefaultRenderer(Object.class, renderer);
        add(table);
    }
}
