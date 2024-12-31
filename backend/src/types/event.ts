import { Field, ObjectType, ID } from 'type-graphql';
import { Group } from './group';
import { User } from './user';

@ObjectType()
export class Event {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field()
  isVacation: boolean;

  @Field(() => Group, { nullable: true })
  group?: Group;

  @Field(() => [EventParticipant])
  participants: EventParticipant[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class EventParticipant {
  @Field(() => ID)
  id: string;

  @Field(() => User)
  user: User;

  @Field()
  presence: string; // JSON stockant les présences midi/soir
}