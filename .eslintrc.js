module.exports = {
    "env": {
        "browser": true,
				"es6": true,
				'jquery':true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 6
    },
    "rules": {
        "indent": [ "error", "tab", { 'SwitchCase':1 } ],
        "linebreak-style": [ "error", "unix" ],
        "quotes": [ "error", "single" ],
        "semi": [ "error", "always" ],
				'no-console': ['error', { 'allow':['warn', 'error'] }]
    }
};
