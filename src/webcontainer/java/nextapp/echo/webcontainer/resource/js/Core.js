/**
 * Core namespace.  Non-instantiable object.
 * REQUIRES: Nothing.
 * <p>
 * Provides core APIs for creating object-oriented and event-driven JavaScript code:
 * <ul>
 *  <li>Provides "Method Reference" object to describe reference to a member function
 *    of a specific object instance (enabling invocation with "this pointer" set 
*     appropriately.</li>
 *  <li>Provides event/listener management framework.  Event listeners may be 
 *    "Method Reference" objects, thus allowing specific class instances to process events.</li>
 *  <li>Provides basic List/Set/Map collections framework.</li>
 *  <li>Does not provide any web-specific functionality.</li>
 *  <li>Provides string tokenization capability.</li>
 * </ul>
 */
EchoCore = function() { };

/**
 * This is a EchoCore.Debug.Timer object used for optimizing Echo3 JavaScript performance.
 * It should be considered undocumented and not part of the public API.
 */
EchoCore.profilingTimer = null;

/**
 * Returns an array of tokens representing a tring.
 * 
 * @param {String} string the string to tokenize
 * @delimiter {String} delimiter on which to tokenize
 * @return an array of tokens
 * @type Array
 */
EchoCore.tokenizeString = function(string, delimiter) {
    var tokens = new Array();
    var index = string.indexOf(delimiter);
    var previousIndex = 0;
    while (index != -1) {
        var token = string.substring(previousIndex, index);
        if (token.length != 0) {
            tokens.push(token);
        }
        previousIndex = index + delimiter.length;
        index = string.indexOf(delimiter, previousIndex);
    }
    tokens.push(string.substring(previousIndex));
    
    return tokens;
};

EchoCore.Arrays = function() { };

EchoCore.Arrays.remove = function(array, item) {
    for (var i = 0; i < array.length; ++i) {
        if (item == array[i]) {
            array.splice(i, 1);
        }
    }
};

EchoCore.Arrays.removeEqual = function(array, item) {
    for (var i = 0; i < array.length; ++i) {
        if ((item.equals && item.equals(array[i])) || item == array[i]) {
            array.splice(i, 1);
        }
    }
};

EchoCore.Arrays.removeDuplicates = function(array) {
    array.sort();
    var removeCount = 0;
    // Iterate from last element to second element.
    for (var i = array.length - 1; i > 0; --i) {
        // Determine if element is equivalent to previous element.
        if (array[i] == array[i - 1]) {
            // If duplicate, copy last element in array over current element.
            array[i] = array[array.length - 1 - removeCount];
            
            // Increment removeCount (indicating how much the length of the array should be decremented)
            ++removeCount;
        }
    }
    
    if (removeCount > 0) {
        array.length = array.length - removeCount;
    }
};

/**
 * @class EchoCore.Collections Namespace.  Non-instantiable object.
 */
EchoCore.Collections = function() { };

/**
 * Creates a new List.
 * 
 * @constructor
 * @class List collection.
 */
EchoCore.Collections.List = function() { 

    /**
     * Array of items contained in the list.
     * May be externally modified if desired.
     * @type Array
     */
    this.items = new Array();
};

/**
 * Adds an item to the list.
 *
 * @param item the item to add
 * @param {Number} the (integer) index at which to insert it (if not set, item will be added to end of list)
 */
EchoCore.Collections.List.prototype.add = function(item, index) {
    if (index == undefined) {
        this.items.push(item);
    } else {
        this.items.splice(index, 0, item);
    }
};

/**
 * Returns a specific item from the list.
 *
 * @param {Number} index the index of the item to retrieve
 * @return the item
 * @throws Error in the event the specified index is out of bounds
 */
EchoCore.Collections.List.prototype.get = function(index) {
    if (index < 0 || index >= this.items.length) {
        throw new Error("Index out of bounds: " + index);
    } else {
        return this.items[index];
    }
};

/**
 * Returns the index of the specified item within the list, or -1 if it 
 * is not contained in the list.  
 * 
 * Note on equality: This method will evaluate equality by
 * invoking .equals() on the specified item if it provides such a method.
 * If a .equals() implementation is not provided, equality will be determined
 * based on the double-equal operator (==).
 * 
 * @param item the item
 * @return the index of the item, or -1 if it is not present in the list
 * @type Number
 */
