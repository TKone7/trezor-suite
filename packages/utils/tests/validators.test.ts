import { isAscii, HAS_UPPERCASE_LATER_REGEXP } from '../src/validators';

describe('utils/suite/validators', () => {
    describe('isAscii', () => {
        it('should return true for ASCII only string', () => {
            expect(isAscii('this is only ascii')).toEqual(true);
        });

        it('should return true when called without parameter', () => {
            expect(isAscii()).toEqual(true);
        });

        it('should return false strings with non ASCII chars', () => {
            expect(isAscii('¥')).toEqual(false);
            expect(isAscii('železniční přejezd')).toEqual(false);
        });
    });

    it('HAS_UPPERCASE_LATER_REGEXP', () => {
        expect(HAS_UPPERCASE_LATER_REGEXP.test('0')).toBe(false);
        expect(HAS_UPPERCASE_LATER_REGEXP.test('abc')).toBe(false);
        expect(HAS_UPPERCASE_LATER_REGEXP.test('abcD')).toBe(true);
        expect(HAS_UPPERCASE_LATER_REGEXP.test('Abcd')).toBe(true);
        expect(HAS_UPPERCASE_LATER_REGEXP.test('aBcd')).toBe(true);
        expect(HAS_UPPERCASE_LATER_REGEXP.test('123abc123')).toBe(false);
        expect(HAS_UPPERCASE_LATER_REGEXP.test('0x123abc456')).toBe(false);
        expect(HAS_UPPERCASE_LATER_REGEXP.test('0x123aBc456')).toBe(true);
    });
});
