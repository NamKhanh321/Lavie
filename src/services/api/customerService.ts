import apiClient from './client';

export interface Customer {
  _id: string;
  name: string;
  type: 'retail' | 'agency';
  phone: string;
  address: string;
  debt: number;
  empty_debt: number;
  userId?: string; // ID of the user associated with this customer
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerCreate {
  name: string;
  type: 'retail' | 'agency';
  userId?: string;
  debt?: number;
  phone?: string;
  address?: string;
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const response = await apiClient.get('/customers');
    return response.data;
  },

  async getCustomerById(id: string): Promise<Customer> {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  async createCustomer(customerData: CustomerCreate): Promise<Customer> {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  },

  async updateCustomer(id: string, customerData: Partial<CustomerCreate>): Promise<Customer> {
    const response = await apiClient.put(`/customers/${id}`, customerData);
    return response.data;
  },

  async deleteCustomer(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;
