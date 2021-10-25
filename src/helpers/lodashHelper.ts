import * as _ from 'lodash';

/**
 * @param obj
 * @param objToCheck
 * @param placeHolderForDeletedProperties  value in resulting object for properties that exists in objToCheck but not in obj
 * @param deepEqual perform deep equal check
 * @param omitDeletedProperties  only result props that exists in obj
 * @return object  object with all properties from obj that differ from objToCheck
 */
export function objectChangeDiff<T extends Record<string, any>>(
  obj: Record<string, any>,
  objToCheck: T,
  placeHolderForDeletedProperties: any = undefined,
  deepEqual = true,
  omitDeletedProperties = false
): Partial<T> {
  const merged = { ...objToCheck, ...obj };
  const result = {} as Record<string, any>;
  for (const [key, value] of Object.entries(merged)) {
    if (key in obj) {
      const valueToCheck = objToCheck[key];
      let isEqual = valueToCheck === value;
      if (deepEqual && !isEqual) {
        isEqual = _.isEqual(valueToCheck, value);
      }
      if (!isEqual) {
        result[key] = value;
      }
    } else {
      if(!omitDeletedProperties){
        result[key] = placeHolderForDeletedProperties;
      }
    }
  }
  return result as Partial<T>;
}
