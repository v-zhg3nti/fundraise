import crypto from "crypto";
import { faker } from "@faker-js/faker";
import { ICustomer } from "../db/types/customers-types";

export function anonymize(customerData: any) {
  const obj: ICustomer = {
    firstName: hash(customerData.firstName),
    lastName: hash(customerData.lastName),
    email: "",
    address: {
      line1: "",
      line2: "",
      postcode: "",
      city: "",
      state: "",
      country: "",
    },
    isAnonymized: false,
  };

  const emailParts = customerData.email.split("@");

  if (emailParts.length === 2) {
    const userName = hash(emailParts[0]);
    obj.email = `${userName}@${emailParts[1]}`;
  }

  obj.address.line1 = hash(customerData.address.line1);
  obj.address.line2 = hash(customerData.address.line2);

  return obj;
}

export function hash(str: string) {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  const charsSet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const anonymizedString = Array.from({ length: 8 }, (_, index) => {
    const charIndex = parseInt(hash.charAt(index), 16) % charsSet.length;
    return charsSet[charIndex];
  }).join("");

  return anonymizedString;
}

export function generateCustomersBatch(): ICustomer[] {
  const customers: ICustomer[] = [];
  const batchSize = Math.floor(Math.random() * 10);

  for (let i = 0; i < batchSize; i++) {
    const customer = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      address: {
        line1: faker.location.streetAddress(),
        line2: faker.location.streetAddress(),
        postcode: faker.location.zipCode(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
      },
      isAnonymized: false,
    };

    customers.push(customer);
  }
  return customers;
}
