/**
 * @fileoverview
 * Provides low-level core functionality.  Non-instantiable object.  Requires nothing.
 * <p>
 * Provides core APIs for creating object-oriented and event-driven JavaScript code:
 * <ul>
 *  <li>Provides "Method Reference" object to describe reference to a member function
 *    of a specific object instance (enabling invocation with "this pointer" set 
 *    appropriately.</li>
 *  <li>Provides event/listener management framework.  Event listeners may be 
 *    "Method Reference" objects, thus allowing specific class instances to process events.</li>
 *  <li>Does not provide any web-specific functionality.</li>
 *  <li>Provides string tokenization capability.</li>
 * </ul>
 */

/**
 * Namespace for core functionality.
 */
Core = {

    /**
     * Creates a new class, optionally extending an existing class.
     * This method may be called with one or two parameters as follows:
     * <p>
     * Core.extend(definition)
     * Core.extend(base, definition)
     * <p>
     * 
     * @param {Function} base the base class
     * @param {Object} definition an associative array containing methods and properties of the class
     */
    extend: function() {
        // Configure base/definition arguments
        var base = arguments.length == 1 ? null : arguments[0];
        var definition = arguments.length == 1 ? arguments[0] : arguments[1];
        
        // Create new object function which will invoke '$construct' pseudo-constructor method of object.
        var objectFunction;
        
        if (definition && definition.$abstract) {
            objectFunction = function() {
                if (!Core._extending) {
                    throw new Error("Cannot instantiate abstract class.");
                }
            }
        } else {
            objectFunction = function() {
    
                if (!Core._extending) {
                    // Only invoke $construct() (constructor replacement method)
                    // when Core._extending flag is not set.  Core._extending flag
                    // will be set temporarily any time an object prototype is being created.
                    this.$construct.apply(this, arguments);
                }
            }
        }
        
        // Create object prototype.
        if (typeof(base) == "function") {
            // Set "extending" flag so $construct() method will not be invoked.
            Core._extending = true;
            
            // Create prototype instance.
            objectFunction.prototype = new base();
            
            // Clear "extending" flag.
            delete Core._extending;
            
            // Assign constructor correctly.
            objectFunction.prototype.constructor = objectFunction;
            
            // Store base class.
            objectFunction.base = base;
        }
        
        // Process static properties and methods defined in the '$static' object.
        if (definition && definition.$static) {
            Core.inherit(objectFunction, definition.$static);

            // Clean up:
            delete definition.$static;
        }
        
        // Invoke static constructors.
        if (definition && definition.$load) {
            // Invoke $load() function with this pointer set to class.
            definition.$load.call(objectFunction);

            // Clean up:
            delete definition.$load;
        }
        
        // Add Mixins.
        if (definition && definition.$include) {
            var mixins = definition.$include.reverse();
            Core.mixin(objectFunction, mixins);
            
            // Clean up:
            delete definition.$include;
        }
        
        // Add Abstract Methods.
        if (definition && definition.$abstract) {
            // Note that 'objectFunction.$abstract' now evaluates as true,
            // indicating the object is abstract.
            objectFunction.$abstract = definition.$abstract;

            // Clean up:
            delete definition.$abstract;
        }
        
        // Add toString method (toString method should be defined as $toString to avoid
        // it being removed by the MSIE scripting engine.
        if (definition && definition.$toString) {
            objectFunction.prototype.toString = definition.$toString;
            delete definition.$toString;
        }

        // Add valueOf method (valueOf method should be defined as $valueOf to avoid
        // it being removed by the MSIE scripting engine.
        if (definition && definition.$valueOf) {
            objectFunction.prototype.valueOf = definition.$valueOf;
            delete definition.$valueOf;
        }
        
        // Process instance properties and methods.
        if (definition) {
            Core.inherit(objectFunction.prototype, definition);
        }
        
        // If class is concrete, verify all abstract methods are provided.
        if (!objectFunction.$abstract) {
            this._verifyAbstractImpl(objectFunction);
        }
        
        return objectFunction;
    },
    
    mixin: function(destination, mixins) {
        for (var i = 0; i < mixins.length; ++i) {
            for (var mixinProperty in mixins[i]) {
                if (destination.prototype[mixinProperty]) {
                    // Ignore mixin properties that already exist.
                    continue;
                }
                destination.prototype[mixinProperty] = mixins[i][mixinProperty];
            }
        }
    },
    
    inherit: function(destination, source) {
        for (var name in source) {
            // Verify that inherited item does not exist in destination if it begins with
            // an underscore ("_"), which is used to indicate an internal variable name.
            if (name.charAt(0) == "_" && destination[name]) {
                throw new Error("Interval variable \"" + name + "\" already exists in destination object.");
            }
            destination[name] = source[name];
        }
    },
    
    _verifyAbstractImpl: function(objectFunction, constructor) {
        if (!constructor) {
            if (objectFunction.base) {
                constructor = objectFunction.base;
            } else {
                return;
            }
        }

        if (constructor.$abstract && constructor.$abstract instanceof Object) {
            for (var name in constructor.$abstract) {
                if (!objectFunction.prototype[name]) {
                    throw new Error("Cannot build concrete implementation due to missing abstract method: " + name); 
                }
            }
        }
        
        if (constructor.base && constructor.base.$abstract) {
            Core._verifyAbstractImpl(objectFunction, constructor.base);
        }
    }
};

