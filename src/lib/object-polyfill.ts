/**
 * Stellt einen Polyfill für Object.entries bereit
 * @param obj - Ein Objekt über dessen Einträge iteriert werden soll
 */
export function entries(obj): KeyValuePair[] {
	return Object.keys(obj)
		.map((key: string) => [key, obj[key]] as KeyValuePair)
		;
}
export type KeyValuePair = [string, any];
// ES6-Generator-Version
//export function* entries(obj) {
//	for (let key of Object.keys(obj)) {
//		yield [key, obj[key]];
//	}
//}

/**
 * Stellt einen Polyfill für Object.entries bereit
 * @param obj - Ein Objekt über dessen Werte iteriert werden soll
 */
export function values(obj): any[] {
	return Object.keys(obj)
		.map(key => obj[key])
		;
}
// ES6-Version:
//export function* values(obj) {
//	for (let key of Object.keys(obj)) {
//		yield obj[key];
//	}
//}

/**
 * Filtert die Eigenschaften eines Objekts anhand der übergebenen Filterfunktion
 * @param obj - Das Objekt, dessen Eigenschaften gefiltert werden sollen
 * @param predicate - Die Funktion, die zum Filtern der Eigenschaften angewendet werden soll
 */
export type predicateFunction = (any, string?) => boolean;
export function filter(obj: any, predicate: predicateFunction): any {
	const ret = {};
	for (let [key, val] of entries(obj)) {
		if (predicate(val, key)) ret[key] = val;
	}
	return ret;
}

/**
 * Kombinierte mehrere Key-Value-Paare zu einem Objekt
 * @param properties - Die einzelnen Eigenschaften des zu kombinierenden Objekts als Key-Wert-Paare
 */
export function composeObject(properties: KeyValuePair) {
	return properties.reduce((acc, [key, value]) => {
		acc[key] = value;
		return acc;
	}, {});
}

/**
 * Extrahiert eine Eigenschaft aus einer Objektstruktur anhand eines Property-Pfades
 * @param object - Die Objektstruktur in der die Eigenschaft gesucht werden soll
 * @param path - Der Eigenschaftspfad der Form propName.propName.[arrayIndex].propName
 */
export function dig(object: any, path: string): any {
	function _dig(obj, pathArr: string[]) {
		// are we there yet? then return obj
		if (!pathArr.length) return obj;
		// go deeper
		let propName : (string|number) = pathArr.shift();
		if (/\[\d+\]/.test(propName)) {
			// this is an array index
			propName = +propName.slice(1,-1);
		}
		return _dig(obj[propName], pathArr);
	}
	return _dig(object, path.split("."));
}

/**
 * Vergräbt eine Eigenschaft in einem Objekt (Gegenteil von dig)
 * @param object - Die Objektstruktur in der die Eigenschaft abgelegt werden soll
 * @param path - Der Eigenschaftspfad der Form propName.propName.[arrayIndex].propName
 * @param value - Der abzulegende Eigenschaftswert
 */
export function bury(object: any, path: string, value: any) : void {
	function _bury(obj, pathArr: string[], value) {
		// are we there yet? then return obj
		if (pathArr.length === 1) {
			obj[pathArr[0]] = value;
			return;
		}
		// go deeper
		let propName: (string|number) = pathArr.shift();
		if (/\[\d+\]/.test(propName)) {
			// this is an array index
			propName = +propName.slice(1, -1);
		}
		_bury(obj[propName], pathArr, value);
	}
	_bury(object, path.split("."), value);
}


/**
 * Kopiert Eigenschaften rekursiv von einem Objekt auf ein anderes
 * @param target - Das Zielobjekt, auf das die Eigenschaften übertragen werden sollen
 * @param source - Das Quellobjekt, aus dem die Eigenschaften kopiert werden sollen
 */
export function extend(target, source) {
	target = target || {};
	for (let [prop, val] of entries(source)) {
		if (val instanceof Object) {
			target[prop] = extend(target[prop], val);
		} else {
			target[prop] = val;
		}
	}
	return target;
}