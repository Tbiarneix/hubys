import { Field, ObjectType, ID } from 'type-graphql';
import { User } from './user';
import { Group } from './group';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  user: User;

  @Field(() => Group)
  group: Group;

  @Field()
  createdAt: Date;
}