EchoCore.Collections.List.prototype.indexOf = function(item) {
    for (var i = 0; i < this.items.length; ++i) {
        if ((item.equals && item.equals(this.items[i])) || item == this.items[i]) {
            return i;
        }
    }
    return -1;
};

/**
 * Removes an item from the list.
 *
 * @param {Number} index the index of the item to remove
 */
EchoCore.Collections.List.prototype.remove = function(index) {
    if (index < 0 || index >= this.items.length) {
        throw new Error("Index out of bounds: " + index);
    }
    this.items.splice(index, 1);
};

/**
 * Returns the size of the list.
 * 
 * @return the size of the list
 * @type Number
 */
EchoCore.Collections.List.prototype.size = function(index) {
    return this.items.length;
};

/**
 * Returns a string representation.
 * The items will be comma-delimited.
 *
 * @return a string representation
 * @type String
 */
EchoCore.Collections.List.prototype.toString = function() {
    return this.items.toString();
};

/**
 * Creates a new Map.
 * 
 * @class Collection map implementation.
 *        Implmentation is based on an associative array.
 *        Array is periodically recreated after a significant number of
 *        element removals to eliminate side effects from memory management 
 *        flaws with Internet Explorer.
 *        Null values are not permitted as keys.  Setting a key to a null value
 *        will result in the key being removed.
 */
EchoCore.Collections.Map = function() {
 
    /**
     * Number of removes since last associative array re-creation.
     * @type Number
     * @private
     */
    this._removeCount = 0;
    
    /**
     * Number (integer) of removes between associative array re-creation.
     * @type Number
     */
    this.garbageCollectionInterval = 250;
    
    /**
     * Associative mapping.
     */
    this.associations = new Object();
};

/**
 * Retrieves the value referenced by the spcefied key.
 *
 * @param key the key
 * @return the value, or null if no value is referenced
 */
EchoCore.Collections.Map.prototype.get = function(key) {
    return this.associations[key];
};

/**
 * Stores a value referenced by the specified key.
 *
 * @param key the key
 * @param value the value
 */
EchoCore.Collections.Map.prototype.put = function(key, value) {
    if (value === null) {
        this.remove(key);
        return;
    }
    this.associations[key] = value;
};

/**
 * Performs 'garbage-collection' operations, recreating the array.
 * This operation is necessary due to Internet Explorer memory leak
 * issues.
 */
EchoCore.Collections.Map.prototype._garbageCollect = function() {
    this._removeCount = 0;
    var newAssociations = new Object();
    var i = 0;
    for (var key in this.associations) {
        newAssociations[key] = this.associations[key];
        ++i;
    }
    this.associations = newAssociations;
};

/**
 * Removes the value referenced by the specified key.
 *
 * @param key the key
 */
EchoCore.Collections.Map.prototype.remove = function(key) {
    delete this.associations[key];
    ++this._removeCount;
    if (this._removeCount >= this.garbageCollectionInterval) {
        this._garbageCollect();
    }
};

/**
 * Determines the size of the map.
 * 
 * @return the size of the map
 * @type Number
 */
EchoCore.Collections.Map.prototype.size = function() {
    var size = 0;
    for (var x in this.associations) {
        ++size;
    }
    return size;
};

/**
 * Returns a string representation.
 * The items will be comma-delimited,
 * in the form "key=value".
 *
 * @return a string representation
 * @type String
 */
EchoCore.Collections.Map.prototype.toString = function() {
    var outArray = new Array();
    for (var x in this.associations) {
        outArray.push(x + "=" + this.associations[x]);
    }
    return outArray.toString();
};

/**
 * Creates a new Set.
 * 
 * @constructor
 * @class Collection set implementation.
 */
EchoCore.Collections.Set = function() { 

    /**
     * An array containing all items in the set.
     * This array may be iterated by an object, but should not be modified.
     * @type Array
     */
    this.items = new Array();
};

/**
 * Adds an item to the set (if the item is not currently present in the set).
 *
 * Note on equality: This method will evaluate equality by
 * invoking .equals() on the specified item if it provides such a method.
 * If a .equals() implementation is not provided, equality will be determined
 * based on the double-equal operator (==).
 * 
 * @param item the item to add
 */
EchoCore.Collections.Set.prototype.add = function(item) {
    for (var i = 0; i < this.items.length; ++i) {
        if ((item.equals && item.equals(this.items[i])) || item == this.items[i]) {
            return;
        }
    }
	this.items.push(item);
};

