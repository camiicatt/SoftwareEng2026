// lib/productMeta.ts

export type ProductMeta = {
  releaseDate: string; 
  releaseYear: number;
  label: string;
  tags: string[];
  highlightTracks: string[];
  albumBlurb: string;
  artistBio: string;
  funFacts: string[];
};

function norm(s: string) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // removes spaces, $, !, &, etc
}

function makeKey(title: string, artist: string) {
  return `${norm(artist)}__${norm(title)}`;
}

export function prettyUnknownAlbumBlurb(title: string, artist: string) {
  return `${title} by ${artist}. A solid pick for your collection.`;
}

export function prettyUnknownArtistBio(artist: string) {
  return `${artist} is an artist with a distinct sound and a loyal fanbase.`;
}

const META: Record<string, ProductMeta> = {
  // 1
  [makeKey("Take Me Back to Eden", "Sleep Token")]: {
    releaseDate: "May 19, 2023",
    releaseYear: 2023,
    label: "Spinefarm Records",
    tags: ["Alternative metal", "Progressive", "Pop/R&B influence", "Cinematic"],
    highlightTracks: ["Chokehold", "The Summoning", "Granite"],
    albumBlurb:
      "A genre bending, cinematic album that moves between heavy riffs, soft R&B leaning melodies, and massive atmospheric builds. It is dramatic, emotional, and built for repeat listens.",
    artistBio:
      "Sleep Token is an anonymous UK band known for mixing heavy modern metal with R&B and pop textures, using mystery and atmosphere as part of the experience.",
    funFacts: [
      "Known for switching styles mid song without warning",
      "Often described as one of the most genre blending modern rock acts",
    ],
  },

  // 2
  [makeKey("Brand New Eyes", "Paramore")]: {
    releaseDate: "September 29, 2009",
    releaseYear: 2009,
    label: "Fueled by Ramen",
    tags: ["Pop punk", "Alternative rock", "Emo pop", "High energy"],
    highlightTracks: ["Ignorance", "Brick by Boring Brick", "The Only Exception"],
    albumBlurb:
      "Sharp guitars, big hooks, and emotionally direct writing. This album is the classic Paramore balance of aggression and melody, with some of their most iconic choruses.",
    artistBio:
      "Paramore is an American rock band led by Hayley Williams, known for punchy pop punk songwriting, big live energy, and a catalog full of era defining hits.",
    funFacts: [
      "A fan favorite era for Paramore’s heavier pop punk sound",
      "Packed with instantly recognizable hooks",
    ],
  },

  // 3
  [makeKey("Currents", "Tame Impala")]: {
    releaseDate: "July 17, 2015",
    releaseYear: 2015,
    label: "Modular Recordings (Interscope in the US)",
    tags: ["Psychedelic pop", "Synth pop", "Disco", "Dreamy"],
    highlightTracks: ["Let It Happen", "The Less I Know the Better", "Eventually"],
    albumBlurb:
      "A sleek, synth driven pivot that blends psychedelic textures with pop structure. It feels warm, hypnotic, and modern, with songs built for both headphones and car speakers.",
    artistBio:
      "Tame Impala is Kevin Parker’s studio project. He writes, records, and produces the music, known for psychedelic sound design and pop forward songwriting.",
    funFacts: [
      "Marked the project’s big shift toward synth heavy pop",
      "Often cited as a defining modern psych pop album",
    ],
  },

  // 4
  [makeKey("The Stranger", "Billy Joel")]: {
    releaseDate: "September 29, 1977",
    releaseYear: 1977,
    label: "Columbia Records",
    tags: ["Rock", "Pop rock", "Singer songwriter", "Classic"],
    highlightTracks: ["Vienna", "Just the Way You Are", "Scenes from an Italian Restaurant"],
    albumBlurb:
      "A classic front to back record with storytelling, piano driven grooves, and huge timeless songs. It is one of the essential “own it on vinyl” albums.",
    artistBio:
      "Billy Joel is an American singer songwriter known for piano rock classics, vivid storytelling, and one of the most recognizable catalogs in pop and rock history.",
    funFacts: [
      "One of Joel’s defining albums",
      "Full of songs that became staples for decades",
    ],
  },

  // 5
  [makeKey("Wiped Out!", "The Neighbourhood")]: {
    releaseDate: "October 30, 2015",
    releaseYear: 2015,
    label: "Columbia Records",
    tags: ["Alternative rock", "Indie pop", "Moody", "Late night vibes"],
    highlightTracks: ["R.I.P. 2 My Youth", "Daddy Issues", "The Beach"],
    albumBlurb:
      "Dark, glossy, and atmospheric. It blends alt rock with pop structure and a moody emotional tone that feels like a neon night drive.",
    artistBio:
      "The Neighbourhood is an American alternative band known for cinematic production, emotional songwriting, and a signature black and white aesthetic.",
    funFacts: [
      "A major mood album for the mid 2010s alt scene",
      "Often revisited as a late night headphone record",
    ],
  },

  // 6
  [makeKey("Being So Normal", "Peach Pit")]: {
    releaseDate: "September 18, 2017",
    releaseYear: 2017,
    label: "Kingfisher Bluez",
    tags: ["Indie rock", "Jangly", "Warm", "Melodic"],
    highlightTracks: ["Drop the Guillotine", "Alrighty Aphrodite", "Tommy's Party"],
    albumBlurb:
      "A clean indie debut with bright guitars and bittersweet lyrics. It is catchy without feeling forced, and it has that effortless “band in a room” energy.",
    artistBio:
      "Peach Pit is a Canadian indie band known for melodic guitar lines, emotionally honest writing, and songs that feel sunny and sad at the same time.",
    funFacts: [
      "A breakout indie record that introduced their signature sound",
      "Beloved for its mix of chill grooves and emotional storytelling",
    ],
  },

  // 7
  [makeKey("Because The Internet", "Childish Gambino")]: {
    releaseDate: "December 10, 2013",
    releaseYear: 2013,
    label: "Glassnote Records",
    tags: ["Hip hop", "Alternative rap", "Conceptual", "Cinematic"],
    highlightTracks: ["3005", "Sweatpants", 'Telegraph Ave. ("Oakland" by Lloyd)'],
    albumBlurb:
      "A concept heavy album that feels like a snapshot of being online and emotionally disconnected. It mixes rap, melody, and atmosphere into a very “world building” experience.",
    artistBio:
      "Childish Gambino is Donald Glover’s music project, blending rap, singing, and experimental ideas across multiple genres and eras.",
    funFacts: [
      "Came with extra story content in its original rollout",
      "Still considered one of his most concept driven projects",
    ],
  },

  // 8
  [makeKey("Thy Kingdom Come", "$uicideboy$")]: {
    releaseDate: "August 1, 2025",
    releaseYear: 2025,
    label: "G*59 Records",
    tags: ["Trap", "Southern hip hop", "Horrorcore", "Dark"],
    highlightTracks: ["Count Your Blessings", "Napoleon", "Now and at the Hour of Our Death"],
    albumBlurb:
      "Dark, heavy, and emotional trap with raw delivery and intense production. It’s built for fans of aggressive energy and bleak atmosphere.",
    artistBio:
      "$uicideboy$ is a New Orleans duo known for mixing hard trap production with darker themes and a cult following built from independent releases.",
    funFacts: [
      "A later era release that leans into their darkest moods",
      "Released through their own label G*59",
    ],
  },

  // 9
  [makeKey("Demon Days", "Gorillaz")]: {
    releaseDate: "May 11, 2005",
    releaseYear: 2005,
    label: "Parlophone / Virgin",
    tags: ["Alternative", "Art pop", "Hip hop influence", "Iconic"],
    highlightTracks: ["Feel Good Inc.", "DARE", "Dirty Harry"],
    albumBlurb:
      "A classic that blends pop hooks with alternative textures and hip hop DNA. It is weird in the best way, but still full of huge songs.",
    artistBio:
      "Gorillaz is a virtual band created by Damon Albarn and Jamie Hewlett, known for mixing genres and collaborating across pop, rap, and alternative worlds.",
    funFacts: [
      "One of the most iconic alternative pop albums of the 2000s",
      "Packed with features and genre crossovers",
    ],
  },

  // 10
  [makeKey("Static & Silence", "The Sundays")]: {
    releaseDate: "September 22, 1997",
    releaseYear: 1997,
    label: "Parlophone / Geffen",
    tags: ["Dream pop", "Indie pop", "Soft rock", "Warm"],
    highlightTracks: ["Summertime", "Cry", "Monochrome"],
    albumBlurb:
      "Soft, intimate, and beautifully written. It feels calm and reflective, like rainy day music with gentle guitars and a timeless voice.",
    artistBio:
      "The Sundays were a British band known for Harriet Wheeler’s vocals, jangly guitars, and dream pop songwriting that still feels fresh decades later.",
    funFacts: [
      "Their final studio album",
      "A cult classic for dreamy 90s guitar pop",
    ],
  },

  // 11
  [makeKey("Spring Came, Rain Fell", "Club 8")]: {
    releaseDate: "2002",
    releaseYear: 2002,
    label: "Labrador (Hidden Agenda in the US)",
    tags: ["Indie pop", "Chillout", "Soft electronic touches", "Scandinavian"],
    highlightTracks: ["We're Simple Minds", "Spring Came, Rain Fell", "Close To Me"],
    albumBlurb:
      "Light, airy indie pop with subtle electronic flavor. It’s soft and romantic, with melodies that feel calm but emotionally heavy underneath.",
    artistBio:
      "Club 8 is a Swedish duo known for elegant indie pop, soft vocals, and a dreamy European sound that sits between pop and chillout.",
    funFacts: [
      "A fan favorite era for their softer, chill pop direction",
      "Often compared to other Scandinavian indie pop classics",
    ],
  },

  // 12
  [makeKey("Choke Enough", "Oklou")]: {
    releaseDate: "February 7, 2025",
    releaseYear: 2025,
    label: "True Panther Sounds",
    tags: ["Synth pop", "Hyperpop", "Art pop", "Dreamy"],
    highlightTracks: ["family and friends", "harvest sky", "take me by the hand"],
    albumBlurb:
      "Soft, futuristic pop that feels airy and emotional. It mixes glossy synth sound design with intimate vocals and a dreamy, weightless vibe.",
    artistBio:
      "Oklou is a French musician and producer known for dreamy electronic pop that blends modern club textures with soft, emotional songwriting.",
    funFacts: [
      "Debut studio album",
      "Supported by multiple singles before release",
    ],
  },

  // 13
  [makeKey("333", "Bladee")]: {
    releaseDate: "July 16, 2020",
    releaseYear: 2020,
    label: "Year0001",
    tags: ["Cloud rap", "Ethereal", "Ambient pop edges", "Experimental"],
    highlightTracks: ["Reality Surf", "It Girl", "Noblest Strive"],
    albumBlurb:
      "Floaty, melodic cloud rap with a surreal glow. It feels like digital dream music, with bright synths and a strangely uplifting atmosphere.",
    artistBio:
      "Bladee is a Swedish artist associated with the Drain Gang circle, known for experimental melodies, internet age aesthetics, and genre bending rap.",
    funFacts: [
      "A major fan favorite in Bladee’s catalog",
      "Known for its dreamy, bright sound palette",
    ],
  },

  // 14
  [makeKey("Breath From Another", "Esthero")]: {
    releaseDate: "April 28, 1998",
    releaseYear: 1998,
    label: "WORK Group",
    tags: ["Trip hop", "Acid jazz", "Downtempo", "Lounge"],
    highlightTracks: ["Heaven Sent", "That Girl", "Superheroes"],
    albumBlurb:
      "A sleek, jazzy trip hop classic with smooth grooves, sharp production, and a cinematic late night feel. It’s stylish, soulful, and still sounds modern.",
    artistBio:
      "Esthero is a Canadian singer known for blending pop songwriting with trip hop, jazz, and downtempo production, especially on her influential debut.",
    funFacts: [
      "Often described as a trip hop classic",
      "Known for rich instrumentation and stylish vocal delivery",
    ],
  },

  // 15
  [makeKey("LP! OFFLINE!", "JPEGMAFIA")]: {
    releaseDate: "October 22, 2021",
    releaseYear: 2021,
    label: "Republic / Peggy",
    tags: ["Avant garde rap", "Experimental", "Aggressive", "DIY"],
    highlightTracks: ["HAZARD DUTY PAY!", "TRUST!", "REBOUND!"],
    albumBlurb:
      "Chaotic, funny, sharp, and extremely detailed. This is aggressive experimental rap with constant switch ups, heavy sampling energy, and hard hitting drums.",
    artistBio:
      "JPEGMAFIA is an American producer and rapper known for self produced experimental hip hop, abrasive textures, and a strong DIY attitude.",
    funFacts: [
      "Offline version has differences from the streaming version",
      "Known for wild sampling and unpredictable structure",
    ],
  },

  // 16
  [makeKey("Die Lit", "Playboi Carti")]: {
    releaseDate: "May 11, 2018",
    releaseYear: 2018,
    label: "AWGE / Interscope",
    tags: ["Trap", "Cloud rap influence", "Minimal", "Hype"],
    highlightTracks: ["Long Time (Intro)", "R.I.P.", "Shoota"],
    albumBlurb:
      "A modern trap staple built around vibe, ad libs, and hypnotic production. Minimal but addictive, it’s designed for energy and replay value.",
    artistBio:
      "Playboi Carti is an American rapper known for minimalist, vibe forward trap music, distinctive ad libs, and a strong fashion and culture presence.",
    funFacts: [
      "Surprise released and instantly became a modern staple",
      "Defined a big part of the late 2010s trap sound",
    ],
  },

  // 17
  // NOTE: handle both “The Weeknd” and “TheWeeknd” via normalization
  [makeKey("House of Balloons", "The Weeknd")]: {
    releaseDate: "March 21, 2011",
    releaseYear: 2011,
    label: "XO",
    tags: ["Alternative R&B", "Dream pop", "Dark", "Mixtape era"],
    highlightTracks: ["High for This", "The Morning", "Wicked Games"],
    albumBlurb:
      "The project that kicked off an era. Dark, atmospheric R&B with hazy synths, heavy emotion, and a nightlife storyline that still hits years later.",
    artistBio:
      "The Weeknd is a Canadian singer who helped define modern alternative R&B, known for moody production, big melodies, and cinematic storytelling.",
    funFacts: [
      "Originally self released as a mixtape",
      "Later became part of the Trilogy era",
    ],
  },
};

// extra alias keys so you don’t get mismatches from small DB spelling differences
const ALIASES: Array<[string, string, string, string]> = [
  ["House of Balloons", "TheWeeknd", "House of Balloons", "The Weeknd"],
  ["Wiped Out!", "The Neighborhood", "Wiped Out!", "The Neighbourhood"],
  ["Thy Kingdom Come", "Suicideboys", "Thy Kingdom Come", "$uicideboy$"],
];

for (const [t1, a1, t2, a2] of ALIASES) {
  const k1 = makeKey(t1, a1);
  const k2 = makeKey(t2, a2);
  if (!META[k1] && META[k2]) META[k1] = META[k2];
}

export function getProductMeta(title: string, artist: string): ProductMeta {
  const key = makeKey(title, artist);
  const found = META[key];
  if (found) return found;

  // fallback meta if something new gets added to DB
  return {
    releaseDate: "Unknown",
    releaseYear: 0,
    label: "Unknown",
    tags: ["Vinyl"],
    highlightTracks: [],
    albumBlurb: prettyUnknownAlbumBlurb(title, artist),
    artistBio: prettyUnknownArtistBio(artist),
    funFacts: [],
  };
}