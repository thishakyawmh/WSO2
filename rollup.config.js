import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
        format: 'iife', // Immediately Invoked Function Expression
        name: 'bundle'
    },
    plugins: [
        resolve(), // helps Rollup find node_modules
        commonjs(), // converts CommonJS modules to ES6
        json(), // allows Rollup to import JSON files
        babel({
            exclude: 'node_modules/**', // only transpile our source code
            babelHelpers: 'bundled'
        }),
        polyfillNode(), // polyfills Node.js built-ins for browser
        serve({
            open: true,
            contentBase: ['dist'],
            port: 5500 // Change the port number here
        }),
        livereload({
            watch: 'dist'
        })
    ],
    watch: {
        include: 'src/**'
    }
};
