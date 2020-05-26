import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({ where: { name } });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProduct = await this.ormRepository.findByIds(products);

    return findProduct;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const products_id: string[] = [];
    const products_qtd: number[] = [];

    products.forEach(product => {
      products_id.push(product.id);
      products_qtd.push(product.quantity);
    });

    const findProducts = await this.ormRepository.findByIds(products_id);

    for (let index = 0; index < findProducts.length; index += 1) {
      findProducts[index].quantity -= products_qtd[index];
    }

    await this.ormRepository.save(findProducts);

    return findProducts;
  }
}

export default ProductsRepository;
