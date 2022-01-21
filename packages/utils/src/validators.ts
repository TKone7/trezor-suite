const URL_REGEXP =
    /^(http|ws)s?:\/\/[a-z0-9]([a-z0-9.-]+)?(:[0-9]{1,5})?((\/)?(([a-z0-9-_])+(\/)?)+)$/i;

export const HAS_UPPERCASE_LATER_REGEXP = new RegExp('^(.*[A-Z].*)$');

export const isUrl = (value: string): boolean => URL_REGEXP.test(value);

export function isAscii(value?: string): boolean {
    if (!value) return true;
    return /^[\x00-\x7F]*$/.test(value); // eslint-disable-line
}
