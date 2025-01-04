# Application Hubilys

## Infos générales
J'aimerais faire une application de gestion pour ma famille. Le nom de cette application est "Hubilys".
Le choix de technos : next (@lastest) pour le front et le back avec prisma, graphql et postgreSQL pour la base de données. Le css sera géré avec tailwind et shadcn.
L'application doit être contenérisée avec docker.
L'application doit utiliser i8n pour pouvoir être traduite en anglais plus tard. Pour l'instant, tout doit être rédigé avec des clés en français.
Faire en sorte que l'application respecte le référentiel WCAG afin qu'elle soit 100% accessible.

Maintenant, voilà l'application et ses différentes fonctionnalités.


## Fonctionnalités générales :
- La page d'accueil est un formulaire de connexion/inscription.
- Chaque utilisateur doit se créer un compte avec adresse mail et mot de passe, le tout sécurisé avec des tokens jwt pour les sessions de connexion.
- Une fois connecté, l'utilisateur arrive sur un dashboard qui lui permet de gérer ses information et accéder aux différentes fonctionnalités dui seront listées ensuite.


## Fonctionnalités dashboard utilisateur :
- La fiche utilisateur est présentée avec un avatar et une date de naissance. En plus l'utilisateur peut décider de rédiger une petite bio ou "humeur du jour" qui sera affichée en dessous.
- L'utilisateur peut aussi renseigner avec qui il est en couple
- Il peut ajouter des enfants.
- Si l'utilisteur est en couple, son partenaire peut aussi gérer les enfants.
- Sur sa page d'acceuil, l'utilisateur peur créer et gérer ses listes de souhait.
- Sur sa page d'acceuil, l'utilisateur peut créer et accéder à ses groupes.
- Sur sa page d'acceuil, l'utilisateur peut créer et accéder à ses événements indépendants.

### Liste de souhait
- Chaque utilisateur peut créer une ou plusieurs listes de souhaits pour des cadeaux. Chaque liste a un id spécifique.
- Sur cette liste il peut ajouter de nouveaux item avec un champ de nom, un lien vers le cadeau désiré et un commentaire pour donner des précisions.
- Il peut aussi créer des catégories pour regrouper les cadeaux par catégorie et réorganiser cette liste avec des glisser-déposer.
- Seul l'utilisateur propriétaire du compte peut ajouter ou supprimer des cadeaux de la liste.
- Chaque liste à un accès publique pour être visible par des utilisteurs non connectés.
- Cette version publique se présente sous forme de liste avec une case à cocher pour que d'autres utilisateurs puissent informer qu'un cadeau a été choisi et un champ pour renseigner leur nom.
- L'utilisateur peut aussi ajouter une liste souhaits pour chacun de ses enfants. Cette liste s'affichera de la même manière et pourra être gérée par les deux parents si un conjoint est renseigné.

### Chat
- L'utilisateur à accès à un chat.
- Le chat permet de discuter directement avec un autre utilisateur.
- Le chat a aussi des conversations de groupe disponible en fonction des groupes auxquel il appartient.

### Groupe
- L'utilisateur peut créer un groupe ou accéder à un groupe auquel il appartient.

### Evenements
- L'utilisateur peut créer un nouvel événement indépendant d'un groupe et inviter des utilisteurs par mail.


## Fonctionnalités du groupe :
- Un utilisateur peut créer un groupe. Il peut envoyer cette invitation par mail ou partager un lien d'invitation qui a une limite de validité de 48h.
- Chaque groupe est privé et ne peut être vu que par les utilisateur ayant accepté l'invitation.
- Il n'y a pas d'administrateur sur le groupe, tous les membres du groupe peuvent interagir avec toutes les fonctionnalités du groupe.
- Seule la "suppression" du groupe doit être validée par au moins 50% des utilisateurs du groupe afin d'être effective.
- La page d’accueil du groupe présente des cartes avec tous les utilisateurs par ordre alphabétique des prénoms, et ces cartes sont cliquables et permettent de se rendre sur une fiche utilisateur.
- Elle présente aussi des boutons de redirection et gestion des fonctionnalités de groupe. Sur la droite, il y a une barre lattérale avec le chat de groupe et la possibilité pour les utlisateurs d'ajouter des messages.

### Secret santa
- Il doit y avoir la possibilité de lancer un "secret santa" entre les membres du groupe.
- Un utilisateur ne doit pas pouvoir tomber sur le même secret que les deux années précédentes ou sur son conjoint.
- Le résultat du secret est affiché sur la fiche de l'utilisateur, masqué par défault, avec un bouton pour démasquer le résultat.

### Evènements
- L'utilisateur voit une liste des derniers événements avec la possibilité de tous les afficher.
- Créer un nouvel événement : les utilisteurs doivent pouvoir créer un nouvel événement en renseignant un nom et la plage de dates de l'événement et une option "vacances en location". 


