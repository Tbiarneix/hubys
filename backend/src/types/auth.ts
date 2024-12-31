import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class AuthResponse {
  @Field()
  token: string;

  @Field()
  user: User;
}

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  birthDate?: Date;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  avatar?: string;
}