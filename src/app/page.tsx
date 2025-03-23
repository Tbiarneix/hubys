"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "@/components/Modal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-[#fff3eb] z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.webp" alt="Hubys Logo" width={40} height={40} />
            <span className="text-2xl font-bold">Hubys</span>
          </div>
          <button 
            onClick={openModal}
            className="bg-[#ffc49d] hover:bg-[#ffb784] px-6 py-2 rounded-full font-medium transition-colors"
          >
            S'inscrire
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="p-48 px-4 bg-[#fff3eb] rounded-hero">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              L'application tout-en-un pour simplifier vos moments partagés
            </h1>
            <p className="text-xl mb-8 text-gray-700">
              Organisez vos événements et partagez des
              moments entre amis ou en famille en toute simplicité.
            </p>
            <button 
              onClick={openModal}
              className="bg-[#ffc49d] hover:bg-[#ffb784] px-8 py-3 rounded-full font-medium text-lg transition-colors"
            >
              Commencer l'aventure
            </button>
          </div>
          <div className="flex-1">
            <Image
              src="/hero-image.svg"
              alt="Hubys App Interface"
              width={800}
              height={600}
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Une solution complète pour tous vos besoins
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">
                Gestion Personnelle
              </h3>
              <p className="text-gray-600 mb-6">
                Seul, en couple ou en famille ? Créez votre profil et
                centralisez vos activités.
              </p>
              <div className="flex justify-center">
                <Image
                  src="/personal-management.svg"
                  alt="Gestion personnelle"
                  width={200}
                  height={160}
                  className="mt-4"
                />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">
                Expérience de Groupe
              </h3>
              <p className="text-gray-600 mb-6">
                Calendrier, listes paratagées : organiser votre quotidien n'a
                jamais été aussi simple.
              </p>
              <div className="flex justify-center">
                <Image
                  src="/group-experience.svg"
                  alt="Expérience de groupe"
                  width={200}
                  height={160}
                  className="mt-4"
                />
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4">
                Gestion d'Événements
              </h3>
              <p className="text-gray-600 mb-6">
                Planifiez et gérez vos événements de A à Z sans prise de tête.
              </p>
              <div className="flex justify-center">
                <Image
                  src="/event-management.svg"
                  alt="Gestion d'événements"
                  width={200}
                  height={160}
                  className="mt-4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Feature Cards */}
      <section className="py-16 px-4 mb-12 overflow-hidden ">
        <div className="container p-16 mx-auto bg-[#ffc49d] rounded-large">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Découvrez nos fonctionnalités
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Organisation d'Événements",
                description:
                  "Gérez les présences, les repas et les courses en quelques clics.",
              },
              {
                title: "Choisissez votre location",
                description:
                  "Fini les fils whatsapp interminables et désorganisés, mettez vous d'accord sur votre location en toute simplicité.",
              },
              {
                title: "Activités de Groupe",
                description:
                  "Planifiez et organisez vos activités en groupe facilement pour vos événements.",
              },
              {
                title: "Gestion des Comptes",
                description:
                  "Suivez facilement les dépenses et les partages de frais.",
              },
              {
                title: "Liste de souhaits",
                description:
                  "Gérez et partagez vos listes de souhaits en un clic et pour toute la famille !",
              },
              {
                title: "Secret Santa",
                description:
                  "Organisez vos Secret Santa pour chaque groupe de manière automatique.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md min-h-[180px] flex flex-col hover:scale-105 transition-transform"
              >
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-[#ffc49d]/20 rounded-footer">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Prêt à vous simplifier la vie ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez Hubys aujourd'hui et découvrez comment nous pouvons vous
            aider à mieux organiser vos moments en famille et entre amis.
          </p>
          <button 
            onClick={openModal}
            className="bg-[#ffc49d] hover:bg-[#ffb784] px-8 py-3 rounded-full font-medium text-lg transition-colors"
          >
            Créer mon compte gratuitement
          </button>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
