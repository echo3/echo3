/**
 * @fileoverview
 * Provides low-level core functionality.  Non-instantiable object.  Requires nothing.
 * <p>
 * Provides core APIs for creating object-oriented and event-driven JavaScript code.  Features include:
 * <ul>
 *  <li>Provides API for declaring JavaScript classes which includes support for
 *   specifying abstract and virtual properties and validating subtypes to such
 *   specification.</li>
 *  <li>Provides "Method Reference" object to describe reference to a member function
 *    of a specific object instance (enabling invocation with "this pointer" set 
 *    appropriately.</li>
 *  <li>Provides event/listener management framework.  Event listeners may be 
 *    "Method Reference" objects, thus allowing specific class instances to process events.</li>
 *  <li>Does not provide any web-specific functionality.</li>
 * </ul>
 */

/**
 * Namespace for core functionality.
 */
Core = {

    /**
     * Creates a duplicate copy of a function.
     * Per the ECMA-262 v3 specification, Function.toString() is required to return an (implementation specific)
     * string representation of the function.
     * Creating a copy of a constructor is more efficient than invoking Function.apply() in certain browsers
     * (a significant performance improvement was observed in Internet Explorer 6).
     *
     * @param f the function
     * @return an identical copy
     * @private
     */
    _copyFunction: function(f) {
        var fCopy;
        eval("fCopy = " + f.toString() + ";");
        return fCopy;
    },
    
    /**
     * Creates an empty function.
     *
     * @private
     */
    _createFunction: function() {
        return function() { };
    },
    
    /**
     * Creates a new class, optionally extending an existing class.
     * This method may be called with one or two parameters as follows:
     * <p>
     * Core.extend(definition)
     * Core.extend(baseClass, definition)
     * <p>
     * Each property of the definition object will be added to the prototype of the returned defined class.
     * Properties that begin with a dollar-sign ($) will be processed specially:
     * <p>
     * <ul>
     * <li>The $constructor property, which must be a function, will be used as the constructor.
     * The $load property, which must be a function, f provided, will be used as a static initializer,
     * executed once when the class is *defined*.  The this pointer will be set to the class when
     * this method is executed.</li>
     * <li>The $static property, an object, if provided, will have its properties installed as class variables.</li>
     * <li>The $abstract property, an object or 'true', if provided, will define methods that must be implemented
     * by derivative classes.  If the value is simply true, the object will be marked as abstract (such that
     * it does not necessarily need to provide implementations of abstract methods defined in its base class.</li>
     * <li>The $virtual property, an object, if provided, defines methods that will be placed into the prototype
     * that may be overridden by subclasses.  Attempting to override a property/method of the superclass that
     * is not defined in the virtual block will result in an exception.  Having the default behavior NOT allow
     * for overriding ensures that namespacing between super- and sub-types if all internal variables are instance
     * during Core.extend().</li>
     * </ul>
     * <p>
     * Use of this method enables a class to be derived WIHTOUT executing the constructor of the base class
     * in order to create a prototype for the derived class.  This method uses a "shared prototype" architecture,
     * where two objects are created, a "prototype class" and a "constructor class".  These two objects share
     * the same prototype, but the "prototype class" has an empty constructor.  When a class created with
     * this method is derived, the "prototype class" is used to create a prototype for the derivative.
     * <p>
     * This method will return the constructor class, which contains an internal reference to the 
     * prototype class that will be used if the returned class is later derived by this method.
     * 
     * @param {Function} baseClass the base class
     * @param {Object} definition an associative array containing methods and properties of the class
     * @return the constructor class
     */
    extend: function() {
        // Configure baseClass/definition arguments.
        var baseClass = arguments.length == 1 ? null : arguments[0];
        var definition = arguments.length == 1 ? arguments[0] : arguments[1];
        
        // Perform argument error checking.
        if (baseClass) {
            if (typeof(baseClass) != "function") {
                throw new Error("Base class is not a function, cannot derive.");
            }
            if (!baseClass.$_prototypeClass) {
                throw new Error("Base class not defined using Core.extend(), cannot derive.");
            }
        }
        if (!definition) {
            throw new Error("Object definition not provided.");
        }
        
        // Reference to shared prototype.
        var sharedPrototype;
        
        // Create the contructor-less prototype class.
        var prototypeClass = function() { };
        
        // Create the constructor class.
        var constructorClass;
        if (definition.$construct) {
            // Definition provides constructor, provided constructor function will be used as object.
            constructorClass = definition.$construct;
        } else {
            // Definition does not provide constructor.
            if (baseClass) {
                // Bas class available: copy constructor function from base class.
                constructorClass = Core._copyFunction(baseClass);
            } else {
                // No base class: constructor is an empty function.
                constructorClass = Core._createFunction();
            }
        }
        
        // Store reference to base class in constructor class.
        constructorClass.$super = baseClass;

        if (baseClass) {
            // Create shared prototype by instantiating the prototype class referenced by the base class.
            sharedPrototype = new baseClass.$_prototypeClass();
        
            // Assign shared prototype to prototype class.
            prototypeClass.prototype = sharedPrototype;
        } else {
            // If not deriving, simply set shared prototype to empty prototype of newly created prototypeClass.
            sharedPrototype = prototypeClass.prototype;
        }
        
        // Assign prototype of constructor class to shared prototype.
        constructorClass.prototype = sharedPrototype;

        // Assign constructor correctly.
        sharedPrototype.constructor = constructorClass;

        // Store reference to prototype class in object class.
        constructorClass.$_prototypeClass = prototypeClass;
        
        // Add abstract properties.
        if (definition.$abstract) {
            constructorClass.$abstract = {};
            if (baseClass && baseClass.$abstract) {
                // Copy abstract properties from base class.
                for (var x in baseClass.$abstract) {
                    constructorClass.$abstract[x] = baseClass.$abstract[x];
                }
            }

            if (definition.$abstract instanceof Object) {
                // Add abstract properties from definition.
                for (var x in definition.$abstract) {
                    constructorClass.$abstract[x] = true;
                }
            }
            
            // Remove property to avoid adding later when Core.inherit() is invoked.
            delete definition.$abstract;
        }
        
        // Pull up virtual properties from base class.
        if (baseClass) {
            // Copy virtual property flags for class properties from base class.
            this._inheritVirtualPropertyFlags(prototypeClass, baseClass);

            // Copy virtual property flags for instance properties from base class.
            this._inheritVirtualPropertyFlags(sharedPrototype, baseClass.prototype);
        }
        
        // Add virtual instance properties to prototype.
        if (definition.$virtual) {
            Core.inherit(sharedPrototype, definition.$virtual, true);

            // Remove property to avoid adding later when Core.inherit() is invoked.
            delete definition.$virtual;
        }
        
        // Add toString and valueOf manually, as they will not be iterated
        // by for...in iteration in Internet Explorer.
        sharedPrototype.toString = definition.toString;
        sharedPrototype.valueOf = definition.valueOf;

        // Remove properties to avoid re-adding later when Core.inherit() is invoked.
        delete definition.toString;
        delete definition.valueOf;

        // Add Mixins.
        if (definition.$include) {
            // Reverse order of mixins, such that later-defined mixins will override earlier ones.
            // (Mixins will only be added if they will NOT override an existing method.)
            var mixins = definition.$include.reverse();
            Core.mixin(prototypeClass, mixins);
            
            // Remove property to avoid adding later when Core.inherit() is invoked.
            delete definition.$include;
        }

        // Store $load static initializer and remove from definition so it is not inherited in static processing.
        var loadMethod = null;
        if (definition.$load) {
            loadMethod = definition.$load;

            // Remove property to avoid adding later when Core.inherit() is invoked.
            delete definition.$load;
        }
        
        // Process static properties and methods defined in the '$static' object.
        if (definition.$static) {
            Core.inherit(constructorClass, definition.$static);

            // Remove property to avoid adding later when Core.inherit() is invoked.
            delete definition.$static;
        }

        // Process instance properties and methods.
        Core.inherit(sharedPrototype, definition);
        
        // If class is concrete, verify all abstract methods are provided.
        if (!constructorClass.$abstract) {
            this._verifyAbstractImpl(constructorClass);
        }
        
        // Invoke static constructors.
        if (loadMethod) {
            // Invoke $load() function with "this" pointer set to class.
            loadMethod.call(constructorClass);
        }
        
        return constructorClass;
    },
    
    /**
     * Duplicates the virtual property data of the source object and 
     * places it in the destination object.
     *
     * @param destination the object into which the $virtual data should be copied
     * @param source an object which may contain a $virtual property specifying virtual properties
     */
    _inheritVirtualPropertyFlags: function(destination, source) {
        if (source.$virtual) {
            destination.$virtual = {};
            for (var x in source.$virtual) {
                destination.$virtual[x] = source.$virtual[x];
            }
        }
    },
    
    /**
     * Determines if the specified propertyName of the specified object is a virtual
     * property, i.e., that it can be overridden by subclasses.
     */
    _isVirtual: function(object, propertyName) {
        switch (propertyName) {
        case "$construct":
        case "$load":
        case "$static":
        case "toString":
        case "valueOf":
            return true;
        }
        
        if (!object.$virtual) {
            return false;
        }
        
        return object.$virtual[propertyName];
    },
    
    inherit: function(destination, source, virtualState) {
        for (var name in source) {
            if (destination[name] && !this._isVirtual(destination, name)) {
                // Property exists in destination as is not marked as virtual.
                throw new Error("Cannot override non-virtual property \"" + name + "\".");
            } else {
                if (virtualState) {
                    // Property is being declared virtual, flag in $virtual property.
                    if (!destination.$virtual) {
                        destination.$virtual = {};
                    }
                    destination.$virtual[name] = true;
                }
                destination[name] = source[name];
            }
        }
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
    
    /**
     * Verifies that a concrete derivative of an abstract class implements
     * abstract properties present in the base class.
     *
     * @param constructorClass the class to verify
     */
    _verifyAbstractImpl: function(constructorClass) {
         var baseClass = constructorClass.$super;
         if (!baseClass || !baseClass.$abstract || baseClass.$abstract === true) {
             return;
         }
         
         for (var x in baseClass.$abstract) {
             if (!constructorClass.prototype[x]) {
                 throw new Error("Concrete class does not provide implementation of abstract method \"" + x + "\".");
             }
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
    toString: function() {
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

    $virtual: {
        
        /**
         * Default run() implementation. Should be overidden by subclasses.
         */
        run: function() {
            if (this.methodRef) {
                this.methodRef.invoke();
            }
        }
    }
});
