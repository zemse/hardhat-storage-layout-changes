import chalk from "chalk";
import { Verbosity, Results } from "../types";

export function printResults(results: Results, verbosity: Verbosity) {
  const printError = ["error", "warning", "info"].includes(verbosity);
  const printWarning = ["warning", "info"].includes(verbosity);
  const printInfo = ["info"].includes(verbosity);

  const INDENT = "  ";
  for (const [type, message, depth] of results) {
    if (type === "error" && printError) {
      console.log(INDENT.repeat(depth), chalk.red(message));
    }
    if (type === "warning" && printWarning) {
      console.log(INDENT.repeat(depth), chalk.yellow(message));
    }
    if (type === "info" && printInfo) {
      console.log(INDENT.repeat(depth), message);
    }
  }
}
