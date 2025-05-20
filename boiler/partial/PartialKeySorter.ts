import {PartialSortRules} from './PartialSortRules';

export class PartialKeySorter {
    protected _keys: string[] = [];
    protected _rules: { [key: string]: { before: string[], after: string[] } } = {};

    public addKey(key: string) {
        this._keys.push(key);
    }

    public before(keyA: string, keyB: string) {
        if (!this._rules[keyA]) {
            this._rules[keyA] = {before: [], after: []};
        }
        this._rules[keyA].before.push(keyB);
    }

    public after(keyA: string, keyB: string) {
        if (!this._rules[keyA]) {
            this._rules[keyA] = {before: [], after: []};
        }
        this._rules[keyA].after.push(keyB);
    }

    public getRules(key: string) {
        return new PartialSortRules(key, this);
    }

    public getSorted() {
        // Create adjacency list representation of the graph
        const graph: Map<string, Set<string>> = new Map();
        const inDegree: Map<string, number> = new Map();

        // Initialize graphs and degree counts
        this._keys.forEach(key => {
            graph.set(key, new Set());
            inDegree.set(key, 0);
        });

        // Build the graph based on rules
        this._keys.forEach(key => {
            const rules = this._rules[key];
            if (rules) {
                // Handle "before" rules - current key should come before these keys
                rules.before.forEach(beforeKey => {
                    if (this._keys.includes(beforeKey)) {
                        graph.get(key)?.add(beforeKey);
                        inDegree.set(beforeKey, (inDegree.get(beforeKey) || 0) + 1);
                    }
                });

                // Handle "after" rules - current key should come after these keys
                rules.after.forEach(afterKey => {
                    if (this._keys.includes(afterKey)) {
                        graph.get(afterKey)?.add(key);
                        inDegree.set(key, (inDegree.get(key) || 0) + 1);
                    }
                });
            }
        });

        // Kahn's algorithm for topological sort
        const queue: string[] = [];
        const result: string[] = [];

        // Add all nodes with no incoming edges to queue
        this._keys.forEach(key => {
            if (inDegree.get(key) === 0) {
                queue.push(key);
            }
        });

        while (queue.length > 0) {
            const current = queue.shift()!;
            result.push(current);

            // Remove edges from current node
            graph.get(current)?.forEach(neighbor => {
                inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
                if (inDegree.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            });
        }

        // Check for cycles
        if (result.length !== this._keys.length) {
            // Find keys that are part of the cycle (not in result)
            const remainingKeys = this._keys.filter(key => !result.includes(key));
            
            // Find a cycle starting from one of the remaining keys
            const cyclePath = this.findCycle(graph, remainingKeys[0]);
            
            throw new Error(`Circular dependency detected in sorting rules: ${cyclePath}`);
        }
        
        return result;
    }
    
    /**
     * Find a cycle in the graph starting from the given key
     * @param graph The adjacency list representation of the graph
     * @param startKey The key to start the search from
     * @returns A string representation of the cycle (e.g., "key1 -> key2 -> key3 -> key1")
     */
    private findCycle(graph: Map<string, Set<string>>, startKey: string): string {
        const visited = new Set<string>();
        const path: string[] = [];
        const pathSet = new Set<string>();
        
        const dfs = (key: string): string | null => {
            // If we've seen this key in our current path, we found a cycle
            if (pathSet.has(key)) {
                // Find where the cycle starts
                const cycleStartIndex = path.indexOf(key);
                // Extract the cycle and format it
                const cycle = [...path.slice(cycleStartIndex), key];
                return cycle.join(' -> ');
            }
            
            // If we've visited this key before but it's not in our current path, no cycle here
            if (visited.has(key)) {
                return null;
            }
            
            // Mark as visited and add to current path
            visited.add(key);
            path.push(key);
            pathSet.add(key);
            
            // Check all neighbors
            const neighbors = graph.get(key) || new Set();
            for (const neighbor of neighbors) {
                const result = dfs(neighbor);
                if (result) {
                    return result;
                }
            }
            
            // Remove from current path as we backtrack
            path.pop();
            pathSet.delete(key);
            
            return null;
        };
        
        const result = dfs(startKey);
        return result || `${startKey} (cycle detection failed)`;
    }
}