/** 
 * @class 
 * Namespace for debugging related utilities.
 */
Core.Debug = { 

    /**
     * The DOM element to which console output should be written.
     * @type HTMLElement
     */
    consoleElement: null,
    
    /**
    * Flag indicating whether console output should be displayed as alerts.
    * Enabling is generally not recommended.
    * @type Boolean
    */
    useAlertDialog: false,
    
    /**
     * Writes a message to the debug console.
     * 
     * @param {String} text the message
     */
    consoleWrite: function(text) {
        if (Core.Debug.consoleElement) {
            var entryElement = document.createElement("div");
            entryElement.appendChild(document.createTextNode(text));
            if (Core.Debug.consoleElement.childNodes.length == 0) {
                Core.Debug.consoleElement.appendChild(entryElement);
            } else {
                Core.Debug.consoleElement.insertBefore(entryElement, Core.Debug.consoleElement.firstChild);
            }
        } else if (Core.Debug.useAlertDialog) {
            alert("DEBUG:" + text);
        }
    },
    
    /**
     * Creates a string representation of the state of an object's instance variables.
     *
     * @param object the object to convert to a string
     * @return the string
     * @type String
     */
    toString: function(object) {
        var s = "";
        for (var x in object) {
            if (typeof object[x] != "function") { 
                s += x + ":" + object[x] + "\n";
            }
        }
        return s;
    }
};

/**
 * @class Provides a tool for measuring performance of the Echo3 client engine.
 */
Core.Debug.Timer = Core.extend({
    
    /**
     * Creates a new debug timer.
     * 
     * @constructor
     */
    $construct: function() {
        this._times = [];
        this._labels = [];
        this._times.push(new Date().getTime());
        this._labels.push("Start");
    },
    
    /**
     * Marks the time required to complete a task.  This method should be invoked
     * when a task is completed with the 'label' specifying a description of the task.
     * 
     * @param {String} label a description of the completed task.
     */
    mark: function(label) {
        this._times.push(new Date().getTime());
        this._labels.push(label);
    },
    
    /**
     * Returns a String representation of the timer results, showing how long
     * each task required to complete (and included a total time).
     * 
     * @return the timer results
     * @type String
     */
    $toString: function() {
        var out = "";
        for (var i = 1; i < this._times.length; ++i) {
            var time = this._times[i] - this._times[i - 1];
            out += this._labels[i] + ":" + time + " ";
        }
        out += "TOT:" + (this._times[this._times.length - 1] - this._times[0]) + "ms";
        return out;
    }
});

/**
 * @class 
 * Arrays namespace.  
 * Non-instantiable object.
 */
