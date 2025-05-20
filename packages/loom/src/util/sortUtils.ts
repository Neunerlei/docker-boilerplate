/**
 * Returns a new array of objects sorted by their order property.
 * If the order property is not set, the object will be assigned the defaultOrder value.
 * Lower numbers are sorted first, higher numbers are sorted last. Negative numbers are allowed,
 * and are considered lower than positive numbers -> [2, 1, -1, 0] becomes: [-1, 0, 1, 2]
 *
 * @param objects
 * @param defaultOrder
 */
export function sortObjectsByOrder<T extends Array<object>>(objects: T, defaultOrder = 0): T {
    return [...objects].sort((a, b) => {
        const orderA = 'order' in a && typeof a.order === 'number' ? a.order : defaultOrder;
        const orderB = 'order' in b && typeof b.order === 'number' ? b.order : defaultOrder;
        return orderA - orderB;
    }) as T;
}

export function sortObjectsByName<T extends Array<object>>(objects: T): T {
    return [...objects].sort((a, b) => {
        const nameA = 'name' in a && typeof a.name === 'string' ? a.name : '';
        const nameB = 'name' in b && typeof b.name === 'string' ? b.name : '';
        return nameA.localeCompare(nameB);
    }) as T;
}
