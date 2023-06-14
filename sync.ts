import { DB_NAME } from './constants';
import { init, changeQueue, client } from './db/index';
import { anonymize, generateCustomersBatch } from './utils';

const BATCH_SIZE = 1000;
const BATCH_TIMEOUT = 1000;
const isFullReindex = process.argv.includes('--full-reindex');

async function processChanges() {
  let batch: any[] = [];

  if (isFullReindex) {
    await performFullReindex();
    return;
  }

  while (true) {
    if (changeQueue.length > 0) {
      const change = changeQueue.shift();
      batch.push(change);

      if (batch.length === BATCH_SIZE) {
        anonymizeRecords(batch);
        await insertAnonymizedRecords(batch);
        batch = [];
      }
    } else {
      if (batch.length > 0) {
        anonymizeRecords(batch);
        await insertAnonymizedRecords(batch);
        batch = [];
      }

      await new Promise((resolve) => setTimeout(resolve, BATCH_TIMEOUT));
    }
  }
}

function anonymizeRecords(records: any[]) {
  for (let i = 0; i < records.length; i++) {
    const anonymizedRecord = anonymize(records[i]);
    records[i] = anonymizedRecord;
  }
}

async function insertAnonymizedRecords(records: any[]) {
  try {
    await client
      .db(DB_NAME)
      .collection("customers_anonymised")
      .insertMany(records);
    console.log(`Inserted ${records.length} anonymized records in customers_anonymised`);
  } catch (error) {
    console.error(`Error inserting anonymized records: ${error}`);
  }
}

async function performFullReindex() {
  const customers = generateCustomersBatch();

  while (customers.length > 0) {
    const batch = customers.splice(0, BATCH_SIZE);
    anonymizeRecords(batch);
    await insertAnonymizedRecords(batch);

    console.log(`Processed ${batch.length} customers`);

    if (customers.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_TIMEOUT));
    }
  }

  console.log("Full reindex completed successfully");
  process.exit(0);
}

async function main() {
  await init();
  await processChanges();
}

main().catch((err) => console.error(err));
