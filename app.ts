import "dotenv/config";
import { client, init } from "./db/index";
import { generateCustomersBatch } from "./utils";
import { ICustomer } from "./db/types/customers-types";
import {
  COLLECTION_NAME,
  DB_NAME,
  DELAY_BETWEEN_BATCH_INSERT,
} from "./constants";

async function insertCustomersBatch(customersBatch: ICustomer[]) {
  try {
    await client
      .db(DB_NAME)
      .collection(COLLECTION_NAME)
      .insertMany(customersBatch);
    console.log(
      `Inserted ${customersBatch.length} customers in ${COLLECTION_NAME}`
    );
  } catch (error) {
    console.error(`Error inserting customers: ${error}`);
  }
}

async function main() {
  await init();

  setInterval(async () => {
    const customersBatch: ICustomer[] = generateCustomersBatch();
    if (customersBatch.length) {
      await insertCustomersBatch(customersBatch);
    }
  }, DELAY_BETWEEN_BATCH_INSERT);
}

main().catch((error) => {
  console.error(`An error occurred: ${error}`);
  process.exit(1);
});
