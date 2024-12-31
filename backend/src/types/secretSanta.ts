import { Field, ObjectType, ID } from 'type-graphql';
import { User } from './user';
import { Group } from './group';

@ObjectType()
export class SecretSanta {
  @Field(() => ID)
  id: string;

  @Field(() => Group)
  group: Group;

  @Field()
  year: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class SecretSantaAssignment {
  @Field(() => ID)
  id: string;

  @Field(() => SecretSanta)
  secretSanta: SecretSanta;

  @Field(() => User)
  giver: User;

  @Field(() => User)
  receiver: User;

  @Field()
  createdAt: Date;
}