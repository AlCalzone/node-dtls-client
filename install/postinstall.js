// @ts-check

/**
 * This installs the node-aead-crypto module on platforms with NodeJS < 10
 * On NodeJS 10, the polyfilled functionality is supported natively
 */

// The desired version of node-aead-crypto
const desiredVersion = "^1.1.3";

const semver = require("semver");
// skip the installation on NodeJS 10+
console.log("node-dtls-client: testing NodeJS version");
if (semver.satisfies(process.version, ">=10")) {
	console.log("  Version >= 10, skipping installation of node-aead-crypto");
	process.exit(0);
} else {
	console.log("  Version < 10, installing node-aead-crypto...");
}

// Install node-aead-crypto package on older NodeJS versions
const { spawn } = require("child_process");

const npmCommand = /^win/.test(process.platform) ? "npm.cmd" : "npm";
// @ts-ignore The last argument is available starting with NodeJS 8
const install = spawn(npmCommand, ["i", `node-aead-crypto@${desiredVersion}`], {windowsHide: true});
install.stdout.pipe(process.stdout);
install.stderr.pipe(process.stderr);
install.on("close", (code, signal) => {
	process.exit(code);
});
