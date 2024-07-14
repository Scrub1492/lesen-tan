/*
 * Copyright (C) 2024  Yomitan Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {prefixInflection, suffixInflection} from '../language-transforms.js';

const CONSONANTS = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';
const VOWELS = 'aeiou';

/**
 * @param {string[]} conditionsIn
 * @param {string[]} conditionsOut
 * @returns {import('language-transformer').Rule}
 */
export function hyphenatedInflection(conditionsIn, conditionsOut) {
    const regex = /-/;
    return {
        type: 'prefix',
        isInflected: regex,
        deinflect: (text) => text.replace(regex, ''),
        conditionsIn,
        conditionsOut,
    };
}

/**
 * @param {string} inflectedSuffix
 * @param {string} deinflectedSuffix
 * @param {string[]} conditionsIn
 * @param {string[]} conditionsOut
 * @returns {import('language-transformer').Rule}
 */
export function suffixInflectionWithOtoUSoundChange(inflectedSuffix, deinflectedSuffix, conditionsIn, conditionsOut) {
    const regex = new RegExp(`u([${CONSONANTS}]+)${inflectedSuffix}$`);
    return {
        type: 'prefix',
        isInflected: regex,
        deinflect: (text) => text.replace(regex, `o$1${deinflectedSuffix}`),
        conditionsIn,
        conditionsOut,
    };
}

/**
 * Prefix inflection with repeated first syllable
 * @param {string} inflectedPrefix
 * @param {string} deinflectedPrefix
 * @param {string[]} conditionsIn
 * @param {string[]} conditionsOut
 * @param {string} consonants
 * @returns {import('language-transformer').Rule}
 */
export function prefixInflectionWithRep1(inflectedPrefix, deinflectedPrefix, conditionsIn, conditionsOut, consonants = CONSONANTS) {
    const regex = new RegExp(`^(${inflectedPrefix})([${consonants}]*[${VOWELS}])(\\2)`);
    return {
        type: 'prefix',
        isInflected: regex,
        deinflect: (text) => text.replace(regex, `${deinflectedPrefix}$2`),
        conditionsIn,
        conditionsOut,
    };
}

/**
 * @param {string} inflectedPrefix
 * @param {string} deinflectedPrefix
 * @param {string} inflectedSuffix
 * @param {string} deinflectedSuffix
 * @param {string[]} conditionsIn
 * @param {string[]} conditionsOut
 * @returns {import('language-transformer').Rule}
 */
export function sandwichInflection(inflectedPrefix, deinflectedPrefix, inflectedSuffix, deinflectedSuffix, conditionsIn, conditionsOut) {
    const regex = new RegExp(`^${inflectedPrefix}\\w+${inflectedSuffix}$`);
    return {
        type: 'other',
        isInflected: regex,
        deinflect: (text) => deinflectedPrefix + text.slice(inflectedPrefix.length, -inflectedSuffix.length) + deinflectedSuffix,
        conditionsIn,
        conditionsOut,
    };
}

/**
 * @param {string} inflectedPrefix
 * @param {string} deinflectedPrefix
 * @param {string} inflectedSuffix
 * @param {string} deinflectedSuffix
 * @param {string[]} conditionsIn
 * @param {string[]} conditionsOut
 * @returns {import('language-transformer').Rule}
 */
export function sandwichInflectionWithOtoUSoundChange(inflectedPrefix, deinflectedPrefix, inflectedSuffix, deinflectedSuffix, conditionsIn, conditionsOut) {
    const regex = new RegExp(`^${inflectedPrefix}(\\w+)u([${CONSONANTS}]+)${inflectedSuffix}$`);
    return {
        type: 'prefix',
        isInflected: regex,
        deinflect: (text) => text.replace(regex, `${deinflectedPrefix}$1o$2${deinflectedSuffix}`),
        conditionsIn,
        conditionsOut,
    };
}


