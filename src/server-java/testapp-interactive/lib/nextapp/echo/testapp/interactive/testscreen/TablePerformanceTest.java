/* 
 * This file is part of the Echo Web Application Framework (hereinafter "Echo").
 * Copyright (C) 2002-2008 NextApp, Inc.
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

import nextapp.echo.app.Border;
import nextapp.echo.app.Color;
import nextapp.echo.app.Column;
import nextapp.echo.app.Extent;
import nextapp.echo.app.Insets;
import nextapp.echo.app.Label;
import nextapp.echo.app.SplitPane;
import nextapp.echo.app.Table;
import nextapp.echo.app.event.ActionEvent;
import nextapp.echo.app.event.ActionListener;
import nextapp.echo.app.layout.SplitPaneLayoutData;
import nextapp.echo.app.table.AbstractTableModel;
import nextapp.echo.app.table.DefaultTableModel;
import nextapp.echo.testapp.interactive.ButtonColumn;

/**
 * A test for evaluating the performance of <code>Tables</code>s.
 */
public class TablePerformanceTest extends SplitPane {
    
    private Table testTable;
    
    private class MultiplicationTableModel extends AbstractTableModel {
        
        private int columnCount, rowCount;
        
        public MultiplicationTableModel(int columnCount, int rowCount) {
            super();
            this.columnCount = columnCount;
            this.rowCount = rowCount;
        }

        /**
         * @see nextapp.echo.app.table.TableModel#getColumnCount()
         */
        public int getColumnCount() {
            return columnCount;
        }
        
        /**
         * @see nextapp.echo.app.table.TableModel#getRowCount()
         */
        public int getRowCount() {
            return rowCount;
        }
        
        /**
         * @see nextapp.echo.app.table.TableModel#getValueAt(int, int)
         */
        public Object getValueAt(int column, int row) {
            return new Integer((column + 1) * (row + 1));
        }
    }
    
    public TablePerformanceTest() {
        super();
        setStyleName("TestControls");
        
        Column groupContainerColumn = new Column();
        groupContainerColumn.setCellSpacing(new Extent(5));
        groupContainerColumn.setStyleName("TestControlsColumn");
        add(groupContainerColumn);
        
        Column testColumn = new Column();
        SplitPaneLayoutData splitPaneLayoutData = new SplitPaneLayoutData();
        splitPaneLayoutData.setInsets(new Insets(10, 5));
        testColumn.setLayoutData(splitPaneLayoutData);
        add(testColumn);
        
        testTable = new Table();
        testTable.setBorder(new Border(new Extent(1), Color.BLUE, Border.STYLE_SOLID));
        testColumn.add(testTable);

        ButtonColumn controlsColumn;
        
        controlsColumn = new ButtonColumn();
        groupContainerColumn.add(controlsColumn);

        controlsColumn.add(new Label("TableModel"));
        
        controlsColumn.addButton("DefaultTableModel (Empty)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new DefaultTableModel());
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (12x12)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(12, 12));
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (12x25)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(12, 25));
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (12x50)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(12, 50));
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (12x100)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(12, 100));
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (25x12)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(25, 12));
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (25x25)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(25, 25));
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (25x50)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(25, 50));
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (25x100)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(25, 100));
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (8x1000)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(8, 1000));
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (8x2000)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(8, 2000));
            }
        });
        
        controlsColumn.addButton("MultiplicationTableModel (8x5000)", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setModel(new MultiplicationTableModel(8, 5000));
            }
        });
        
        controlsColumn = new ButtonColumn();
        groupContainerColumn.add(controlsColumn);

        controlsColumn.add(new Label("Rollover/Selection"));
        
        controlsColumn.addButton("Enable Rollover Effects", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setRolloverBackground(Color.BLUE);
                testTable.setRolloverForeground(Color.WHITE);
                testTable.setRolloverEnabled(true);
            }
        });
        
        controlsColumn.addButton("Disable Rollover Effects", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setRolloverBackground(null);
                testTable.setRolloverForeground(null);
                testTable.setRolloverEnabled(false);
            }
        });
        
        controlsColumn.addButton("Enable Selection Effects", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setSelectionBackground(Color.GREEN);
                testTable.setSelectionForeground(Color.BLUE);
                testTable.setSelectionEnabled(true);
            }
        });
        
        controlsColumn.addButton("Disable Selection Effects", new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                testTable.setSelectionBackground(null);
                testTable.setSelectionForeground(null);
                testTable.setSelectionEnabled(false);
            }
        });        
    }
}
