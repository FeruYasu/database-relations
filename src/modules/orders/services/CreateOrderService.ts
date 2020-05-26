import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IProductsDTO {
  product_id: string;
  price: number;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    let order;
    const checkOrderExists = await this.ordersRepository.findById(customer_id);

    if (checkOrderExists) {
      throw new AppError('Order already exists');
    }

    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists');
    }

    const orderProducts: IProductsDTO[] = [];

    const productsArray = await this.productsRepository.findAllById(products);

    if (productsArray.length < products.length) {
      throw new AppError('Some products doesnt exists');
    }

    for (let index = 0; index < productsArray.length; index += 1) {
      if (productsArray[index].quantity < products[index].quantity) {
        throw new AppError('Not enough products');
      }

      orderProducts.push({
        price: productsArray[index].price,
        product_id: productsArray[index].id,
        quantity: products[index].quantity,
      });
    }

    if (customer) {
      order = await this.ordersRepository.create({
        customer,
        products: orderProducts,
      });

      await this.productsRepository.updateQuantity(products);
    } else {
      throw new AppError('Invalid Customer ID');
    }

    return order;
  }
}

export default CreateOrderService;
