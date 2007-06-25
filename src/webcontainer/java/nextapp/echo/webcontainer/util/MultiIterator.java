package nextapp.echo.webcontainer.util;

import java.util.Iterator;
import java.util.NoSuchElementException;

/**
 * An <code>Iterator</code> which presents the contents of many iterators
 * as a single iterator.
 */
public class MultiIterator 
implements Iterator {

    private Iterator[] iterators;
    private int index = 0;

    /**
     * Creates a new <code>MultiIterator</code>.
     * 
     * @param iterators the array of iterators across which to iterate.
     */
    public MultiIterator(Iterator[] iterators) {
        super();
        this.iterators = iterators;
    }

    /**
     * @see java.util.Iterator#hasNext()
     */
    public boolean hasNext() {
        while (index < iterators.length && !iterators[index].hasNext()) {
            ++index;
        }
        return index < iterators.length;
    }

    /**
     * @see java.util.Iterator#next()
     */
    public Object next() {
        while (index < iterators.length && !iterators[index].hasNext()) {
            ++index;
        }
        if (index >= iterators.length) {
            throw new NoSuchElementException();
        }
        Object value = iterators[index].next();
        return value;
    }
    
    /**
     * @see java.util.Iterator#remove()
     */
    public void remove() {
        throw new UnsupportedOperationException();
    }
}
