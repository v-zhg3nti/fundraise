interface ICustomer {
  firstName: string;
  lastName: string;
  email: string;
  address: ICustomerAddress;
  isAnonymized: boolean;
}

interface ICustomerAddress {
  line1: string;
  line2: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
}

export { ICustomer };
