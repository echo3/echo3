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

package nextapp.echo.app.event;

import java.util.EventObject;

/**
 * An event describing an update to items in a list.
 *
 * @see nextapp.echo.app.event.ListDataListener
 */
public class ListDataEvent extends EventObject {

    /**
     * An event type indicating items in the list were changed.
     */
    public static final int CONTENTS_CHANGED = 0;
    
    /**
     * An event type indicating items were added to the list.
     */
    public static final int INTERVAL_ADDED = 1;
    
    /**
     * An event type indicating items were removed from the list.
     */
    public static final int INTERVAL_REMOVED = 2;
    
    private int index0;
    private int index1;
    private int type;

    /**
     * Creates a new <code>ListDataEvent</code>
     *
     * @param source the object that generated the event
     * @param type the type of event, one of the following values:
     *        <ul>
     *         <li>CONTENTS_CHANGED - Indicates a change was made to one or more 
     *             items in the list.</li>
     *         <li>INTERVAL_ADDED - Indicates one or more items were added to
     *             the list.</li>
     *         <li>INTERVAL_REMOVED - Indicates one or more items were removed
     *             from the list.</li>
     *        </ul>
     * @param index0 the first index of the interval affected by the list change
     * @param index1 the last index of the interval affected by the list change
     *         
     */
    public ListDataEvent(Object source, int type, int index0, int index1) {
         super(source);
         
         this.type = type;
         this.index0 = index0;
         this.index1 = index1;
    }
    
    /**
     * Returns the first index of the interval affected by the list change.
     * 
     * @return the first index
     */
    public int getIndex0() {
        return index0;
    }
    
    /**
     * Returns the last index of the interval affected by the list change.
     * 
     * @return the last index
     */
    public int getIndex1() {
        return index1;
    }
    
    /**
     * Returns the type of the event
     * 
     * @return the type of event, one of the following values:
     *         <ul>
     *          <li>CONTENTS_CHANGED - Indicates a change was made to one or more
     *              items in the list.</li>
     *          <li>INTERVAL_ADDED - Indicates one or more items were added to
     *              the list.</li>
     *          <li>INTERVAL_REMOVED - Indicates one or more items were removed
     *              from the list.</li>
     *         </ul>
     */
    public int getType() {
        return type;
    }
}
