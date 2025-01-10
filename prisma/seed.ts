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

  // Create the family group
  const familyGroup = await prisma.group.create({
    data: {
      name: 'Famille'
    }
  });

  // Create adult users
  const adults = await Promise.all(
    ADULT_NAMES.map(async (name, index) => {
      const user = await prisma.user.create({
        data: {
          email: `test-${index + 1}@example.com`,
          password: hashedPassword,
          name,
          bio: `Je suis ${name}, membre de la famille.`,
          birthDate: new Date(1980 + index, 0, 1),
          groupMemberships: {
            create: {
              groupId: familyGroup.id,
              role: 'MEMBER'
            }
          }
        }
      });
      return user;
    })
  );

  // Create children
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

  // Set up family relationships
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

  // Create wishlists for all users
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