/**
 * Determines if the set contains the specified item.
 *
 * Note on equality: This method will evaluate equality by
 * invoking .equals() on the specified item if it provides such a method.
 * If a .equals() implementation is not provided, equality will be determined
 * based on the double-equal operator (==).
 * 
 * @param item the item to test
 * @return true if the item is contained in the set
 * @type Boolean
 */
EchoCore.Collections.Set.prototype.contains = function(item) {
    for (var i = 0; i < this.items.length; ++i) {
        if ((item.equals && item.equals(this.items[i])) || item == this.items[i]) {
            return true;
        }
    }
    return false;
};

/**
 * Removes an item from the set.
 *
 * Note on equality: This method will evaluate equality by
 * invoking .equals() on the specified item if it provides such a method.
 * If a .equals() implementation is not provided, equality will be determined
 * based on the double-equal operator (==).
 * 
 * @param item the item to remove
 */
EchoCore.Collections.Set.prototype.remove = function(item) {
    for (var i = 0; i < this.items.length; ++i) {
        if ((item.equals && item.equals(this.items[i])) || item == this.items[i]) {
			this.items.splice(i, 1);
        }
    }
};

/**
 * Returns the number of items in the set.
 * 
 * @return the number of items in the set
 * @type Number
 */
EchoCore.Collections.Set.prototype.size = function(index) {
    return this.items.length;
};

/**
 * Returns a string representation.
 * The items will be comma-delimited.
 *
 * @return a string representation
 * @type String
 */
EchoCore.Collections.Set.prototype.toString = function() {
    return this.items.toString();
};

/** 
 * EchoCore.Debug Namespace.
 * Non-instantiable object.
 */
EchoCore.Debug = function() { };

/**
 * Flag indicating whether console output should be displayed as alerts.
 * Enabling is generally not recommended.
 * @type Boolean
 */
EchoCore.Debug.alert = false;

/**
 * The DOM element to which console output should be written.
 * @type HTMLElement
 */
EchoCore.Debug.consoleElement = null;

/**
 * Writes a message to the debug console.
 * 
 * @param {String} text the message
 */
EchoCore.Debug.consoleWrite = function(text) {
    if (EchoCore.Debug.consoleElement) {
        var entryElement = document.createElement("div");
        entryElement.appendChild(document.createTextNode(text));
        if (EchoCore.Debug.consoleElement.childNodes.length == 0) {
            EchoCore.Debug.consoleElement.appendChild(entryElement);
        } else {
            EchoCore.Debug.consoleElement.insertBefore(entryElement, EchoCore.Debug.consoleElement.firstChild);
        }
    } else if (EchoCore.Debug.alert) {
        alert("DEBUG:" + text);
    }
};

/**
 * Creates a string representation of the state of an object's instance variables.
 *
 * @param object the object to convert to a string
 * @return the string
 * @type String
 */
EchoCore.Debug.toString = function(object) {
    var s = "";
    for (var x in object) {
        if (typeof object[x] != "function") { 
            s += x + ":" + object[x] + "\n";
        }
    }
    return s;
};

/**
 * Creates a new debug timer.
 * 
 * @constructor
 * @class Provides a tool for measuring performance of the Echo3 client engine.
 */
EchoCore.Debug.Timer = function() {
    this._times = new Array();
    this._labels = new Array();
    this._times.push(new Date().getTime());
    this._labels.push("Start");
};

/**
 * Marks the time required to complete a task.  This method should be invoked
 * when a task is completed with the 'label' specifying a description of the task.
 * 
 * @param {String} label a description of the completed task.
 */
EchoCore.Debug.Timer.prototype.mark = function(label) {
    this._times.push(new Date().getTime());
    this._labels.push(label);
};

/**
 * Returns a String representation of the timer results, showing how long
 * each task required to complete (and included a total time).
 * 
 * @return the timer results
 * @type String
 */
EchoCore.Debug.Timer.prototype.toString = function() {
    var out = "";
    for (var i = 1; i < this._times.length; ++i) {
        var time = this._times[i] - this._times[i - 1];
        out += this._labels[i] + ": " + time + "ms\n";
    }
    out += "TOTAL: " + (this._times[this._times.length - 1] - this._times[0]) + "ms";
    return out;
};

/**
 * Creates a new event object.
 * 
 * @constructor
 * @class Event object.
 * @param source the source of the event
 * @param {String} type the type of the event
 * @param data the optional data of the event
 */