/** @type {import('language-transformer').LanguageTransformDescriptor} */
export const tagalogTransforms = {
    language: 'tl',
    conditions: {
        n: {
            name: 'Noun',
            isDictionaryForm: true,
            subConditions: ['num'],
        },
        v: {
            name: 'Verb',
            isDictionaryForm: true,
        },
        adj: {
            name: 'Adjective',
            isDictionaryForm: true,
        },
        num: {
            name: 'Numeral',
            isDictionaryForm: true,
        },
    },
    transforms: {
        'hyphenated': {
            name: 'hyphenated',
            description: 'hyphenated form of words',
            rules: [
                hyphenatedInflection([], []),
            ],
        },
        '-an': {
            name: '-an',
            rules: [
                suffixInflection('an', '', [], ['n']),
                suffixInflection('ran', 'd', [], ['n']),
                suffixInflectionWithOtoUSoundChange('an', '', [], ['n']),
                suffixInflectionWithOtoUSoundChange('ran', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => suffixInflection(`${v}han`, `${v}`, [], ['n'])), //  murahan
                ...[...'aeiou'].map((v) => suffixInflection(`${v}nan`, `${v}`, [], ['n'])), //  tawanan
                suffixInflection('uhan', 'o', [], ['n']),
                suffixInflection('unan', 'o', [], ['n']),
            ],
        },
        '-in': {
            name: '-in',
            rules: [
                suffixInflection('in', '', [], ['n']),
                suffixInflection('rin', 'd', [], ['n']),
                suffixInflectionWithOtoUSoundChange('in', '', [], ['n']),
                suffixInflectionWithOtoUSoundChange('rin', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => suffixInflection(`${v}hin`, `${v}`, [], ['n'])), //  katihin
                ...[...'aeiou'].map((v) => suffixInflection(`${v}nin`, `${v}`, [], ['n'])), //  talunin
                suffixInflection('uhin', 'o', [], ['n']),
                suffixInflection('unin', 'o', [], ['n']),
            ],
        },
        'ma-': {
            name: 'ma-',
            rules: [
                prefixInflection('ma', '', [], ['n']),
                prefixInflection('mar', 'd', [], ['n']),
            ],
        },
        'pang-': {
            name: 'pang-',
            rules: [
                prefixInflection('pang', '', [], ['n']),
                ...[...'dlrst'].map((v) => prefixInflection(`pan${v}`, `${v}`, [], ['n'])),
                ...[...'bp'].map((v) => prefixInflection(`pam${v}`, `${v}`, [], ['n'])),
            ],
        },
        'ka-': {
            name: 'ka-',
            rules: [
                prefixInflection('ka', '', [], ['n']),
                prefixInflection('kar', 'd', [], ['n']),
            ],
        },
        'kaka-': {
            name: 'kaka-',
            rules: [
                prefixInflection('kaka', '', [], ['n']),
                prefixInflection('kakar', 'd', [], ['n']),
                prefixInflectionWithRep1('ka', '', [], ['n']),
            ],
        },
        'ka-...-an': {
            name: 'ka-...-an',
            rules: [
                sandwichInflection('ka', '', 'an', '', [], ['n']),
                sandwichInflection('kar', 'd', 'an', '', [], ['n']),
                sandwichInflection('ka', '', 'ran', 'd', [], ['n']),
                sandwichInflection('kar', 'd', 'ran', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('ka', '', `${v}han`, `${v}`, [], ['n'])), //  murahan
                ...[...'aeiou'].map((v) => sandwichInflection('kar', 'd', `${v}han`, `${v}`, [], ['n'])), //  murahan
                ...[...'aeiou'].map((v) => sandwichInflection('ka', '', `${v}nan`, `${v}`, [], ['n'])), //  murahan
                ...[...'aeiou'].map((v) => sandwichInflection('kar', 'd', `${v}nan`, `${v}`, [], ['n'])), //  tawanan
                sandwichInflection('ka', '', 'uhan', 'o', [], ['n']),
                sandwichInflection('kar', 'd', 'uhan', 'o', [], ['n']),
                sandwichInflection('ka', '', 'unan', 'o', [], ['n']),
                sandwichInflection('kar', 'd', 'unan', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('ka', '', 'an', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('kar', 'd', 'an', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('ka', '', 'ran', 'd', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('kar', 'd', 'ran', 'd', [], ['n']),
            ],
        },
        'mag-': {
            name: 'mag-',
            rules: [
                prefixInflection('mag', '', [], ['n']),
            ],
        },
        'mag- + rep1': {
            name: 'mag- + rep1',
            rules: [
                prefixInflectionWithRep1('mag', '', [], ['n']),
            ],
        },
        'magka-': {
            name: 'magka-',
            rules: [
                prefixInflection('magka', '', [], ['n']),
                prefixInflection('magkar', 'd', [], ['n']),
            ],
        },
        'magkaka-': {
            name: 'magkaka-',
            rules: [
                prefixInflection('magkaka', '', [], ['n']),
                prefixInflection('magkakar', 'd', [], ['n']),
            ],
        },
        'mang- + rep1': {
            name: 'mang- + rep1',
            rules: [
                prefixInflectionWithRep1('mang', '', [], ['n']),
                prefixInflectionWithRep1('man', '', [], ['n'], 'dlrst'),
                prefixInflectionWithRep1('mam', '', [], ['n'], 'bp'),
            ],
        },
        'pa-': {
            name: 'pa-',
            rules: [
                prefixInflection('pa', '', [], ['n']),
                prefixInflection('par', 'd', [], ['n']),
            ],
        },
        'pa-...-an': {
            name: 'pa-...-an',
            rules: [
                sandwichInflection('pa', '', 'an', '', [], ['n']),
                sandwichInflection('par', 'd', 'an', '', [], ['n']),
                sandwichInflection('pa', '', 'ran', 'd', [], ['n']),
                sandwichInflection('par', 'd', 'ran', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('pa', '', `${v}han`, `${v}`, [], ['n'])), //  murahan
                ...[...'aeiou'].map((v) => sandwichInflection('par', 'd', `${v}han`, `${v}`, [], ['n'])), //  murahan
                ...[...'aeiou'].map((v) => sandwichInflection('pa', '', `${v}nan`, `${v}`, [], ['n'])), //  murahan
                ...[...'aeiou'].map((v) => sandwichInflection('par', 'd', `${v}nan`, `${v}`, [], ['n'])), //  tawanan
                sandwichInflection('pa', '', 'uhan', 'o', [], ['n']),
                sandwichInflection('par', 'd', 'uhan', 'o', [], ['n']),
                sandwichInflection('pa', '', 'unan', 'o', [], ['n']),
                sandwichInflection('par', 'd', 'unan', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('pa', '', 'an', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('par', 'd', 'an', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('pa', '', 'ran', 'd', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('par', 'd', 'ran', 'd', [], ['n']),
            ],
        },
        'pag-': {
            name: 'pag-',
            rules: [
                prefixInflection('pag', '', [], ['n']),
            ],
        },
        'pag- + rep1': {
            name: 'pag- + rep1',
            rules: [
                prefixInflectionWithRep1('pag', '', [], ['n']),
            ],
        },
        'pagka-': {
            name: 'pagka-',
            rules: [
                prefixInflection('pagka', '', [], ['n']),
                prefixInflection('pagkar', 'd', [], ['n']),
                prefixInflection('pagkaka', '', [], ['n']),
                prefixInflection('pagkakar', 'd', [], ['n']),
            ],
        },
        'pakiki-': {
            name: 'pakiki-',
            rules: [
                prefixInflection('pakiki', '', [], ['n']),
                prefixInflectionWithRep1('pakiki', '', [], ['n']),
                prefixInflection('pakikir', 'd', [], ['n']),
            ],
        },
        'pakikipag-': {
            name: 'pakikipag-',
            rules: [
                prefixInflection('pakikipag', '', [], ['n']),
            ],
        },
        'pang- + rep1': {
            name: 'pang- + rep1',
            rules: [
                prefixInflectionWithRep1('pang', '', [], ['n']),
                prefixInflectionWithRep1('pan', '', [], ['n'], 'dlrst'),
                prefixInflectionWithRep1('pam', '', [], ['n'], 'bp'),
            ],
        },
        'tag-': {
            name: 'tag-',
            rules: [
                prefixInflection('tag', '', [], ['n']),
            ],
        },
        'taga-': {
            name: 'taga-',
            rules: [
                prefixInflection('taga', '', [], ['n']),
            ],
        },
        'tagapag-': {
            name: 'tagapag-',
            rules: [
                prefixInflection('tagapag', '', [], ['n']),
            ],
        },
        'tagapang-': {
            name: 'tagapang-',
            rules: [
                prefixInflection('tagapang', '', [], ['n']),
                ...[...'dlrst'].map((v) => prefixInflection(`tagapan${v}`, `${v}`, [], ['n'])),
                ...[...'bp'].map((v) => prefixInflection(`tagapam${v}`, `${v}`, [], ['n'])),
            ],
        },
        'i-': {
            name: 'i-',
            rules: [
                prefixInflection('i', '', [], ['n']),
            ],
        },
        'ika-': {
            name: 'ika-',
            rules: [
                prefixInflection('ika', '', [], ['n']),
            ],
        },
        'ipa-': {
            name: 'ipa-',
            rules: [
                prefixInflection('ika', '', [], ['n']),
            ],
        },
        'ipag-': {
            name: 'ipag-',
            rules: [
                prefixInflection('ipag', '', [], ['n']),
            ],
        },
        'ipag- + rep1': {
            name: 'ipag- + rep1',
            rules: [
                prefixInflectionWithRep1('ipag', '', [], ['n']),
            ],
        },
        'ipang-': {
            name: 'ipang-',
            rules: [
                prefixInflection('ipang', '', [], ['n']),
                ...[...'dlrst'].map((v) => prefixInflection(`ipan${v}`, `${v}`, [], ['n'])),
                ...[...'bp'].map((v) => prefixInflection(`ipam${v}`, `${v}`, [], ['n'])),
            ],
        },
        'ma-...-an': {
            name: 'ma-...-an',
            rules: [
                sandwichInflection('ma', '', 'an', '', [], ['n']),
                sandwichInflection('mar', 'd', 'an', '', [], ['n']),
                sandwichInflection('ma', '', 'ran', 'd', [], ['n']),
                sandwichInflection('mar', 'd', 'ran', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('ma', '', `${v}han`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('mar', 'd', `${v}han`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('ma', '', `${v}nan`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('mar', 'd', `${v}nan`, `${v}`, [], ['n'])),
                sandwichInflection('ma', '', 'uhan', 'o', [], ['n']),
                sandwichInflection('mar', 'd', 'uhan', 'o', [], ['n']),
                sandwichInflection('ma', '', 'unan', 'o', [], ['n']),
                sandwichInflection('mar', 'd', 'unan', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('ma', '', 'an', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('mar', 'd', 'an', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('ma', '', 'ran', 'd', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('mar', 'd', 'ran', 'd', [], ['n']),
            ],
        },
        'mag-...-an': {
            name: 'mag-...-an',
            rules: [
                sandwichInflection('mag', '', 'an', '', [], ['n']),
                sandwichInflection('mag', '', 'ran', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('mag', '', `${v}han`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('mag', '', `${v}nan`, `${v}`, [], ['n'])),
                sandwichInflection('mag', '', 'uhan', 'o', [], ['n']),
                sandwichInflection('mag', '', 'unan', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('mag', '', 'an', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('mag', '', 'ran', 'd', [], ['n']),
            ],
        },
        'magkanda-': {
            name: 'magkanda-',
            rules: [
                prefixInflection('magkanda', '', [], ['n']),
                prefixInflection('magkandar', 'd', [], ['n']),
            ],
        },
        'magma-': {
            name: 'magma-',
            rules: [
                prefixInflection('magma', '', [], ['n']),
                prefixInflection('magmar', 'd', [], ['n']),
            ],
        },
        'magpa-': {
            name: 'magpa-',
            rules: [
                prefixInflection('magpa', '', [], ['n']),
                prefixInflection('magpar', 'd', [], ['n']),
            ],
        },
        'magpaka-': {
            name: 'magpaka-',
            rules: [
                prefixInflection('magpaka', '', [], ['n']),
                prefixInflection('magpakar', 'd', [], ['n']),
            ],
        },
        'magsi-': {
            name: 'magsi-',
            rules: [
                prefixInflection('magsi', '', [], ['n']),
                prefixInflection('magsipag', '', [], ['n']),
            ],
        },
        'makapang-': {
            name: 'makapang-',
            rules: [
                prefixInflection('makapang', '', [], ['n']),
                ...[...'dlrst'].map((v) => prefixInflection(`makapan${v}`, `${v}`, [], ['n'])),
                ...[...'bp'].map((v) => prefixInflection(`makapam${v}`, `${v}`, [], ['n'])),
            ],
        },
        'makapag-': {
            name: 'makapag-',
            rules: [
                prefixInflection('makapag', '', [], ['n']),
            ],
        },
        'maka-': {
            name: 'maka-',
            rules: [
                prefixInflection('maka', '', [], ['n']),
                prefixInflection('makar', 'd', [], ['n']),
            ],
        },
        'maki-': {
            name: 'maki-',
            rules: [
                prefixInflection('maki', '', [], ['n']),
                prefixInflection('makir', 'd', [], ['n']),
            ],
        },
        'makipag-': {
            name: 'makipag-',
            rules: [
                prefixInflection('makipag', '', [], ['n']),
            ],
        },
        'makipag-...-an': {
            name: 'makipag-...-an',
            rules: [
                sandwichInflection('makipag', '', 'an', '', [], ['n']),
                sandwichInflection('makipag', '', 'ran', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('makipag', '', `${v}han`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('makipag', '', `${v}nan`, `${v}`, [], ['n'])),
                sandwichInflection('makipag', '', 'uhan', 'o', [], ['n']),
                sandwichInflection('makipag', '', 'unan', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('makipag', '', 'an', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('makipag', '', 'ran', 'd', [], ['n']),
            ],
        },
        'mang-': {
            name: 'mang-',
            rules: [
                prefixInflection('mang', '', [], ['n']),
                ...[...'dlrst'].map((v) => prefixInflection(`man${v}`, `${v}`, [], ['n'])),
                ...[...'bp'].map((v) => prefixInflection(`mam${v}`, `${v}`, [], ['n'])),
            ],
        },
        'mapa-': {
            name: 'mapa-',
            rules: [
                prefixInflection('mapa', '', [], ['n']),
                prefixInflection('mapar', 'd', [], ['n']),
            ],
        },
        'pa-...-in': {
            name: 'pa-...-in',
            rules: [
                sandwichInflection('pa', '', 'in', '', [], ['n']),
                sandwichInflection('par', 'd', 'in', '', [], ['n']),
                sandwichInflection('pa', '', 'rin', 'd', [], ['n']),
                sandwichInflection('par', 'd', 'rin', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('pa', '', `${v}hin`, `${v}`, [], ['n'])), //  murahan
                ...[...'aeiou'].map((v) => sandwichInflection('par', 'd', `${v}hin`, `${v}`, [], ['n'])), //  murahan
                ...[...'aeiou'].map((v) => sandwichInflection('pa', '', `${v}nin`, `${v}`, [], ['n'])), //  murahan
                ...[...'aeiou'].map((v) => sandwichInflection('par', 'd', `${v}nin`, `${v}`, [], ['n'])), //  tawanan
                sandwichInflection('pa', '', 'uhin', 'o', [], ['n']),
                sandwichInflection('par', 'd', 'uhin', 'o', [], ['n']),
                sandwichInflection('pa', '', 'unin', 'o', [], ['n']),
                sandwichInflection('par', 'd', 'unin', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('pa', '', 'in', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('par', 'd', 'in', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('pa', '', 'rin', 'd', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('par', 'd', 'rin', 'd', [], ['n']),
            ],
        },
        'pag-...-an': {
            name: 'pag-...-an',
            rules: [
                sandwichInflection('pag', '', 'an', '', [], ['n']),
                sandwichInflection('pag', '', 'ran', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('pag', '', `${v}han`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('pag', '', `${v}nan`, `${v}`, [], ['n'])),
                sandwichInflection('pag', '', 'uhan', 'o', [], ['n']),
                sandwichInflection('pag', '', 'unan', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('pag', '', 'an', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('pag', '', 'ran', 'd', [], ['n']),
            ],
        },
        'pang-...-an': {
            name: 'pang-...-an',
            rules: [
                sandwichInflection('pang', '', 'an', '', [], ['n']),
                sandwichInflection('pang', '', 'ran', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('pang', '', `${v}han`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('pang', '', `${v}nan`, `${v}`, [], ['n'])),
                sandwichInflection('pang', '', 'uhan', 'o', [], ['n']),
                sandwichInflection('pang', '', 'unan', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('pang', '', 'an', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('pang', '', 'ran', 'd', [], ['n']),

                ...[...'dlrst'].flatMap((v) => [
                    sandwichInflection(`pan${v}`, `${v}`, 'an', '', [], ['n']),
                    sandwichInflection(`pan${v}`, `${v}`, 'ran', 'd', [], ['n']),
                    ...[...'aeiou'].map((k) => sandwichInflection(`pan${v}`, `${v}`, `${k}han`, `${k}`, [], ['n'])),
                    ...[...'aeiou'].map((k) => sandwichInflection(`pan${v}`, `${v}`, `${k}nan`, `${k}`, [], ['n'])),
                    sandwichInflection(`pan${v}`, '', 'uhan', 'o', [], ['n']),
                    sandwichInflection(`pan${v}`, '', 'unan', 'o', [], ['n']),
                    sandwichInflectionWithOtoUSoundChange(`pan${v}`, `${v}`, 'an', '', [], ['n']),
                    sandwichInflectionWithOtoUSoundChange(`pan${v}`, `${v}`, 'ran', 'd', [], ['n']),
                ]),
                ...[...'bp'].flatMap((v) => [
                    sandwichInflection(`pam${v}`, `${v}`, 'an', '', [], ['n']),
                    sandwichInflection(`pam${v}`, `${v}`, 'ran', 'd', [], ['n']),
                    ...[...'aeiou'].map((k) => sandwichInflection(`pam${v}`, `${v}`, `${k}han`, `${k}`, [], ['n'])),
                    ...[...'aeiou'].map((k) => sandwichInflection(`pam${v}`, `${v}`, `${k}nan`, `${k}`, [], ['n'])),
                    sandwichInflection(`pam${v}`, '', 'uhan', 'o', [], ['n']),
                    sandwichInflection(`pam${v}`, '', 'unan', 'o', [], ['n']),
                    sandwichInflectionWithOtoUSoundChange(`pam${v}`, `${v}`, 'an', '', [], ['n']),
                    sandwichInflectionWithOtoUSoundChange(`pam${v}`, `${v}`, 'ran', 'd', [], ['n']),
                ]),
            ],
        },
        'pag-...-in': {
            name: 'pag-...-in',
            rules: [
                sandwichInflection('pag', '', 'in', '', [], ['n']),
                sandwichInflection('pag', '', 'rin', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('pag', '', `${v}hin`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('pag', '', `${v}nin`, `${v}`, [], ['n'])),
                sandwichInflection('pag', '', 'uhin', 'o', [], ['n']),
                sandwichInflection('pag', '', 'unin', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('pag', '', 'in', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('pag', '', 'rin', 'd', [], ['n']),
            ],
        },
        'papang-...-in': {
            name: 'papang-...-in',
            rules: [
                sandwichInflection('papang', '', 'in', '', [], ['n']),
                sandwichInflection('papang', '', 'rin', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('papang', '', `${v}hin`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('papang', '', `${v}nin`, `${v}`, [], ['n'])),
                sandwichInflection('papang', '', 'uhin', 'o', [], ['n']),
                sandwichInflection('papang', '', 'unin', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('papang', '', 'in', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('papang', '', 'rin', 'd', [], ['n']),

                ...[...'dlrst'].flatMap((v) => [
                    sandwichInflection(`papan${v}`, `${v}`, 'in', '', [], ['n']),
                    sandwichInflection(`papan${v}`, `${v}`, 'rin', 'd', [], ['n']),
                    ...[...'aeiou'].map((k) => sandwichInflection(`papan${v}`, `${v}`, `${k}hin`, `${k}`, [], ['n'])),
                    ...[...'aeiou'].map((k) => sandwichInflection(`papan${v}`, `${v}`, `${k}nin`, `${k}`, [], ['n'])),
                    sandwichInflection(`papan${v}`, '', 'uhin', 'o', [], ['n']),
                    sandwichInflection(`papan${v}`, '', 'unin', 'o', [], ['n']),
                    sandwichInflectionWithOtoUSoundChange(`papan${v}`, `${v}`, 'in', '', [], ['n']),
                    sandwichInflectionWithOtoUSoundChange(`papan${v}`, `${v}`, 'rin', 'd', [], ['n']),
                ]),
                ...[...'bp'].flatMap((v) => [
                    sandwichInflection(`papam${v}`, `${v}`, 'in', '', [], ['n']),
                    sandwichInflection(`papam${v}`, `${v}`, 'rin', 'd', [], ['n']),
                    ...[...'aeiou'].map((k) => sandwichInflection(`papam${v}`, `${v}`, `${k}hin`, `${k}`, [], ['n'])),
                    ...[...'aeiou'].map((k) => sandwichInflection(`papam${v}`, `${v}`, `${k}nin`, `${k}`, [], ['n'])),
                    sandwichInflection(`papam${v}`, '', 'uhin', 'o', [], ['n']),
                    sandwichInflection(`papam${v}`, '', 'unin', 'o', [], ['n']),
                    sandwichInflectionWithOtoUSoundChange(`papam${v}`, `${v}`, 'in', '', [], ['n']),
                    sandwichInflectionWithOtoUSoundChange(`papam${v}`, `${v}`, 'rin', 'd', [], ['n']),
                ]),
            ],
        },
        'ma-...-in': {
            name: 'ma-...-in',
            rules: [
                sandwichInflection('ma', '', 'in', '', [], ['n']),
                sandwichInflection('mar', 'd', 'in', '', [], ['n']),
                sandwichInflection('ma', '', 'rin', 'd', [], ['n']),
                sandwichInflection('mar', 'd', 'rin', 'd', [], ['n']),
                ...[...'aeiou'].map((v) => sandwichInflection('ma', '', `${v}hin`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('mar', 'd', `${v}hin`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('ma', '', `${v}nin`, `${v}`, [], ['n'])),
                ...[...'aeiou'].map((v) => sandwichInflection('mar', 'd', `${v}nin`, `${v}`, [], ['n'])),
                sandwichInflection('ma', '', 'uhin', 'o', [], ['n']),
                sandwichInflection('mar', 'd', 'uhin', 'o', [], ['n']),
                sandwichInflection('ma', '', 'unin', 'o', [], ['n']),
                sandwichInflection('mar', 'd', 'unin', 'o', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('ma', '', 'in', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('mar', 'd', 'in', '', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('ma', '', 'rin', 'd', [], ['n']),
                sandwichInflectionWithOtoUSoundChange('mar', 'd', 'rin', 'd', [], ['n']),
            ],
        },
        'mapag-': {
            name: 'mapag-',
            rules: [
                prefixInflection('mapag', '', [], ['n']),
            ],
        },
        'naka-': {
            name: 'naka-',
            rules: [
                prefixInflection('naka', '', [], ['n']),
                prefixInflection('nakar', 'd', [], ['n']),
            ],
        },
        'nakaka-': {
            name: 'nakaka-',
            rules: [
                prefixInflection('nakaka', '', [], ['n']),
                prefixInflection('nakakar', 'd', [], ['n']),
            ],
        },
        'nakakapang-': {
            name: 'nakakapang-',
            rules: [
                prefixInflection('nakakapang', '', [], ['n']),
                ...[...'dlrst'].map((v) => prefixInflection(`nakakapan${v}`, `${v}`, [], ['n'])),
                ...[...'bp'].map((v) => prefixInflection(`nakakapam${v}`, `${v}`, [], ['n'])),
            ],
        },
        'pala-': {
            name: 'pala-',
            rules: [
                prefixInflection('pala', '', [], ['n']),
                prefixInflection('palar', 'd', [], ['n']),
            ],
        },
    },
};
