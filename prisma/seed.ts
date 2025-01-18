/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

const COMMON_PASSWORD = 'azerty1234';
const ADULT_NAMES = ['Thomas', 'Sophie', 'Marc', 'Julie', 'Pierre', 'Marie', 'Lucas', 'Emma'];
const CHILD_NAMES = ['Leo', 'Alice', 'Hugo', 'Zoe', 'Nathan'];
const CATEGORIES = ['Jouets', 'Livres', 'Vêtements', 'Électronique', 'Sports'];
const ITEMS = [
  'LEGO Star Wars',
  'Harry Potter - Le livre',
  'Nintendo Switch',
  'Ballon de football',
  'Vélo',
  'iPad',
  'Peluche',
  'Jeu de société Monopoly',
  'Livre de contes',
  'Trottinette électrique',
  'Casque audio',
  'Skateboard',
  'Console PS5',
  'Maillot de bain',
  'Robot programmable'
];

async function main() {
  const hashedPassword = await hash(COMMON_PASSWORD, 10);

  // 1. Create adult users
  const adults = await Promise.all(
    ADULT_NAMES.map(async (name, index) => {
      const user = await prisma.user.create({
        data: {
          email: `test-${index + 1}@example.com`,
          password: hashedPassword,
          name,
          bio: `Je suis ${name}, membre de la famille.`,
          birthDate: new Date(1980 + index, 0, 1),
        }
      });
      return user;
    })
  );

  // 2. Create children
  const children = await Promise.all(
    CHILD_NAMES.map(async (name, index) => {
      const child = await prisma.child.create({
        data: {
          firstName: name,
          birthDate: new Date(2015 + index, 0, 1),
        }
      });
      return child;
    })
  );

  // 3. Set up family relationships
  // First couple with 2 children
  await prisma.partnerInvitation.create({
    data: {
      fromUserId: adults[0].id,
      toUserId: adults[1].id,
      email: `test-2@example.com`,
      status: 'ACCEPTED'
    }
  });

  // Second couple
  await prisma.partnerInvitation.create({
    data: {
      fromUserId: adults[2].id,
      toUserId: adults[3].id,
      email: `test-4@example.com`,
      status: 'ACCEPTED'
    }
  });

  // First couple with 2 children
  await prisma.child.update({
    where: { id: children[0].id },
    data: { parents: { connect: [{ id: adults[0].id }, { id: adults[1].id }] } }
  });
  await prisma.child.update({
    where: { id: children[1].id },
    data: { parents: { connect: [{ id: adults[0].id }, { id: adults[1].id }] } }
  });

  // Second couple with 1 child
  await prisma.child.update({
    where: { id: children[2].id },
    data: { parents: { connect: [{ id: adults[2].id }, { id: adults[3].id }] } }
  });

  // Single parent with 2 children
  await prisma.child.update({
    where: { id: children[3].id },
    data: { parents: { connect: [{ id: adults[4].id }] } }
  });
  await prisma.child.update({
    where: { id: children[4].id },
    data: { parents: { connect: [{ id: adults[4].id }] } }
  });

  // 4. Create wishlists for all users
  // For adults
  for (const adult of adults) {
    const wishlist = await prisma.wishList.create({
      data: {
        title: `Liste de souhaits de ${adult.name}`,
        userId: adult.id,
      }
    });

    // Add random categories and items
    for (let i = 0; i < 10; i++) {
      const useCategory = Math.random() > 0.5;
      if (useCategory) {
        const category = await prisma.category.create({
          data: {
            name: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
            order: i,
            wishlistId: wishlist.id,
          }
        });

        await prisma.wishlistItem.create({
          data: {
            name: ITEMS[Math.floor(Math.random() * ITEMS.length)],
            order: i,
            wishlistId: wishlist.id,
            categoryId: category.id,
            comment: Math.random() > 0.5 ? 'J\'aimerais beaucoup avoir ceci!' : undefined,
          }
        });
      } else {
        await prisma.wishlistItem.create({
          data: {
            name: ITEMS[Math.floor(Math.random() * ITEMS.length)],
            order: i,
            wishlistId: wishlist.id,
            comment: Math.random() > 0.5 ? 'J\'aimerais beaucoup avoir ceci!' : undefined,
          }
        });
      }
    }
  }

  // For children
  for (const child of children) {
    const wishlist = await prisma.wishList.create({
      data: {
        title: `Liste de souhaits de ${child.firstName}`,
        childId: child.id,
      }
    });

    // Add random categories and items
    for (let i = 0; i < 10; i++) {
      const useCategory = Math.random() > 0.5;
      if (useCategory) {
        const category = await prisma.category.create({
          data: {
            name: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
            order: i,
            wishlistId: wishlist.id,
          }
        });

        await prisma.wishlistItem.create({
          data: {
            name: ITEMS[Math.floor(Math.random() * ITEMS.length)],
            order: i,
            wishlistId: wishlist.id,
            categoryId: category.id,
            comment: Math.random() > 0.5 ? 'Je voudrais ça pour mon anniversaire!' : undefined,
          }
        });
      } else {
        await prisma.wishlistItem.create({
          data: {
            name: ITEMS[Math.floor(Math.random() * ITEMS.length)],
            order: i,
            wishlistId: wishlist.id,
            comment: Math.random() > 0.5 ? 'Je voudrais ça pour mon anniversaire!' : undefined,
          }
        });
      }
    }
  }

  // 5. Create the family group with first user as admin and add all other users
  const familyGroup = await prisma.group.create({
    data: {
      name: 'Famille',
      members: {
        create: [
          { userId: adults[0].id, role: 'ADMIN' },
          ...adults.slice(1).map(adult => ({
            userId: adult.id,
            role: 'MEMBER'
          }))
        ]
      }
    }
  });

  console.log(`Created family group with ID: ${familyGroup.id}`);

  // 6. Create Croatia 2025 event
  // const croatiaEvent = await prisma.event.create({
  //   data: {
  //     name: 'Croatie 2025',
  //     groupId: familyGroup.id,
  //     startDate: new Date('2025-04-14'),
  //     endDate: new Date('2025-04-20'),
  //     hasLocation: true,
  //     hasCalendar: true,
  //     hasMenus: true,
  //     hasShopping: true,
  //     hasActivities: true,
  //     hasPhotos: true,
  //     hasAccounts: true,
  //   }
  // });

  // 7. Add locations for Croatia event
  // const locations = [
  //   {
  //     url: 'https://www.airbnb.fr/rooms/43685900?search_mode=regular_search&check_in=2025-04-14&check_out=2025-04-20&source_impression_id=p3_1737145771_P3APow5dzo-aPl_j&previous_page_section_name=1000&federated_search_id=22339ebe-792d-48a3-a6de-0b22d6110840',
  //     amount: 650,
  //     title: 'Location Airbnb 1',
  //     image: 'https://a0.muscache.com/im/pictures/miso/Hosting-43685900/original/ec85ccc0-281c-44fc-a061-bc7e3f4fc4d6.jpeg',
  //   },
  //   {
  //     url: 'https://www.airbnb.fr/rooms/13253519?search_mode=regular_search&check_in=2025-04-14&check_out=2025-04-20&source_impression_id=p3_1737145771_P3vT2kFMvFHtB481&previous_page_section_name=1000&federated_search_id=22339ebe-792d-48a3-a6de-0b22d6110840',
  //     amount: 1267,
  //     title: 'Location Airbnb 2',
  //     image: 'https://a0.muscache.com/im/pictures/0e1dcaab-7c53-4ff9-8b94-eb4a5c1f2db9.jpg',
  //   },
  //   {
  //     url: 'https://www.airbnb.fr/rooms/649596746145899597?search_mode=regular_search&check_in=2025-04-14&check_out=2025-04-20&source_impression_id=p3_1737145771_P3usmzjzKnEbD6S3&previous_page_section_name=1000&federated_search_id=22339ebe-792d-48a3-a6de-0b22d6110840',
  //     amount: 897,
  //     title: 'Location Airbnb 3',
  //     image: 'https://a0.muscache.com/im/pictures/miso/Hosting-649596746145899597/original/a0a87f7e-a150-4f8c-a933-0c9e5c380a0b.jpeg',
  //   }
  // ];

  // for (const location of locations) {
  //   await prisma.location.create({
  //     data: {
  //       eventId: croatiaEvent.id,
  //       url: location.url,
  //       amount: location.amount,
  //       title: location.title,
  //       image: location.image,
  //       createdBy: adults[0].id,
  //       createdAt: new Date(),
  //     }
  //   });
  // }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
