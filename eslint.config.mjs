import {
    defineConfig,
    globalIgnores,
} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    prettier,
    // Override default ignores of eslint-config-next.
    {
        rules: {
            // 4 spaces indent
            indent: [
                'error',
                4,
                {
                    SwitchCase: 1,
                    ignoredNodes: [
                        'ConditionalExpression',
                    ],
                },
            ],
        },
    },

    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',

        'node_modules/**',
        '*.config.js',
        '*.config.mjs',
        'dist/**',
        'coverage/**',
    ]),
]);

export default eslintConfig;
