import { PrismaService } from '../../../prisma.service';
import { CreateAndSaveCardDTO } from '../dtos/request/create-card-request.dto';
import { FindAllCardsDTO } from '../dtos/request/find-all-cards-request.dto';
import { CardEntityInterface } from '../interfaces/card-entity.interface';
import { CardRepositoryInterface } from './interfaces/card-repository.interface';

export class CardRepository implements CardRepositoryInterface {
  constructor(private prisma: PrismaService) {}

  async createAndSave({
    description,
    status,
    title,
    user_id,
    category_ids,
  }: CreateAndSaveCardDTO): Promise<CardEntityInterface> {
    return this.prisma.cards.create({
      data: {
        description,
        status,
        title,
        user_id,
        category_ids,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async updateAndSave(card: CardEntityInterface): Promise<CardEntityInterface> {
    const { id, ...data } = card;

    const { categories, ...rest } = data;

    return this.prisma.cards.update({
      where: { id: card.id },
      data: rest,
    });
  }

  async findById(id: string): Promise<CardEntityInterface | null> {
    const card = await this.prisma.cards.findUnique({ where: { id: id } });

    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: card.category_ids,
        },
      },
    });

    return {
      ...card,
      categories,
    };
  }

  async findAll({
    id,
    description,
    status,
    title,
    user_id,
  }: FindAllCardsDTO): Promise<CardEntityInterface[]> {
    return this.prisma.cards.findMany({
      where: {
        user_id: { equals: user_id },
        id: id ? { equals: id } : undefined,
        description: description
          ? { contains: description.toLowerCase() }
          : undefined,
        status: status ? { equals: status } : undefined,
        title: title ? { contains: title.toLowerCase() } : undefined,
      },
    });
  }

  async deleteCard(card: CardEntityInterface): Promise<void> {
    await this.prisma.cards.delete({
      where: { id: card.id },
    });
  }
}