## Fonctionnalités événement :
- Les événements peuvent être liés à un groupe ou être créé de manière indépendante par un utilisateur. Si un événement est créé de manière indépendante par un utilisateur, il sera affiché directement sur la page des utilisateurs liés à cet événement.
- Page d'un événement : il y a des onglets en bas de page qui permettent de naviguer entre les différentes vues et fonctionnalités de l'événement : choix de la location (seulement si la case "vacances en location" a été cochée), calendrier des présences, Menus du calendrier, liste de course, Calendrier des activités, photos de l'événement, comptes de l'événements.

### Choix de la location :
- Sur la page de choix de la location, il y a une barre latérale qui permet de définir et visualiser les sous-groupes par foyer. Par exemple si deux utilisateur sont en couple avec des enfants, cela est considéré comme un "foyer".
- On peut aussi définir les règles de gestion : combien de part vaut un adulte et combien de part valent les enfants, combien de votes sont possibles par utilisateurs. Si le champ des vote est laissé libre ou à zéro, les utilisateurs n'ont pas de limite de vote.
- Chaque utilisateur peut ajouter une ou plusieurs proposition pour une location en renseignant un lien et la montant de la location.
- Les locations sont ajoutées sous forme de carte. La carte affiche l'image et le titre récupérés via la lien.
- Chaque utilisateur peut voter en positif  ou en négatif pour une location. Un vote positif vaut un point un vote négatif vaut -1 point.
- Il y a aussi un bouton "Voir le détail" qui renvoit vers le lien renseigné lors de l'ajoute de la location.
- Les location sont affichées par ordre de points.
- Quand un carte de location est séléctionnée, le montant calculé par sous-groupe s'affiche dans la barre lattérale.

### Calendrier des présences :
- C'est un calendier qui couvre les dates de l'événement et qui permet aux utilisateurs de renseigner leur présence sur l'événement.
- Un utilisateur peut ajouter le présence de son conjoint et des enfants.
- Un utilisateur peur modifier à postériori sa présence, celle de son conjoint ou des enfants.
- Le calendrier permet de faire la distinction entre les présence le midi et le soir pour chaque jour pour la gestion des repas.

### Menus du calendrier :
- Le calendrier des menus affiche deux cases par jour pour le midi et le soir.
- Chaque utilisteur peut s'inscrire pour un repas, y ajouter un titre et y coller le lien d'une recette.
- Il peut aussi ajouter les ingrédients nécessaires pour la recette qui s'ajouteront à la liste de course générale.
- La calendrier s'affiche avec les recettes déjà présentes, avec l'information de qui la préparera et des cases vides sur lequelles cliquer pour ajouter un nouveau plat.

### Liste de course
- C'est la liste de course générale de toutes les recettes de l'événement.
- On peut ajouter un "tag" aux ingrédients, pour regrouper les éléments par catégorie.
- On peut ajouter des ingrédients supplémentaires
- On doit pouvoir y ajouter une quantité

### Calendrier des activités :
Cette page est divisée en 2 : 2 tiers, 1 tier.
- Sur la gauche un calendrier de l'événement divisé par demi-journée. Sur la droite une carte.
- Les utilisateurs peuvent ajouter de propositions d'activité à la journée ou à la demi journée, avec un titre, ajouter un lien vers l'activité, un lieu et un prix par personne (distinction entre bébés, enfants et adultes). Seuls le titre et le lien sont obligatoires.
- Lorsqu'un utilisateur sélectionne une activité dans le calendrier, la carte se met à jour si besoin sur le lieu de l'activité et sous la carte s'affiche un récapitulatif des informations de l'acitivité avec un bouton de redierction vers le lien.

### Photos de l'événement :
- Cet onglet permet aux utilisateur de consulter et ajouter des photos de l'événement
- pour stoquer les photos, les utilisateurs peuvent se connecter à un service comme google drive, apple photo ou dropbox.
- Les photos sont classées par ordre chronologique grâces aux informations stockées par les images
- Les photos sont affichées comme un album photo de l'événement.

### Comptes de l'événements :
- comme un tricount, les utilisateurs peuvent ajouter des dépenses en assignant qui est concerné par cette dépense pour permettre de faire les comptes à la fin de l'événement.


## Master :
- créer moi aussi un compte admin master.
- L'admin master à accès à un tableau de bord qui lui permet de voir le nombre d’utilisateurs dans le temps et le nombre de groupes dans le temps grâce à des graphiques.
- Il a aussi accès à une liste de tous les groupes avec un flitre de recherche dynamique et la possibilité de supprimer les groupes, un à un ou par lot (case à cocher).
- Il peut créer un groupe et assigner des utilisateurs sur ce groupe.
- Il a aussi accès à une liste de tous les utilisateurs avec un flitre de recherche dynamique et la possibilité de supprimer les utilisateurs, un à un ou par lot (case à cocher).
- Il peut créer un utilisateur avec une nouvelle adresse mail, qui enverra un message à cette adresse mail pour l'informer de la création de son compte et d'un lien pour créer un mot de passe et accéder à la plateforme