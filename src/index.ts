import * as core from "@actions/core";
import { run } from "./main";

// Punto de entrada principal de la action
run().catch((error) => {
  core.setFailed(error.message);
  process.exit(1);
});
