const URL_REGEX =
    /^(http|ws)s?:\/\/[a-z0-9]([a-z0-9.-]+)?(:[0-9]{1,5})?((\/)?(([a-z0-9-_])+(\/)?)+)$/i;

export const UPPERCASE_RE = new RegExp('^(.*[A-Z].*)$');

export const isUrl = (value: string): boolean => URL_REGEX.test(value);

export function isASCII(value?: string): boolean {
    if (!value) return true;
    return /^[\x00-\x7F]*$/.test(value); // eslint-disable-line
}

export const hasUppercase = (value: string) => UPPERCASE_RE.test(value);
