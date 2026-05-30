import { useEffect, useState } from 'react';

// Returns a value that lags behind the input by `delay` ms — ignores keystrokes
// until the user pauses. Pattern: feed search input here, fire the API call
// from a useEffect that depends on the debounced value.
export function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
