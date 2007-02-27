/**
 * Core namespace.  Non-instantiable object.
 * REQUIRES: Nothing.
 *
 * Provides core APIs for creating object-oriented and event-driven JavaScript code:
 * - Provides "Method Reference" object to describe reference to a member function
 *   of a specific object instance (enabling invocation with "this pointer" set 
     appropriately.
 * - Provides event/listener management framework.  Event listeners may be 
 *   "Method Reference" objects, thus allowing specific class instances to process events.
 * - Provides basic List/Set/Map collections framework.
 * - Does not provide any web-specific functionality.
 * - Provides string tokenization capability.
 */
EchoCore = function() { };

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

/**
 * EchoCore.Collections Namespace.  Non-instantiable object.
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
 * Do not instantiate.
 */
EchoCore.Debug = function() { };

/**
 * Flag indicating whether console output should be displayed as alerts.
 * Enabling is generally not recommended.
 */
EchoCore.Debug.alert = null;

/**
 * The DOM element to which console output should be written.
 */
EchoCore.Debug.consoleElement = null;

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

EchoCore.Event = function(source, type) {
    this.source = source;
    this.type = type;
};

EchoCore.ListenerList = function() {
    this._listenerMap = null;
};

EchoCore.ListenerList.prototype.addListener = function(eventType, eventTarget) {
    if (this._listenerMap == null) {
        this._listenerMap = new EchoCore.Collections.Map();
    }
    var listeners = this._listenerMap.get(eventType);
    if (listeners == null) {
        listeners = new EchoCore.Collections.Set();
        this._listenerMap.put(eventType, listeners);
    }
    listeners.add(eventTarget);
};

/**
 * Fires an event.
 * 
 * @param eventType the type of listener to invoke
 * @param event the event to fire
 * @return true if all event listeners returned values that evaluate to true, 
 *         or false if any event listeners returned values that evaluate to 
 *         false.
 */
EchoCore.ListenerList.prototype.fireEvent = function(event) {
    if (event.type == null) {
        throw new Error("Cannot fire event, type property not set.");
    }
    if (this._listenerMap == null) {
        return true;
    }
    var listeners = this._listenerMap.get(event.type);
    if (listeners == null) {
        return true;
    }
    var returnValue = true;
    for (var i = 0; i < listeners.items.length; ++i) {
        var target = listeners.items[i];
        if (target instanceof EchoCore.MethodRef) {
            if (!target.invoke(event)) {
                returnValue = false;
            }
        } else {
            if (!target(event)) {
                returnValue = false;
            }
        }
    }
    return returnValue;
};

EchoCore.ListenerList.prototype.getListenerTypes = function() {
    var types = new Array();
    if (this._listenerMap != null) {
        for (var key in this._listenerMap.associations) {
            types.push(key);
        }
    }
    return types;
};

EchoCore.ListenerList.prototype.getListeners = function(eventType) {
    if (this._listenerMap == null) {
        return new Array();
    } else {
        var listeners = this._listenerMap.get(eventType);
        return listeners.items;
    }
};

EchoCore.ListenerList.prototype.getListenerCount = function(eventType) {
    if (this._listenerMap == null) {
        return 0;
    }
    var listeners = this._listenerMap.get(eventType);
    if (listeners == null) {
        return 0;
    }
    return listeners.size();
};

EchoCore.ListenerList.prototype.isEmpty = function() {
    for (var i in this._listenerMap.associations) {
        return false;
    }
    return true;
};

EchoCore.ListenerList.prototype.removeListener = function(eventType, eventTarget) {
    if (this._listenerMap == null) {
        return;
    }
    var listeners = this._listenerMap.get(eventType);
    if (listeners == null) {
        return;
    }
    listeners.remove(eventTarget);
    if (listeners.size() == 0) {
        this._listenerMap.remove(eventType);
    }
};

/**
 * A representation of a method of a specific instance of a class.
 * This object is often used for repsenting object-oriented event handlers.
 *
 * Creates a new MethodRef.
 *
 * @constructor
 * @param instance the object instance on which the method should be invoked
 * @param {function} method the method to invoke
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

EchoCore.Scheduler = function() { };

EchoCore.Scheduler.INTERVAL = 20;

EchoCore.Scheduler._runnables = new Array();

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

EchoCore.Scheduler.add = function(runnable) {
    var currentTime = new Date().getTime();
    EchoCore.Scheduler._runnables.push(runnable);
    runnable._nextExecution = runnable.timeInterval ? runnable.timeInterval + currentTime : currentTime;
    EchoCore.Scheduler._start();
};

EchoCore.Scheduler._start = function() {
    if (EchoCore.Scheduler._interval != null) {
        return;
    }
    EchoCore.Scheduler._interval = window.setInterval("EchoCore.Scheduler._execute();", EchoCore.Scheduler.INTERVAL);    
};

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
 * @param time the time interval, in milleseconds, after which the Runnable should be executed
 *        (may be null/undefined to execute task immediately, in such cases repeat must be false)
 * @param repeat a boolean flag indicating whether the task should be repeated
 */
EchoCore.Scheduler.Runnable = function(timeInterval, repeat) {
    if (timeInterval && !repeat) {
        throw new Error("Cannot creating repeating runnable without time delay");
    }
    this.timeInterval = timeInterval;
    this.repeat = repeat;
};

EchoCore.Scheduler.Runnable.prototype.run = function() { };
