// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import path from "path";

import { useEnvironment } from "./helpers";

describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("storage task", async function () {
      await this.hre.run("clean");
      await this.hre.run("compile");
      await this.hre.run("storage-layout", {
        check: true,
      });
      await this.hre.run("storage-layout", {
        update: true,
      });
    });

    // it("Should add the example field", function () {
    //   assert.instanceOf(
    //     this.hre.example,
    //     ExampleHardhatRuntimeEnvironmentField
    //   );
    // });

    // it("The example filed should say hello", function () {
    //   assert.equal(this.hre.example.sayHello(), "hello");
    // });
  });

  // describe("HardhatConfig extension", function () {
  //   useEnvironment("hardhat-project");

  //   it("Should add the newPath to the config", function () {
  //     assert.equal(
  //       this.hre.config.paths.newPath,
  //       path.join(process.cwd(), "asd")
  //     );
  //   });
  // });
});
