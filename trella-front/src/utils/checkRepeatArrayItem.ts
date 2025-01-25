export const checkRepeatItemArray = <T extends Record<string, unknown>>(
    array1: T[] = [],
    array2: T[] = [],
    identifyOption: keyof T = "_id" as keyof T
  ): T[] => {
    for (const item of array2) {
      if (
        array1.find(
          (itemArray1) =>
            itemArray1 &&
            itemArray1[identifyOption] === item?.[identifyOption]
        )
      ) {
        continue;
      } else {
        array1.push(item);
      }
    }
  
    return array1;
  };
  