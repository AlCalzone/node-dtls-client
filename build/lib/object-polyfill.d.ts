/**
 * Stellt einen Polyfill für Object.entries bereit
 * @param obj - Ein Objekt über dessen Einträge iteriert werden soll
 */
export declare function entries(obj: any): KeyValuePair[];
export declare type KeyValuePair = [string, any];
/**
 * Stellt einen Polyfill für Object.entries bereit
 * @param obj - Ein Objekt über dessen Werte iteriert werden soll
 */
export declare function values(obj: any): any[];
/**
 * Filtert die Eigenschaften eines Objekts anhand der übergebenen Filterfunktion
 * @param obj - Das Objekt, dessen Eigenschaften gefiltert werden sollen
 * @param predicate - Die Funktion, die zum Filtern der Eigenschaften angewendet werden soll
 */
export declare type predicateFunction = (any, string?) => boolean;
export declare function filter(obj: any, predicate: predicateFunction): any;
/**
 * Kombinierte mehrere Key-Value-Paare zu einem Objekt
 * @param properties - Die einzelnen Eigenschaften des zu kombinierenden Objekts als Key-Wert-Paare
 */
export declare function composeObject(properties: KeyValuePair): any;
/**
 * Extrahiert eine Eigenschaft aus einer Objektstruktur anhand eines Property-Pfades
 * @param object - Die Objektstruktur in der die Eigenschaft gesucht werden soll
 * @param path - Der Eigenschaftspfad der Form propName.propName.[arrayIndex].propName
 */
export declare function dig(object: any, path: string): any;
/**
 * Vergräbt eine Eigenschaft in einem Objekt (Gegenteil von dig)
 * @param object - Die Objektstruktur in der die Eigenschaft abgelegt werden soll
 * @param path - Der Eigenschaftspfad der Form propName.propName.[arrayIndex].propName
 * @param value - Der abzulegende Eigenschaftswert
 */
export declare function bury(object: any, path: string, value: any): void;
/**
 * Kopiert Eigenschaften rekursiv von einem Objekt auf ein anderes
 * @param target - Das Zielobjekt, auf das die Eigenschaften übertragen werden sollen
 * @param source - Das Quellobjekt, aus dem die Eigenschaften kopiert werden sollen
 */
export declare function extend(target: any, source: any): any;
