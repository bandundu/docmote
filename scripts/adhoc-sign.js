const { execFileSync } = require("child_process");
const path = require("path");

// Without any signature, Apple Silicon reports downloaded apps as "damaged".
exports.default = async function (context) {
  if (context.electronPlatformName !== "darwin") return;
  const app = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`
  );
  execFileSync("codesign", ["--force", "--deep", "--sign", "-", app], {
    stdio: "inherit",
  });
};
