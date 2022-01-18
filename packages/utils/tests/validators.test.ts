import { isASCII, hasUppercase } from '../src/validators';

describe('utils/suite/validators', () => {
    describe('isASCII', () => {
        it('should return true for ASCII only string', () => {
            expect(isASCII('this is only ascii')).toEqual(true);
        });

        it('should return true when called without parameter', () => {
            expect(isASCII()).toEqual(true);
        });

        it('should return false strings with non ASCII chars', () => {
            const fooStrings = ['¥', 'železniční přejezd'];
            fooStrings.forEach(str => {
                expect(isASCII(str)).toEqual(false);
            });
        });
    });

    it('hasUppercase', () => {
        expect(hasUppercase('0')).toBe(false);
        expect(hasUppercase('abc')).toBe(false);
        expect(hasUppercase('abcD')).toBe(true);
        expect(hasUppercase('Abcd')).toBe(true);
        expect(hasUppercase('aBcd')).toBe(true);
        expect(hasUppercase('123abc123')).toBe(false);
        expect(hasUppercase('0x123abc456')).toBe(false);
        expect(hasUppercase('0x123aBc456')).toBe(true);
    });
});