Core.Arrays = {

    /**
     * Returns <tt>true</tt> if the first array contains all of the elements
     * in the second array.
     *
     * @param {Array} array1 array to be checked for containment
     * @param {Array} array2 array to be checked for containment in the first array
     * @param {Boolean} optional flag indicating that all elements in array2 are unique
     * @return <tt>true</tt> if the first array contains all of the elements
     *         in the second array
     * @type Boolean
     */
    containsAll: function(array1, array2, unique) {
        if (unique && array1.length < array2.length) {
            return false;
        }
        if (array2.length == 0) {
            return true;
        }
        var found, item;
        for (var i = 0; i < array2.length; ++i) {
            found = false;
            item = array2[i];
            for (var j = 0; j < array1.length; ++j) {
                if (item == array1[j]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }
        return true;
    },

    /**
     * Returns the index of the specified item within the array, or -1 if it 
     * is not contained in the array.  
     * 
     * Note on equality: This method will evaluate equality by
     * invoking .equals() on the specified item if it provides such a method.
     * If a .equals() implementation is not provided, equality will be determined
     * based on the double-equal operator (==).
     * 
     * @param item the item
     * @return the index of the item, or -1 if it is not present in the array
     * @type Number
     */
    indexOf: function(array, item) {
        for (var i = 0; i < array.length; ++i) {
            if ((item.equals && item.equals(array[i])) || item == array[i]) {
                return i;
            }
        }
        return -1;
    },
    
    /**
     * Removes the first instance of the specified item from an array.
     * If the item does not exist in the array, no action is taken.
     * Equality is determined using the '==' operator.
     * 
     * @param array the array from which the item should be removed
     * @param item the item to remove
     */
    remove: function(array, item) {
        for (var i = 0; i < array.length; ++i) {
            if (item == array[i]) {
                array.splice(i, 1);
                return;
            }
        }
    },
    
    /**
     * Removes the first instance of the specified item from an array.
     * If the item does not exist in the array, no action is taken.
     * Equality is determined using the equals() method if the item
     * defines it, or '==' if it does not.
     * 
     * @param array the array from which the item should be removed
     * @param item the item to remove
     */
    removeEqual: function(array, item) {
        for (var i = 0; i < array.length; ++i) {
            if ((item.equals && item.equals(array[i])) || item == array[i]) {
                array.splice(i, 1);
                return;
            }
        }
    },
    
    /**
     * Removes duplicate items from an array.
     * Items retained in the array may not appear in the previous order.
     * 
     * @param array the array from which duplicates are to be removed.
     */
    removeDuplicates: function(array) {
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
    }
};

/**
 * @class Associative array wrapper which periodically recreates the associative array
 *        in order to avoid memory leakage and performance problems on certain browser
 *        platforms, i.e., Internet Explorer 6.
 *        Null values are not permitted as keys.  Setting a key to a null value
 *        will result in the key being removed.
 */
Core.Arrays.LargeMap = Core.extend({
    
    $static: {
    
        garbageCollectEnabled: false
    },
    
    /**
     * Creates a new LargeMap.
     */
    $construct: function() {
        
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
        this.map = {};
    },
    
    /**
     * Performs 'garbage-collection' operations, recreating the array.
     * This operation is necessary due to Internet Explorer memory leak
     * issues.
     */
    _garbageCollect: function() {
        this._removeCount = 0;
        var newMap = {};
        for (var key in this.map) {
            newMap[key] = this.map[key];
        }
        this.map = newMap;
    },
    
    /**
     * Removes the value referenced by the specified key.
     *
     * @param key the key
     */
    remove: function(key) {
        delete this.map[key];
        if (Core.Arrays.LargeMap.garbageCollectEnabled) {
            ++this._removeCount;
            if (this._removeCount >= this.garbageCollectionInterval) {
                this._garbageCollect();
            }
        }
    }
});

/**
 * @class Event object.
 */
Core.Event = Core.extend({
    
    /**
     * Creates a new event object.
     * 
     * @constructor
     * @param {String} type the type of the event
     * @param source the source of the event
     * @param data the optional data of the event
     */
    $construct: function(type, source, data) {
        
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
    } 
});

/**
 * @class A collection of event listeners.  Provides capability to manage listeners
 *        of multiple types, and fire events to listeners based on type.
 */
Core.ListenerList = Core.extend({
   
    /**
     * Creates a new listener list.
     * 
     * @constructor
     */
    $construct: function() {
        
        /**
         * Array containing event types and event listeners.  
         * Even indexes contain event types, and the subsequent odd
         * index contains a method or Core.MethodRef instance.
         * @type Array
         */
        this._data = [];
    },

    /**
     * Adds an event listener.
     * 
     * @param {String} eventType the event type
     * @param eventTarget the event target (a function or Core.MethodRef instance)
     */
    addListener: function(eventType, eventTarget) {
        this._data.push(eventType, eventTarget);
    },
    
    /**
     * Fires an event.
     * 
     * @param {Core.Event} event the event to fire
     * @return true if all event listeners returned values that evaluate to true, 
     *         or false if any event listeners returned values that evaluate to 
     *         false
     * @type Boolean
     */
    fireEvent: function(event) {
        if (event.type == null) {
            throw new Error("Cannot fire event, type property not set.");
        }
        
        var listeners = [];
        for (var i = 0; i < this._data.length; i += 2) {
            if (this._data[i] == event.type) {
                listeners.push(this._data[i + 1]);
            }
        }
        
        var returnValue = true;
        for (var i = 0; i < listeners.length; ++i) {
            returnValue = (listeners[i] instanceof Core.MethodRef ? listeners[i].invoke(event) : listeners[i](event)) 
                    && returnValue; 
        }
        return returnValue;
    },
    
    /**
     * Returns an array containing the types of all listeners
     * in the list.
     * 
     * @return the event types
     * @type Array
     */
    getListenerTypes: function() {
        var types = [];
        for (var i = 0; i < this._data.length; i += 2) {
            types.push(this._data[i]);
        }
        Core.Arrays.removeDuplicates(types);
        return types;
    },
    
    /**
     * Returns an array of all listeners for a specific event type.
     * 
     * @param {String} eventType the event type
     * @return the listeners
     * @type Array
     */
    getListeners: function(eventType) {
        var listeners = [];
        for (var i = 0; i < this._data.length; i += 2) {
            if (this._data[i] == eventType) {
                listeners.push(this._data[i + 1]);
            }
        }
        return listeners;
    },
    
    /**
     * Determines the number of listeners for a specific event type.
     * 
     * @param {String} eventType the event type
     * @return the listener count
     * @type Number
     */
    getListenerCount: function(eventType) {
        var count = 0;
        for (var i = 0; i < this._data.length; i += 2) {
            if (this._data[i] == eventType) {
                ++count;
            }
        }
        return count;
    },
    
    /**
     * Determines if the listeners list has any listeners of a specific type.
     * 
     * @param {String} eventType the event type
     * @return true if any listeners exist
     * @type Boolean
     */
    hasListeners: function(eventType) {
        for (var i = 0; i < this._data.length; i += 2) {
            if (this._data[i] == eventType) {
                return true;
            }
        }
        return false;
    },
    
    /**
     * Determines if any number of listeners are registered to the list.
     * 
     * @return true if the listener list is empty
     * @type Boolean
     */
    isEmpty: function() {
        return this._data.length == 0;
    },
    
    /**
     * Removes an event listener.
     * 
     * @param {String} eventType the event type
     * @param eventTarget the event target (a function or Core.MethodRef instance)
     */
    removeListener: function(eventType, eventTarget) {
        for (var i = 0; i < this._data.length; i += 2) {
            if (this._data[i] == eventType
                    && (eventTarget == this._data[i + 1] || (eventTarget.equals && eventTarget.equals(this._data[i + 1])))) {
                var oldLength = this._data.length;
                this._data.splice(i, 2);
                return;
            }
        }
    },
    
    /**
     * Creates a string representation of the listener list.
     * This should be used for debugging purposes only.
     */
    toString: function() {
        var out = "";
        for (var i = 0; i < this._data.length; i += 2) {
            if (i > 0) {
                out += ", ";
            }
            out += this._data[i] + ":" + this._data[i + 1];
        }
        return out;
    }
});

/**
 * @class 
 * A representation of a method of a specific instance of a class.
 * This object is often used for representing object-oriented event handlers,
 * such that they may be invoked with the "this pointer" set to their
 * containing object.
 */
Core.MethodRef = Core.extend({
    
    /**
     * Creates a new MethodRef.
     *
     * @constructor
     * @param instance the object instance on which the method should be invoked
     * @param {Function} method the method to invoke
     */
    $construct: function(instance, method) {
        this.instance = instance;
        this.method = method;
        if (arguments.length > 2) {
            this.arguments = [];
            for (var i = 2; i < arguments.length; ++i) {
                this.arguments.push(arguments[i]);
            }
        }
    },

    /**
     * .equals() implementation for use with collections.
     */
    equals: function(that) {
        return this.instance == that.instance && this.method == that.method;
    },
    
    /**
     * Invokes the method on the instance.
     *
     * @param args a single argument or array of arguments to pass
     *        to the instance method
     * @return the value returned by the method
     */
    invoke: function(args) {
        if (args) {
            if (args instanceof Array) {
                return this.method.apply(this.instance, args);
            } else {
                return this.method.call(this.instance, args);
            }
        } else {
            if (this.arguments) {
                return this.method.apply(this.instance, this.arguments);
            } else {
                return this.method.call(this.instance);
            }
        }
    }
});

/**
 * @class A localized resource bundle instance.
 */
Core.ResourceBundle = Core.extend({
    
    /**
     * Creates a Resourcebundle
     * 
     * @param map initial mappings
     */
    $construct: function(map) {
        this.map = map ? map : {};
        this.parent = null;
    },
    
    /**
     * Retrieves a value.
     * 
     * @param key the key
     * @return the value
     */
    get: function(key) {
        var value = this.map[key];
        if (value == null && this.parent != null) {
            return this.parent.get(key);
        } else {
            return value;
        }
    }
});


/**
 * Scheduler namespace.  Non-instantiable object.
 * Provides capability to invoke code at regular intervals, after a delay, 
 * or after the current JavaScript execution context has completed.
 * Provides an object-oriented means of accomplishing this task.
 */
Core.Scheduler = {

    /**
     * Interval at which the scheduler should wake to check for queued tasks.
     * @type Number
     */
    INTERVAL: 20,
    
    /**
     * Collection of runnables to execute.
     * @private
     */
    _runnables: [],
    
    /**
     * Executes the scheduler, running any runnables that are due.
     * This method is invoked by the interval/thread.
     */
    _execute: function() {
        var time = new Date().getTime();
        
        for (var i = 0; i < Core.Scheduler._runnables.length; ++i) {
            var runnable = Core.Scheduler._runnables[i];
            if (!runnable._nextExecution) {
            	continue;
            }
            if (runnable._nextExecution < time) {
                try {
                    runnable.run();
                } catch (ex) {
                    runnable._nextExecution = null;
                    throw(ex);
                }
                if (!runnable._nextExecution) {
                	continue;
                }
                if (runnable.timeInterval && runnable.repeat) {
                    runnable._nextExecution = runnable.timeInterval + time;
                } else {
                    runnable._nextExecution = null;
                }
            }
        }
    
    	var newRunnables = [];
        for (var i = 0; i < Core.Scheduler._runnables.length; ++i) {
            var runnable = Core.Scheduler._runnables[i];
            if (runnable._nextExecution) {
            	newRunnables.push(runnable);
            }
        }
    	Core.Scheduler._runnables = newRunnables;
    	
        if (Core.Scheduler._runnables.length == 0) {
            Core.Scheduler._stop();
        }
    },
    
    /**
     * Enqueues a Runnable to be executed by the scheduler.
     * 
     * @param {Core.Scheduler.Runnable} the runnable to enqueue
     */
    add: function(runnable) {
        var currentTime = new Date().getTime();
        runnable._nextExecution = runnable.timeInterval ? runnable.timeInterval + currentTime : currentTime;
        Core.Scheduler._runnables.push(runnable);
        Core.Scheduler._start();
    },
    
    /**
     * Dequeues a Runnable so it will no longer be executed by the scheduler.
     * 
     * @param {Core.Scheduler.Runnable} the runnable to dequeue
     */
    remove: function(runnable) {
        runnable._nextExecution = null;
    },
    
    /**
     * Creates a new Runnable that executes the specified method and enqueues it into the scheduler.
     * 
     * @param {Number} time the time interval, in milleseconds, after which the Runnable should be executed
     *        (may be null/undefined to execute task immediately, in such cases repeat must be false)
     * @param {Boolean} repeat a flag indicating whether the task should be repeated
     * @param methodRef a method or Core.MethodRef instance to invoke, may be null/undefined
     * @return the created Runnable.
     * @type Core.Scheduler.Runnable 
     */
    run: function(methodRef, timeInterval, repeat) {
        var runnable = new Core.Scheduler.Runnable(methodRef, timeInterval, repeat);
        this.add(runnable);
        return runnable;
    },
    
    /**
     * Starts the scheduler "thread".
     * If the scheduler is already running, no action is taken.
     * @private
     */
    _start: function() {
        if (Core.Scheduler._interval != null) {
            return;
        }
        Core.Scheduler._interval = window.setInterval(Core.Scheduler._execute, Core.Scheduler.INTERVAL);
    },
    
    /**
     * Stops the scheduler "thread".
     * If the scheduler is not running, no action is taken.
     * @private
     */
    _stop: function() {
        if (Core.Scheduler._interval == null) {
            return;
        }
        window.clearInterval(Core.Scheduler._interval);
        Core.Scheduler._interval = null;
    }
};

/**
 * @class A runnable task that may be scheduled with the Scheduler.
 */
Core.Scheduler.Runnable = Core.extend({

    /**
     * Creates a new Runnable.
     *
     * @constructor
     * @param {Number} time the time interval, in milleseconds, after which the Runnable should be executed
     *        (may be null/undefined to execute task immediately, in such cases repeat must be false)
     * @param {Boolean} repeat a flag indicating whether the task should be repeated
     * @param methodRef a method or Core.MethodRef instance to invoke, may be null/undefined
     */
    $construct: function(methodRef, timeInterval, repeat) {
        if (!timeInterval && repeat) {
            throw new Error("Cannot create repeating runnable without time delay:" + methodRef);
        }
        
        this.methodRef = methodRef;
        
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
    },

    /**
     * Default run() implementation. Should be overidden by subclasses.
     */
    run: function() {
        if (this.methodRef) {
            this.methodRef.invoke();
        }
    }
});
