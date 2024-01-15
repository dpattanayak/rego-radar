const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");

const sourceCode = fs.readFileSync(__dirname + "/js/index.js", "utf8");

const obfuscatedCode = JavaScriptObfuscator.obfuscate(sourceCode, {
  debugProtection: true,
  disableConsoleOutput: true,
  debugProtectionInterval: 1000,
});

fs.writeFileSync(
  __dirname + "/js/index.min.js",
  obfuscatedCode.getObfuscatedCode(),
  "utf8"
);
