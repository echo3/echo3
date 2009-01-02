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

package nextapp.echo.webcontainer.sync.component;

import java.util.StringTokenizer;

import nextapp.echo.app.list.ListSelectionModel;

/**
 * Utilities for serializing <code>ListSelectionModel</code> state between client and server.
 */
class ListSelectionUtil {
    
    /**
     * Creates a selection string representation of a <code>ListSelectionModel</code>.
     * 
     * @param selectionModel the <code>ListSelectionModel</code>
     * @param size the size of the <strong>data</strong> model of which items are selected
     * @return a selection string, e.g., "1,2,3,4", "5", or ""
     */
    static String toString(ListSelectionModel selectionModel, int size) {
        int minimumIndex = selectionModel.getMinSelectedIndex();
        
        if (minimumIndex == -1) {
            // Nothing selected: return empty String.
            return "";
        }
        int maximumIndex = selectionModel.getMaxSelectedIndex();
        
        if (minimumIndex == maximumIndex || selectionModel.getSelectionMode() != ListSelectionModel.MULTIPLE_SELECTION) {
            // Single selection mode or only one index selected: return it directly. 
            return Integer.toString(minimumIndex);
        }
        
        if (maximumIndex > size - 1) {
            maximumIndex = size - 1;
        }
        StringBuffer out = new StringBuffer();
        boolean commaRequired = false;
        for (int i = minimumIndex; i <= maximumIndex; ++i) {
            if (selectionModel.isSelectedIndex(i)) {
                if (commaRequired) {
                    out.append(",");
                } else {
                    commaRequired = true;
                }
                out.append(i);
            }
        }
        return out.toString();
    }
    
    /**
     * Converts a selection String to an int[] array.
     * 
     * @param selectionString the selection string, e.g., "1,2,3,4", "5", "" or <code>null</code>
     * @return the integer array, never <code>null</code>
     */
    static int[] toIntArray(String selectionString) {
        int[] selection;
        int selectionStringLength = selectionString == null ? 0 : selectionString.length();
        if (selectionStringLength == 0) {
            return new int[0];
        } else {
            int itemCount = 1;
            for (int i = 1; i < selectionStringLength - 1; ++i) {
                if (selectionString.charAt(i) == ',') {
                    ++itemCount;
                }
            }
            selection = new int[itemCount];
        }
        StringTokenizer st = new StringTokenizer(selectionString, ",");
        for (int i = 0; i < selection.length; ++i) {
            selection[i] = Integer.parseInt(st.nextToken());
        }        
        return selection;
    }
    
    /** Non-instantiable class. */
    private ListSelectionUtil() { }
}
