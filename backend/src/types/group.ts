import { Field, ObjectType, ID } from 'type-graphql';
import { User } from './user';

@ObjectType()
export class Group {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [GroupMember])
  members: GroupMember[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class GroupMember {
  @Field(() => ID)
  id: string;

  @Field(() => User)
  user: User;

  @Field()
  joinedAt: Date;
}

@ObjectType()
export class GroupInvitation {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  token: string;

  @Field()
  expiresAt: Date;

  @Field(() => Group)
  group: Group;
}