EchoCore.Event = function(source, type, data) {
    
    /**
     * The source of the event.
     */
    this.source = source;
    
    /**
     * The event type.
     * @type String
     */
    this.type = type;
    
    /**
     * The event data.
     */
    this.data = data;
};

/**
 * Creates a new listener list.
 * 
 * @constructor
 * @class A collection of event listeners.  Provides capability to manage listeners
 *        of multiple types, and fire events to listeners based on type.
 */
EchoCore.ListenerList = function() {
    
    /**
     * Array containing event types and event listeners.  
     * Even indexes contain event types, and the subsequent odd
     * index contains a method or EchoCore.MethodRef instance.
     * @type Array
     */
    this._data = new Array();
};

/**
 * Adds an event listener.
 * 
 * @param {String} eventType the event type
 * @param eventTarget the event target (a function or EchoCore.MethodRef instance)
 */
EchoCore.ListenerList.prototype.addListener = function(eventType, eventTarget) {
    this._data.push(eventType, eventTarget);
};

/**
 * Fires an event.
 * 
 * @param {EchoCore.Event} event the event to fire
 * @return true if all event listeners returned values that evaluate to true, 
 *         or false if any event listeners returned values that evaluate to 
 *         false
 * @type Boolean
 */
EchoCore.ListenerList.prototype.fireEvent = function(event) {
    if (event.type == null) {
        throw new Error("Cannot fire event, type property not set.");
    }
    
    var listeners = new Array();
    for (var i = 0; i < this._data.length; i += 2) {
        if (this._data[i] == event.type) {
            listeners.push(this._data[i + 1]);
        }
    }
    
    var returnValue = true;
    for (var i = 0; i < listeners.length; ++i) {
        returnValue = (listeners[i] instanceof EchoCore.MethodRef ? listeners[i].invoke(event) : listeners[i](event)) 
                && returnValue; 
    }
    return returnValue;
};

/**
 * Returns an array containing the types of all listeners
 * in the list.
 * 
 * @return the event types
 * @type Array
 */
EchoCore.ListenerList.prototype.getListenerTypes = function() {
    var types = new Array();
    for (var i = 0; i < this._data.length; i += 2) {
        types.push(this._data[i]);
    }
    EchoCore.Arrays.removeDuplicates(types);
    return types;
};

/**
 * Returns an array of all listeners for a specific event type.
 * 
 * @param {String} eventType the event type
 * @return the listeners
 * @type Array
 */
EchoCore.ListenerList.prototype.getListeners = function(eventType) {
    var listeners = new Array();
    for (var i = 0; i < this._data.length; i += 2) {
        if (this._data[i] == eventType) {
            listeners.push(this._data[i + 1]);
        }
    }
    return listeners;
};

/**
 * Determines the number of listeners for a specific event type.
 * 
 * @param {String} eventType the event type
 * @return the listener count
 * @type Number
 */
EchoCore.ListenerList.prototype.getListenerCount = function(eventType) {
    var count = 0;
    for (var i = 0; i < this._data.length; i += 2) {
        if (this._data[i] == eventType) {
            ++count;
        }
    }
    return count;
};

EchoCore.ListenerList.prototype.hasListeners = function(eventType) {
    for (var i = 0; i < this._data.length; i += 2) {
        if (this._data[i] == eventType) {
            return true;
        }
    }
    return false;
};

/**
 * Determines if any number of listeners are registered to the list.
 * 
 * @return true if the listener list is empty
 * @type Boolean
 */
EchoCore.ListenerList.prototype.isEmpty = function() {
    return this._data.length == 0;
};

/**
 * Removes an event listener.
 * 
 * @param {String} eventType the event type
 * @param eventTarget the event target (a function or EchoCore.MethodRef instance)
 */
EchoCore.ListenerList.prototype.removeListener = function(eventType, eventTarget) {
    for (var i = 0; i < this._data.length; i += 2) {
        if (this._data[i] == eventType
                && (eventTarget == this._data[i + 1] || (eventTarget.equals && eventTarget.equals(this._data[i + 1])))) {
            var oldLength = this._data.length;
            this._data.splice(i, 2);
            return;
        }
    }
};

EchoCore.ListenerList.prototype.toString = function() {
    var out = "";
    for (var i = 0; i < this._data.length; i += 2) {
        if (i > 0) {
            out += ", ";
        }
        out += this._data[i] + ":" + this._data[i + 1];
    }
    return out;
};

