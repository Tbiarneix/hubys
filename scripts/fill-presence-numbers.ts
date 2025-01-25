import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer toutes les présences
  const presences = await prisma.subgroupPresence.findMany({
    include: {
      subgroup: true
    }
  });

  console.log(`Found ${presences.length} presences to update`);

  // Pour chaque présence
  for (const presence of presences) {
    const totalActive = presence.subgroup.activeAdults.length + presence.subgroup.activeChildren.length;

    // Mettre à jour les nombres en fonction des booléens lunch et dinner
    await prisma.subgroupPresence.update({
      where: {
        id: presence.id
      },
      data: {
        lunchNumber: presence.lunch ? totalActive : 0,
        dinnerNumber: presence.dinner ? totalActive : 0
      }
    });
  }

  console.log('All presences have been updated');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
