import { exec } from "child_process";
import { afterAll } from "vitest";

function execute(cmd: string) {
  console.log(cmd);
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

afterAll(async () => {
  await execute("docker compose down");
}, 30 * 1000);
