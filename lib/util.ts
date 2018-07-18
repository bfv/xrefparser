export function replaceAll(original: string, find: string, replaceBy: string): string {

    let tmp = '';
    while (tmp !== original) {
        tmp = original;
        original = original.replace(find, replaceBy);
    }

    return original;
}
