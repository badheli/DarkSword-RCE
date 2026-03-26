export default [{
    files: ["**/*.js"],
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "script", // 如果不是模块很重要
        globals: {
            window: "readonly",
            document: "readonly",
            console: "readonly"
        }
    },
    rules: {
        "no-undef": "error"
    }
}];