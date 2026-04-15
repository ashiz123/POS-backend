import { config } from "dotenv";
import path from "node:path";

export async function setup() {
  console.log(
    process.env.IS_DOCKER === "true"
      ? console.log("docker test running")
      : console.log("local test running"),
  );

  config({ path: path.resolve(process.cwd(), ".env.test") });
}