/**
 * Creates a new MethodRef.
 *
 * @constructor
 * @class A representation of a method of a specific instance of a class.
 *        This object is often used for representing object-oriented event handlers,
 *        such that they may be invoked with the "this pointer" set to their
 *        containing object.
 * @param instance the object instance on which the method should be invoked
 * @param {Function} method the method to invoke
 */
EchoCore.MethodRef = function(instance, method) {
    this.instance = instance;
    this.method = method;
};

/**
 * .equals() implementation for use with collections.
 */
EchoCore.MethodRef.prototype.equals = function(that) {
    return this.instance == that.instance && this.method == that.method;
};

/**
 * Invokes the method on the instance.
 *
 * @param args a single argument or array of arguments to pass
 *        to the instance method
 * @return the value returned by the method
 */
EchoCore.MethodRef.prototype.invoke = function(args) {
    if (args instanceof Array) {
        return this.method.apply(this.instance, args);
    } else {
        return this.method.call(this.instance, args);
    }
};

/**
 * Scheduler namespace.  Non-instantiable object.
 * Provides capability to invoke code at regular intervals, after a delay, 
 * or after the current JavaScript execution context has completed.
 * Provides an object-oriented means of accomplishing this task.
 */
EchoCore.Scheduler = function() { };

/**
 * Interval at which the scheduler should wake to check for queued tasks.
 * @type Number
 */
EchoCore.Scheduler.INTERVAL = 20;

/**
 * Collection of runnables to execute.
 * @private
 */
EchoCore.Scheduler._runnables = new Array();

/**
 * Executes the scheduler, running any runnables that are due.
 * This method is invoked by the interval/thread.
 */
EchoCore.Scheduler._execute = function() {
    var time = new Date().getTime();
    
    for (var i = 0; i < EchoCore.Scheduler._runnables.length; ++i) {
        var runnable = EchoCore.Scheduler._runnables[i];
        if (runnable._nextExecution < time) {
            try {
                runnable.run();
            } catch (ex) {
                EchoCore.Scheduler._stop();
                throw(ex);
            }
            if (runnable.timeInterval && runnable.repeat) {
                runnable._nextExecution = runnable.timeInterval + time;
            }
        }
    }

    if (EchoCore.Scheduler._runnables.length == 0) {
        EchoCore.Scheduler._stop();
    }
};

/**
 * Enqueues a Runnable to be executed by the scheduler.
 * 
 * @param {EchoCore.Scheduler.Runnable} the runnable to enqueue
 */
EchoCore.Scheduler.add = function(runnable) {
    var currentTime = new Date().getTime();
    EchoCore.Scheduler._runnables.push(runnable);
    runnable._nextExecution = runnable.timeInterval ? runnable.timeInterval + currentTime : currentTime;
    EchoCore.Scheduler._start();
};

/**
 * Starts the scheduler "thread".
 * If the scheduler is already running, no action is taken.
 * @private
 */
EchoCore.Scheduler._start = function() {
    if (EchoCore.Scheduler._interval != null) {
        return;
    }
    EchoCore.Scheduler._interval = window.setInterval("EchoCore.Scheduler._execute();", EchoCore.Scheduler.INTERVAL);    
};

/**
 * Stops the scheduler "thread".
 * If the scheduler is not running, no action is taken.
 * @private
 */
EchoCore.Scheduler._stop = function() {
    if (EchoCore.Scheduler._interval == null) {
        return;
    }
    window.clearInterval(EchoCore.Scheduler._interval);
    EchoCore.Scheduler._interval = null;
};

/**
 * Creates a new Runnable.
 *
 * @constructor
 * @class A runnable task that may be scheduled with the Scheduler.
 * @param {Number} time the time interval, in milleseconds, after which the Runnable should be executed
 *        (may be null/undefined to execute task immediately, in such cases repeat must be false)
 * @param {Boolean} repeat a flag indicating whether the task should be repeated
 */
EchoCore.Scheduler.Runnable = function(timeInterval, repeat) {
    if (timeInterval && !repeat) {
        throw new Error("Cannot creating repeating runnable without time delay");
    }
    
    /** 
     * Time interval, in milleseconds after which the Runnable should be executed.
     * @type Number
     */
    this.timeInterval = timeInterval;
    
    /**
     * Flag indicating whether task should be repeated.
     * @type Boolean
     */
    this.repeat = repeat;
};

/**
 * Default run() implemenation.  Should be overidden by subclasses.
 */
EchoCore.Scheduler.Runnable.prototype.run = function() { };
