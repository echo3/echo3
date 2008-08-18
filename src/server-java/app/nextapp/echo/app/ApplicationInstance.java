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

package nextapp.echo.app;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.io.Serializable;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import nextapp.echo.app.update.ServerUpdateManager;
import nextapp.echo.app.update.UpdateManager;
import nextapp.echo.app.util.Uid;

/**
 * A single user-instance of an Echo application.
 */
public abstract class ApplicationInstance 
implements Serializable {
    
    /** Serial Version UID. */
    private static final long serialVersionUID = 20070101L;

    /** The name and version of the Echo API in use. */
    public static final String ID_STRING = "NextApp Echo v3.0.b1+";

    public static final String FOCUSED_COMPONENT_CHANGED_PROPERTY = "focusedComponent";
    public static final String LOCALE_CHANGED_PROPERTY = "locale";
    public static final String MODAL_COMPONENTS_CHANGED_PROPERTY = "modalComponents";
    public static final String WINDOWS_CHANGED_PROPERTY = "windows";
    
    /** 
     * A <code>ThreadLocal</code> reference to the 
     * <code>ApplicationInstance</code> relevant to the current thread.
     */ 
    private static final ThreadLocal activeInstance = new ThreadLocal();
    
    /**
     * Determines the current modal component by searching the entire hierarchy for modal components.
     * This operation is only performed when multiple visibly rendered components are registered as modal.
     * 
     * @param searchComponent the root <code>Component</code> at which to start the search.
     * @param visibleModalComponents the set of visible modal components
     * @return the current modal component
     */
    private static Component findCurrentModalComponent(Component searchComponent, Set visibleModalComponents) {
        int count = searchComponent.getComponentCount();
        for (int i = count - 1; i >= 0; --i) {
            Component foundComponent = findCurrentModalComponent(searchComponent.getComponent(i), visibleModalComponents);
            if (foundComponent != null) {
                return foundComponent;
            }
        }

        if (searchComponent instanceof ModalSupport && ((ModalSupport) searchComponent).isModal()
                 && visibleModalComponents.contains(searchComponent)) {
            return searchComponent;
        }
        
        return null;
    }
    
    /**
     * Generates a system-level identifier (an identifier which is unique to all
     * <code>ApplicationInstance</code>s).
     * 
     * @return the generated identifier
     * @see #generateId()
     */
    public static final String generateSystemId() {
        return Uid.generateUidString();
    }
    
    /**
     * Returns a reference to the <code>ApplicationInstance</code> that is 
     * relevant to the current thread, or null if no instance is relevant.
     * 
     * @return the relevant <code>ApplicationInstance</code>
     */
    public static final ApplicationInstance getActive() {
        return (ApplicationInstance) activeInstance.get();
    }

    /**
     * Sets the <code>ApplicationInstance</code> that is relevant to the 
     * current thread.  This method should be invoked with a null
     * argument when the previously set <code>ApplicationInstance</code> is 
     * no longer relevant.
     * <p>
     * <b>This method should only be invoked by the application container.</b>  
     * 
     * @param applicationInstance the relevant <code>ApplicationInstance</code>
     */
    public static final void setActive(ApplicationInstance applicationInstance) {
        activeInstance.set(applicationInstance);
    }

    /**
     * The presently focused component.
     */
    private transient WeakReference focusedComponent;

    /** 
     * The default <code>Locale</code> of the application.
     * This <code>Locale</code> will be inherited by <code>Component</code>s. 
     */
    private Locale locale;
    
    /** 
     * The default <code>LayoutDirection</code> of the application, derived 
     * from the application's <code>Locale</code>.
     * This <code>LayoutDirection</code> will be inherited by 
     * <code>Component</code>s. 
     */
    private LayoutDirection layoutDirection;

    /** 
     * Contextual data.
     * @see #getContextProperty(java.lang.String)
     */
    private Map context;
    
    /**
     * Mapping from the render ids of all registered components to the 
     * <code>Component</code> instances themselves.
     */
    private Map renderIdToComponentMap;
    
    /**
     * Mapping between <code>TaskQueueHandle</code>s and <code>List</code>s
     * of <code>Runnable</code> tasks.  Values may be null if a particular 
     * <code>TaskQueue</code> does not contain any tasks. 
     */
    private HashMap taskQueueMap;
    
    /**
     * Fires property change events for the instance object.
     */
    private PropertyChangeSupport propertyChangeSupport;

    /**
     * The <code>UpdateManager</code> handling updates to/from this application.
     */
    private UpdateManager updateManager;
    
    /**
     * The top-level <code>Window</code>.
     * Currently only one top-level is supported per 
     * <code>ApplicationInstance</code>.
     */
    private Window defaultWindow;
    
    /**
     * The <code>StyleSheet</code> used by the application.
     */
    private StyleSheet styleSheet;

    /**
     * Collection of modal components, the last index representing the current
     * modal context.
     */
    private List modalComponents;
    
    /**
     * The next available sequentially generated 
     * <code>ApplicationInstance</code>-unique identifier value.
     * @see #generateId()
     */
    private long nextId;
    
    /** 
     * Creates an <code>ApplicationInstance</code>. 
     */
    public ApplicationInstance() {
        super();
        
        locale = Locale.getDefault();
        layoutDirection = LayoutDirection.forLocale(locale);
        
        propertyChangeSupport = new PropertyChangeSupport(this);
        updateManager = new UpdateManager(this);
        renderIdToComponentMap = new HashMap();
        taskQueueMap = new HashMap();
    }
    
    /**
     * Invoked after the application has been passivated (such that its state may
     * be persisted or moved amongst VMs) and is about to be reactivated.
     * Implementations must invoke <code>super.activate()</code>.
     */
    public void activate() {
    }

    /**
     * Adds a <code>PropertyChangeListener</code> to receive notification of
     * application-level property changes.
     * 
     * @param l the listener to add
     */
    public void addPropertyChangeListener(PropertyChangeListener l) {
        propertyChangeSupport.addPropertyChangeListener(l);
    }
    
    /**
     * Creates a new task queue.  A handle object representing the created task
     * queue is returned.  The created task queue will remain active until it is
     * provided to the <code>removeTaskQueue()</code> method.  Developers must
     * take care to invoke <code>removeTaskQueue()</code> on any created
     * task queues.
     * 
     * @return a <code>TaskQueueHandler</code> representing the created task 
     *         queue
     * @see #removeTaskQueue(TaskQueueHandle)
     */
    public TaskQueueHandle createTaskQueue() {
        TaskQueueHandle taskQueue = new TaskQueueHandle() { 
            /** Serial Version UID. */
            private static final long serialVersionUID = 20070101L;
        };
        synchronized (taskQueueMap) {
            taskQueueMap.put(taskQueue, null);
        }
        return taskQueue;
    }
    
    /**
     * Invoked when the application is disposed and will not be used again.
     * Implementations must invoke <code>super.dispose()</code>.
     */
    public void dispose() {
        if (defaultWindow != null) {
            defaultWindow.doDispose();
            defaultWindow.register(null);
        }
    }

    /**
     * Initializes the <code>ApplicationInstance</code>. This method is
     * invoked by the application container.
     * 
     * @return the default <code>Window</code> of the application
     * @throws IllegalStateException in the event that the current thread is not
     *         permitted to update the state of the user interface
     */
    public final Window doInit() {
        if (this != activeInstance.get()) {
            throw new IllegalStateException(
                    "Attempt to update state of application user interface outside of user interface thread.");
        }
        Window window = init();
        setDefaultWindow(window);
        doValidation();
        return window;
    }
    
    /**
     * Validates all components registered with the application.
     */
    public final void doValidation() {
        doValidation(defaultWindow);
    }
    
    /**
     * Validates a single component and then recursively validates its 
     * children.  This is the recursive support method for
     * the parameterless <code>doValidation()</code> method.
     *
     * @param c The component to be validated.
     * @see #doValidation()
     */
    private void doValidation(Component c) {
        c.validate();
        int size = c.getComponentCount();
        for (int index = 0; index < size; ++index) {
            doValidation(c.getComponent(index));
        }
    }

    /**
     * Queues the given stateless <code>Command</code> for execution on the 
     * current client/server synchronization.
     * 
     * @param command the <code>Command</code> to execute
     */
    public void enqueueCommand(Command command) {
        updateManager.getServerUpdateManager().enqueueCommand(command);
    }
    
    /**
     * Enqueues a task to be run during the next client/server 
     * synchronization.  The task will be run 
     * <b>synchronously</b> in the user interface update thread.
     * Enqueuing a task in response to an external event will result 
     * in changes being pushed to the client.
     * 
     * @param taskQueue the <code>TaskQueueHandle</code> representing the
     *        queue into which this task should be placed
     * @param task the task to run on client/server synchronization
     */
    public void enqueueTask(TaskQueueHandle taskQueue, Runnable task) {
        synchronized (taskQueueMap) {
            List taskList = (List) taskQueueMap.get(taskQueue);
            if (taskList == null) {
                taskList = new ArrayList();
                taskQueueMap.put(taskQueue, taskList);
            }
            taskList.add(task);
        }
    }
    
    /**
     * Reports a bound property change.
     *
     * @param propertyName the name of the changed property
     * @param oldValue the previous value of the property
     * @param newValue the present value of the property
     */
    protected void firePropertyChange(String propertyName, Object oldValue, Object newValue) {
        propertyChangeSupport.firePropertyChange(propertyName, oldValue, newValue);
    }
    
    /**
     * Generates an identifier which is unique within this 
     * <code>ApplicationInstance</code>.  This identifier should not be
     * used outside of the context of this  <code>ApplicationInstance</code>.
     * 
     * @return the unique identifier
     * @see #generateSystemId()
     */
    public String generateId() {
        return Long.toString(nextId++);
    }
    
    /**
     * Returns the value of a contextual property.
     * Contextual properties are typically set by an application
     * container, e.g., the Web Container, in order to provide
     * container-specific information.  The property names of contextual
     * properties are provided within the application container
     * documentation when their use is required.
     * 
     * @param propertyName the name of the object
     * @return the object
     */
    public Object getContextProperty(String propertyName) {
        return context == null ? null : context.get(propertyName);
    }

    /**
     * Retrieves the component currently registered with the application 
     * with the specified render id.
     * 
     * @param renderId the render id of the component
     * @return the component (or null if no component with the specified
     *         render id is registered)
     */
    public Component getComponentByRenderId(String renderId) {
        return (Component) renderIdToComponentMap.get(renderId);
    }

    /**
     * Returns the default window of the application.
     * 
     * @return the default <code>Window</code>
     */
    public Window getDefaultWindow() {
        return defaultWindow;
    }
    
    /**
     * Returns the presently focused component, if known.
     * 
     * @return the focused component
     */
    public Component getFocusedComponent() {
        if (focusedComponent == null) {
            return null;
        } else {
            return (Component) focusedComponent.get();
        }
    }
    
    /**
     * Returns the application instance's default 
     * <code>LayoutDirection</code>.
     *
     * @return the <code>Locale</code>
     */
    public LayoutDirection getLayoutDirection() {
        return layoutDirection;
    }
    
    /**
     * Returns the application instance's default <code>Locale</code>.
     *
     * @return the <code>Locale</code>
     */
    public Locale getLocale() {
        return locale;
    }
    
    /**
     * Retrieves the root component of the current modal context, or null
     * if no modal context exists.  Components which are not within the 
     * descendant hierarchy of the modal context are barred from receiving
     * user input.
     * 
     * @return the root component of the modal context
     */
    public Component getModalContextRoot() {
        if (modalComponents == null || modalComponents.size() == 0) {
            // No components marked as modal.
            return null;
        } else if (modalComponents.size() == 1) {
            // One component marked as modal, return it if visible, null otherwise.
            Component component = (Component) modalComponents.get(0);
            return component.isRenderVisible() ? component : null;
        }

        // Multiple modal components.
        Set visibleModalComponents = new HashSet();
        for (int i = modalComponents.size() - 1; i >= 0; --i) {
            Component component = (Component) modalComponents.get(i);
            if (component.isRenderVisible()) {
                visibleModalComponents.add(component);
            }
        }
        
        return findCurrentModalComponent(getDefaultWindow(), visibleModalComponents);  
    }
    
    /**
     * Retrieves the style for the specified specified class of 
     * component / style name.
     * 
     * @param componentClass the component <code>Class</code>
     * @param styleName the component's specified style name
     * @return the appropriate application-wide style, or null
     *         if none exists
     */
    public Style getStyle(Class componentClass, String styleName) {
        if (styleSheet == null) {
            return null;
        } else {
            return styleSheet.getStyle(styleName, componentClass, true);
        }
    }
    
    /**
     * Returns the application-wide <code>StyleSheet</code>, if present.
     * 
     * @return the <code>StyleSheet</code>
     */
    public StyleSheet getStyleSheet() {
        return styleSheet;
    }
    
    /**
     * Retrieves the <code>UpdateManager</code> being used to manage the
     * client/server synchronization of this <code>ApplicationInstance</code>
     * 
     * @return the <code>UpdateManager</code>
     */
    public UpdateManager getUpdateManager() {
        return updateManager;
    }
    
    /**
     * Determines if this <code>ApplicationInstance</code> currently has any 
     * active tasks queues, which might be monitoring external events.
     * 
     * @return true if the instance has any task queues
     */
    public final boolean hasTaskQueues() {
        return taskQueueMap.size() > 0;
    }
    
    /**
     * Determines if there are any queued tasks in any of the task
     * queues associated with this <code>ApplicationInstance</code>.
     * <p>
     * This method may be overridden by an application in order to check
     * on the status of long-running operations and enqueue tasks 
     * just-in-time.  In such cases tasks should be <strong>enqueued</strong>
     * and the value of <code>super.hasQueuedTasks()</code> should be 
     * returned.  This method is not invoked by a user-interface thread and
     * thus the component hierarchy may not be modified in
     * overriding implementations.
     * 
     * @return true if any tasks are queued
     */
    public boolean hasQueuedTasks() {
        if (taskQueueMap.size() == 0) {
            return false;
        }
        Iterator it = taskQueueMap.values().iterator();
        while (it.hasNext()) {
            List taskList = (List) it.next();
            if (taskList != null && taskList.size() > 0) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Determines if the given component is modal (i.e., that only components
     * below it in the hierarchy should be enabled).
     * 
     * @param component the <code>Component</code>
     * @return true if the <code>Component</code> is modal 
     */
    private boolean isModal(Component component) {
        return modalComponents != null && modalComponents.contains(component);
    }
    
    /**
     * Invoked to initialize the application, returning the default window.
     * The returned window must be visible.
     *
     * @return the default window of the application
     */
    public abstract Window init();
    
    /**
     * Notifies the <code>UpdateManager</code> in response to a component 
     * property change or child addition/removal.
     * <p>
     * This method is invoked directly from <code>Component</code>s
     * (rather than using a <code>PropertyChangeListener</code>) in the interest
     * of memory efficiency. 
     * 
     * @param parent the parent/updated component
     * @param propertyName the name of the property changed
     * @param oldValue the previous value of the property 
     *        (or the removed component in the case of a
     *        <code>CHILDREN_CHANGED_PROPERTY</code>)
     * @param newValue the new value of the property 
     *        (or the added component in the case of a
     *        <code>CHILDREN_CHANGED_PROPERTY</code>)
     * @throws IllegalStateException in the event that the current thread is not
     *         permitted to update the state of the user interface
     */
    void notifyComponentPropertyChange(Component parent, String propertyName, Object oldValue, Object newValue) {
        // Ensure current thread is a user interface thread.
        if (this != activeInstance.get()) {
            throw new IllegalStateException(
                    "Attempt to update state of application user interface outside of user interface thread.");
        }

        ServerUpdateManager serverUpdateManager = updateManager.getServerUpdateManager();
        if (Component.CHILDREN_CHANGED_PROPERTY.equals(propertyName)) {
            if (newValue == null) {
                serverUpdateManager.processComponentRemove(parent, (Component) oldValue);
            } else {
                serverUpdateManager.processComponentAdd(parent, (Component) newValue);
            }
        } else if (Component.PROPERTY_LAYOUT_DATA.equals(propertyName)) {
            serverUpdateManager.processComponentLayoutDataUpdate(parent);
        } else if (Component.VISIBLE_CHANGED_PROPERTY.equals(propertyName)) {
            if (oldValue != null && newValue != null && oldValue.equals(newValue)) {
                return;
            }
            serverUpdateManager.processComponentVisibilityUpdate(parent);
        } else {
            if (oldValue != null && newValue != null && oldValue.equals(newValue)) {
                return;
            }
            if (parent instanceof ModalSupport && ModalSupport.MODAL_CHANGED_PROPERTY.equals(propertyName)) {
                setModal(parent, ((Boolean) newValue).booleanValue());
            }
            serverUpdateManager.processComponentPropertyUpdate(parent, propertyName, oldValue, newValue);
        }
    }
    
    /**
     * Invoked before the application is passivated (such that its state may
     * be persisted or moved amongst VMs).
     * Implementations must invoke <code>super.passivate()</code>.
     */
    public void passivate() {
    }
    
    /**
     * Processes client input specific to the <code>ApplicationInstance</code> 
     * received from the <code>UpdateManager</code>.
     * Derivative implementations should take care to invoke 
     * <code>super.processInput()</code>.
     */
    public void processInput(String propertyName, Object propertyValue) {
        if (FOCUSED_COMPONENT_CHANGED_PROPERTY.equals(propertyName)) {
            setFocusedComponent((Component) propertyValue);
        }
    }

    /**
     * Processes all queued tasks. This method may only be invoked from within a
     * UI thread by the <code>UpdateManager</code>. Tasks are removed from queues
     * once they have been processed.
     */
    public void processQueuedTasks() {
        if (taskQueueMap.size() == 0) {
            return;
        }
        
        List currentTasks = new ArrayList();
        synchronized (taskQueueMap) {
            Iterator taskListsIt = taskQueueMap.values().iterator();
            while (taskListsIt.hasNext()) {
                List tasks = (List) taskListsIt.next();
                if (tasks != null) {
                    currentTasks.addAll(tasks);
                    tasks.clear();
                }
            }
        }
        Iterator it = currentTasks.iterator();
        while (it.hasNext()) {
            ((Runnable) it.next()).run();
        }
    }
    
    /**
     * Registers a component with the <code>ApplicationInstance</code>.
     * The component will be assigned a unique render id in the event that
     * it does not currently have one.
     * <p>
     * This method is invoked by <code>Component.setApplicationInstance()</code>
     * 
     * @param component the component to register
     * @see Component#register(ApplicationInstance)
     */
    void registerComponent(Component component) {
        String renderId = component.getRenderId();
        if (renderId == null || renderIdToComponentMap.containsKey(renderId)) {
            // Note that the render id is reassigned if it currently exists renderIdToComponentMap.  This could be the case
            // in the event a Component was being used in a pool.
            component.assignRenderId(generateId());
        }
        renderIdToComponentMap.put(component.getRenderId(), component);
        if (component instanceof ModalSupport && ((ModalSupport) component).isModal()) {
            setModal(component, true);
        }
    }
    
    /**
     * Removes a <code>PropertyChangeListener</code> from receiving 
     * notification of application-level property changes.
     * 
     * @param l the listener to remove
     */
    public void removePropertyChangeListener(PropertyChangeListener l) {
        propertyChangeSupport.removePropertyChangeListener(l);
    }
    
    /**
     * Removes the task queue described the specified 
     * <code>TaskQueueHandle</code>.
     * 
     * @param taskQueueHandle the <code>TaskQueueHandle</code> specifying the
     *        task queue to remove
     * @see #createTaskQueue()
     */
    public void removeTaskQueue(TaskQueueHandle taskQueueHandle) {
        synchronized(taskQueueMap) {
            taskQueueMap.remove(taskQueueHandle);
        }
    }
    
    /**
     * Sets a contextual property.
     * 
     * @param propertyName the property name
     * @param propertyValue the property value
     * 
     * @see #getContextProperty(java.lang.String)
     */
    public void setContextProperty(String propertyName, Object propertyValue) {
        if (context == null) {
            context = new HashMap();
        }
        if (propertyValue == null) {
            context.remove(propertyName);
        } else {
            context.put(propertyName, propertyValue);
        }
    }
    
    /**
     * Sets the default top-level window.
     * 
     * @param window the default top-level window
     */
    private void setDefaultWindow(Window window) {
        if (defaultWindow != null) {
            throw new UnsupportedOperationException("Default window already set.");
        }

        defaultWindow = window;
        window.register(this);
        firePropertyChange(WINDOWS_CHANGED_PROPERTY, null, window);
        window.doInit();
    }
    
    /**
     * Sets the presently focused component.
     * 
     * @param newValue the component to be focused
     */
    public void setFocusedComponent(Component newValue) {
        if (newValue instanceof DelegateFocusSupport) {
            newValue = ((DelegateFocusSupport) newValue).getFocusComponent(); 
        }
        
        Component oldValue = getFocusedComponent();
        if (newValue == null) {
            focusedComponent = null;
        } else {
            focusedComponent = new WeakReference(newValue);
        }
        propertyChangeSupport.firePropertyChange(FOCUSED_COMPONENT_CHANGED_PROPERTY, oldValue, newValue);
        updateManager.getServerUpdateManager().processApplicationPropertyUpdate(FOCUSED_COMPONENT_CHANGED_PROPERTY, 
                oldValue, newValue);
    }
    
    /**
     * Sets the default locale of the application.
     * 
     * @param newValue the new locale
     */
    public void setLocale(Locale newValue) {
        if (newValue == null) {
            throw new IllegalArgumentException("ApplicationInstance Locale may not be null.");
        }
        Locale oldValue = locale;
        locale = newValue;
        layoutDirection = LayoutDirection.forLocale(locale);
        propertyChangeSupport.firePropertyChange(LOCALE_CHANGED_PROPERTY, oldValue, newValue);
        updateManager.getServerUpdateManager().processFullRefresh();
    }
    
    /**
     * Sets the modal state of a component (i.e, whether only it and 
     * components below it in the hierarchy should be enabled).
     * 
     * @param component the <code>Component</code>
     * @param newValue the new modal state
     */
    private void setModal(Component component, boolean newValue) {
        boolean oldValue = isModal(component);
        if (newValue) {
            if (modalComponents == null) {
                modalComponents = new ArrayList();
            }
            if (!modalComponents.contains(component)) {
                modalComponents.add(component);
            }
        } else {
            if (modalComponents != null) {
                modalComponents.remove(component);
            }
        }
        firePropertyChange(MODAL_COMPONENTS_CHANGED_PROPERTY, new Boolean(oldValue), new Boolean(newValue));
    }

    /**
     * Sets the <code>StyleSheet</code> of this 
     * <code>ApplicationInstance</code>.  <code>Component</code>s 
     * registered with this instance will retrieve
     * properties from the <code>StyleSheet</code>
     * when property values are not specified directly
     * in a <code>Component</code> or in its specified <code>Style</code>.
     * <p>
     * Note that setting the style sheet should be
     * done sparingly, given that doing so forces the entire
     * client state to be updated.  Generally style sheets should
     * only be reconfigured at application initialization and/or when
     * the user changes the visual theme of a theme-capable application.
     * 
     * @param styleSheet the new style sheet
     */
    public void setStyleSheet(StyleSheet styleSheet) {
        this.styleSheet = styleSheet;
        updateManager.getServerUpdateManager().processFullRefresh();
    }

    /**
     * Unregisters a component from the <code>ApplicationInstance</code>.
     * <p>
     * This method is invoked by <code>Component.setApplicationInstance()</code>.
     * 
     * @param component the component to unregister
     * @see Component#register(ApplicationInstance)
     */
    void unregisterComponent(Component component) {
        renderIdToComponentMap.remove(component.getRenderId());
        if (component instanceof ModalSupport && ((ModalSupport) component).isModal()) {
            setModal(component, false);
        }
    }
    
    /**
     * Verifies that a <code>Component</code> is within the modal context, 
     * i.e., that if a modal <code>Component</code> is present, that it either 
     * is or is a child of that <code>Component</code>.
     * 
     * @param component the <code>Component</code> to evaluate
     * @return true if the <code>Component</code> is within the current 
     *         modal context
     * @see Component#verifyInput(java.lang.String, java.lang.Object)
     */
    boolean verifyModalContext(Component component) {
        Component modalContextRoot = getModalContextRoot();
        return modalContextRoot == null || modalContextRoot.isAncestorOf(component);
    }
}
