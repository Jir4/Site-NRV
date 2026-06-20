export const site = {
  clubName: "Nancy Roller Vitesse",
  logoUrl: "https://nancyrollervitesse.fr/Images/logowhite400_2.png",
  helloAssoUrl:
    "https://www.helloasso.com/associations/nancy-roller-vitesse/adhesions/adhesion-saison-2026-2027",
  instagramUrl: "https://www.instagram.com/nancy_roller_vitesse/",
  email: "nancyrollervitesse@gmail.com",
  phone: "06.43.34.68.62",
  color: "#95c23d",
  groups: [
    {
      name: "Enfants",
      age: "5 à 12 ans",
      pitch:
        "Découvrir le roller, progresser en confiance et apprendre les bons réflexes.",
      time: "Jeudi 18h - 19h",
      schedule: [
        { label: "Jeudi", time: "18h - 19h", locationIds: ["bazin"] },
      ],
      place: "Gymnase Bazin, 49 rue Henri Bazin, 54000 Nancy",
    },
    {
      name: "Initiation",
      age: "12 ans et plus",
      pitch:
        "Se perfectionner, gagner en aisance et rejoindre une dynamique de club.",
      time: "Jeudi 19h - 20h",
      schedule: [
        { label: "Jeudi", time: "19h - 20h", locationIds: ["bazin"] },
      ],
      place: "Gymnase Bazin, 49 rue Henri Bazin, 54000 Nancy",
    },
    {
      name: "Compétition",
      age: "Patineurs expérimentés",
      pitch:
        "S’entraîner pour la performance, les courses et l’esprit d’équipe.",
      time: "Lundi 19h - 20h30, mercredi 18h - 20h et jeudi 19h - 20h30",
      schedule: [
        { label: "Lundi", time: "19h - 20h30", locationIds: ["moulin-noir"] },
        { label: "Mercredi", time: "18h - 20h", locationIds: ["jacquet"] },
        {
          label: "Jeudi",
          time: "19h - 20h30",
          locationIds: ["moulin-noir", "cosec"],
          note: "Moulin Noir l’hiver ou quand il pleut. COSEC quand il fait beau et chaud.",
        },
      ],
      place:
        "Gymnase du Moulin Noir à Lay-Saint-Christophe et Gymnase Jacquet à Nancy",
    },
  ],
  prices: [
    {
      label: "Enfants & initiation",
      value: "80 €",
      details: "Cotisation annuelle - adhésion club + licence FFRS",
    },
    {
      label: "Compétition",
      value: "150 €",
      details: "Cotisation annuelle - adhésion club + licence FFRS",
    },
  ],
  locations: [
    {
      id: "bazin",
      name: "Gymnase Bazin",
      address: "49 rue Henri Bazin, 54000 Nancy",
      usedBy: "Enfants et initiation",
      type: "indoor",
      usage: "Enfants & initiation · Jeudi",
      conditions: [],
      group: "initiation",
      lat: 48.6970011,
      lon: 6.1943577,
    },
    {
      id: "moulin-noir",
      name: "Gymnase du Moulin Noir",
      address: "Chemin du Moulin Noir, Lay-Saint-Christophe",
      usedBy: "Compétition - lundi / jeudi hiver ou pluie",
      type: "indoor",
      usage: "Lundi · Jeudi",
      conditions: [
        { icon: "rain", label: "Pluie" },
        { icon: "winter", label: "Hiver" },
      ],
      group: "competition",
      lat: 48.7426544,
      lon: 6.1820486,
    },
    {
      id: "jacquet",
      name: "Gymnase Maurice Jacquet",
      address: "Viaduc Louis Marin, 54000 Nancy",
      usedBy: "Compétition - mercredi",
      type: "indoor",
      usage: "Mercredi",
      conditions: [],
      group: "competition",
      lat: 48.7004429,
      lon: 6.1856432,
    },
    {
      id: "cosec",
      name: "Anneau du COSEC",
      address: "1 rue Jean Moulin, 54510 Tomblaine",
      usedBy: "Compétition - jeudi beau temps",
      type: "outdoor",
      usage: "Jeudi",
      conditions: [{ icon: "sun", label: "Beau temps et chaud" }],
      group: "competition",
      lat: 48.6952987,
      lon: 6.2130854,
    },
  ],
  contacts: [
    { role: "Président", name: "BEHR Sylvain", detail: "06.43.34.68.62" },
    { role: "Trésorier", name: "DUPONT Yohann", detail: "" },
    { role: "Secrétaire", name: "ANANI Nicolas", detail: "" },
  ],
  sponsors: ["Ville de Nancy", "Métropole du Grand Nancy"],
};
