const PRODUCTS = {
  spaghetti:{name:"Spaghetti",cat:"pasta",pack:500,unit:"g",prices:{conad:1.35,lidl:1.15,eurospin:0.95,sole365:1.19,piccolo:1.25,deco:1.29}},
  penne:{name:"Penne rigate",cat:"pasta",pack:500,unit:"g",prices:{conad:1.32,lidl:1.12,eurospin:0.92,sole365:1.15,piccolo:1.22,deco:1.25}},
  riso:{name:"Riso",cat:"pasta",pack:1000,unit:"g",prices:{conad:2.49,lidl:2.19,eurospin:1.99,sole365:2.29,piccolo:2.39,deco:2.45}},
  passata:{name:"Passata di pomodoro",cat:"verdure",pack:700,unit:"g",prices:{conad:1.39,lidl:1.15,eurospin:0.99,sole365:1.19,piccolo:1.29,deco:1.35}},
  pomodorini:{name:"Pomodorini",cat:"verdure",pack:500,unit:"g",prices:{conad:2.49,lidl:2.19,eurospin:1.99,sole365:2.29,piccolo:2.39,deco:2.45}},
  zucchine:{name:"Zucchine",cat:"verdure",pack:1000,unit:"g",prices:{conad:2.39,lidl:2.09,eurospin:1.89,sole365:2.19,piccolo:2.29,deco:2.35}},
  melanzane:{name:"Melanzane",cat:"verdure",pack:1000,unit:"g",prices:{conad:2.49,lidl:2.19,eurospin:1.99,sole365:2.29,piccolo:2.39,deco:2.45}},
  fagioli:{name:"Fagioli in barattolo",cat:"legumi",pack:400,unit:"g",prices:{conad:1.09,lidl:.89,eurospin:.79,sole365:.95,piccolo:1.00,deco:1.05}},
  ceci:{name:"Ceci in barattolo",cat:"legumi",pack:400,unit:"g",prices:{conad:1.09,lidl:.89,eurospin:.79,sole365:.95,piccolo:1.00,deco:1.05}},
  lenticchie:{name:"Lenticchie secche",cat:"legumi",pack:500,unit:"g",prices:{conad:1.89,lidl:1.59,eurospin:1.39,sole365:1.69,piccolo:1.79,deco:1.85}},
  pollo:{name:"Petto di pollo",cat:"carne",pack:500,unit:"g",prices:{conad:5.99,lidl:5.39,eurospin:4.99,sole365:5.49,piccolo:5.69,deco:5.79}},
  salsiccia:{name:"Salsiccia fresca",cat:"carne",pack:500,unit:"g",prices:{conad:5.49,lidl:4.99,eurospin:4.59,sole365:5.09,piccolo:5.19,deco:5.29}},
  macinato:{name:"Carne macinata",cat:"carne",pack:500,unit:"g",prices:{conad:6.49,lidl:5.89,eurospin:5.49,sole365:5.99,piccolo:6.09,deco:6.19}},
  merluzzo:{name:"Filetti di merluzzo surgelati",cat:"pesce",pack:400,unit:"g",prices:{conad:5.49,lidl:4.99,eurospin:4.59,sole365:5.09,piccolo:5.19,deco:5.29}},
  tonno:{name:"Tonno in scatola",cat:"pesce",pack:240,unit:"g",prices:{conad:3.79,lidl:3.39,eurospin:3.09,sole365:3.49,piccolo:3.59,deco:3.69}},
  uova:{name:"Uova",cat:"carne",pack:6,unit:"pz",prices:{conad:2.19,lidl:1.89,eurospin:1.69,sole365:1.99,piccolo:2.05,deco:2.09}},
  provola:{name:"Provola affumicata",cat:"latticini",pack:250,unit:"g",prices:{conad:3.49,lidl:3.09,eurospin:2.79,sole365:3.19,piccolo:3.29,deco:3.39}},
  parmigiano:{name:"Formaggio grattugiato",cat:"latticini",pack:200,unit:"g",prices:{conad:3.69,lidl:3.19,eurospin:2.89,sole365:3.29,piccolo:3.39,deco:3.59}},
  pane:{name:"Pane",cat:"pasta",pack:500,unit:"g",prices:{conad:1.79,lidl:1.49,eurospin:1.29,sole365:1.59,piccolo:1.69,deco:1.75}},
  olio:{name:"Olio extravergine",cat:"verdure",pack:750,unit:"ml",prices:{conad:8.49,lidl:7.79,eurospin:7.29,sole365:7.99,piccolo:8.19,deco:8.29}},
  patate:{name:"Patate",cat:"verdure",pack:1000,unit:"g",prices:{conad:1.89,lidl:1.59,eurospin:1.39,sole365:1.69,piccolo:1.79,deco:1.85}},
  broccoli:{name:"Broccoli / Friarielli",cat:"verdure",pack:500,unit:"g",prices:{conad:2.49,lidl:2.19,eurospin:1.99,sole365:2.29,piccolo:2.39,deco:2.45}},
  cavolfiore:{name:"Cavolfiore",cat:"verdure",pack:1000,unit:"g",prices:{conad:2.29,lidl:1.99,eurospin:1.79,sole365:2.09,piccolo:2.19,deco:2.25}},
  spinaci:{name:"Spinaci",cat:"verdure",pack:500,unit:"g",prices:{conad:2.19,lidl:1.89,eurospin:1.69,sole365:1.99,piccolo:2.09,deco:2.15}},
  peperoni:{name:"Peperoni",cat:"verdure",pack:1000,unit:"g",prices:{conad:2.99,lidl:2.69,eurospin:2.39,sole365:2.79,piccolo:2.89,deco:2.95}},
  insalata:{name:"Insalata / Scarola",cat:"verdure",pack:300,unit:"g",prices:{conad:1.79,lidl:1.49,eurospin:1.29,sole365:1.59,piccolo:1.69,deco:1.75}},
  gnocchi:{name:"Gnocchi di patate",cat:"pasta",pack:500,unit:"g",prices:{conad:1.99,lidl:1.69,eurospin:1.49,sole365:1.79,piccolo:1.89,deco:1.95}},
  mela:{name:"Mele",cat:"frutta",pack:1000,unit:"g",prices:{conad:2.19,lidl:1.89,eurospin:1.69,sole365:1.99,piccolo:2.09,deco:2.15}},
  pera:{name:"Pere",cat:"frutta",pack:1000,unit:"g",prices:{conad:2.69,lidl:2.39,eurospin:2.19,sole365:2.49,piccolo:2.59,deco:2.65}},
  banana:{name:"Banane",cat:"frutta",pack:1000,unit:"g",prices:{conad:1.89,lidl:1.69,eurospin:1.49,sole365:1.79,piccolo:1.82,deco:1.85}},
  arancia:{name:"Arance",cat:"frutta",pack:1000,unit:"g",prices:{conad:1.99,lidl:1.69,eurospin:1.49,sole365:1.79,piccolo:1.89,deco:1.95}},
  mandarino:{name:"Mandarini",cat:"frutta",pack:1000,unit:"g",prices:{conad:2.49,lidl:2.19,eurospin:1.99,sole365:2.29,piccolo:2.39,deco:2.45}},
  clementina:{name:"Clementine",cat:"frutta",pack:1000,unit:"g",prices:{conad:2.39,lidl:2.09,eurospin:1.89,sole365:2.19,piccolo:2.29,deco:2.35}},
  kiwi:{name:"Kiwi",cat:"frutta",pack:500,unit:"g",prices:{conad:2.29,lidl:1.99,eurospin:1.79,sole365:2.09,piccolo:2.19,deco:2.25}},
  uva:{name:"Uva",cat:"frutta",pack:1000,unit:"g",prices:{conad:3.49,lidl:3.09,eurospin:2.79,sole365:3.19,piccolo:3.29,deco:3.39}},
  anguria:{name:"Anguria",cat:"frutta",pack:3000,unit:"g",prices:{conad:3.27,lidl:2.97,eurospin:2.67,sole365:3.09,piccolo:3.18,deco:3.24}},
  melone:{name:"Melone",cat:"frutta",pack:1200,unit:"g",prices:{conad:2.99,lidl:2.69,eurospin:2.39,sole365:2.79,piccolo:2.89,deco:2.95}},
  pesca:{name:"Pesche",cat:"frutta",pack:1000,unit:"g",prices:{conad:2.99,lidl:2.69,eurospin:2.39,sole365:2.79,piccolo:2.89,deco:2.95}},
  albicocca:{name:"Albicocche",cat:"frutta",pack:500,unit:"g",prices:{conad:2.49,lidl:2.19,eurospin:1.99,sole365:2.29,piccolo:2.39,deco:2.45}},
  ciliegia:{name:"Ciliegie",cat:"frutta",pack:500,unit:"g",prices:{conad:4.49,lidl:3.99,eurospin:3.69,sole365:4.19,piccolo:4.29,deco:4.39}},
  prugna:{name:"Prugne",cat:"frutta",pack:1000,unit:"g",prices:{conad:2.79,lidl:2.49,eurospin:2.19,sole365:2.59,piccolo:2.69,deco:2.75}},
  fico:{name:"Fichi",cat:"frutta",pack:500,unit:"g",prices:{conad:3.99,lidl:3.59,eurospin:3.29,sole365:3.69,piccolo:3.79,deco:3.89}},
  melagrana:{name:"Melagrane",cat:"frutta",pack:1000,unit:"g",prices:{conad:3.49,lidl:3.09,eurospin:2.79,sole365:3.19,piccolo:3.29,deco:3.39}},
  pompelmo:{name:"Pompelmi",cat:"frutta",pack:1000,unit:"g",prices:{conad:2.49,lidl:2.19,eurospin:1.99,sole365:2.29,piccolo:2.39,deco:2.45}},
  cachi:{name:"Cachi",cat:"frutta",pack:1000,unit:"g",prices:{conad:2.99,lidl:2.69,eurospin:2.39,sole365:2.79,piccolo:2.89,deco:2.95}},
  fragole:{name:"Fragole",cat:"frutta",pack:500,unit:"g",prices:{conad:3.49,lidl:3.09,eurospin:2.79,sole365:3.19,piccolo:3.29,deco:3.39}}
};



const DEPARTMENT_LABELS={
  ortofrutta:"🥦 Ortofrutta",
  macelleria:"🥩 Macelleria",
  pescheria:"🐟 Pescheria",
  latticini:"🥛 Latticini e uova",
  dispensa:"🥫 Dispensa",
  pane:"🥖 Pane e prodotti da forno",
  surgelati:"❄️ Surgelati"
};

function productDepartment(key,product){
  if(["pollo","salsiccia","macinato"].includes(key)) return "macelleria";
  if(["merluzzo","tonno"].includes(key)) return "pescheria";
  if(["provola","parmigiano","uova"].includes(key)) return "latticini";
  if(["pane"].includes(key)) return "pane";
  if(["zucchine","melanzane","pomodorini","passata","patate","broccoli","cavolfiore","spinaci","peperoni","insalata"].includes(key)) return "ortofrutta";
  if(product.cat==="pesce") return "pescheria";
  if(product.cat==="carne") return "macelleria";
  if(product.cat==="latticini") return "latticini";
  if(product.cat==="verdure" || product.cat==="frutta") return "ortofrutta";
  return "dispensa";
}


const INGREDIENT_SHELF_LIFE = {
  spaghetti:365, penne:365, riso:365, passata:30, pomodorini:5,
  zucchine:5, melanzane:5, fagioli:365, ceci:365, lenticchie:365,
  pollo:2, salsiccia:2, macinato:2, merluzzo:3, tonno:365,
  uova:21, provola:4, parmigiano:30, pane:3, olio:180,
  patate:30, broccoli:4, cavolfiore:5, spinaci:3, peperoni:6,
  insalata:3, gnocchi:5,
  mela:21, pera:10, banana:5, arancia:14, limone:21,
  mandarino:10, clementina:10, kiwi:14, uva:7, anguria:5,
  melone:7, pesca:5, nettarina:5, albicocca:4, ciliegia:4,
  prugna:6, fico:3, melagrana:21, pompelmo:21, cachi:5,
  fragole:3, noci:120, mandorle:120, nocciole:120,
  pistacchi:120, pinoli:90
};

const INGREDIENT_OPENED_SHELF_LIFE = {
  passata:3, tonno:2, provola:3, parmigiano:20, pane:2, olio:120,
  fagioli:2, ceci:2, lenticchie:3,
  noci:45, mandorle:45, nocciole:45, pistacchi:45, pinoli:30
};

function ingredientShelfLife(key, opened=false){
  if(opened && INGREDIENT_OPENED_SHELF_LIFE[key]) return INGREDIENT_OPENED_SHELF_LIFE[key];
  return INGREDIENT_SHELF_LIFE[key] || 30;
}

function ingredientPerishabilityScore(key, opened=false){
  const days = ingredientShelfLife(key, opened);
  if(days <= 2) return 10;
  if(days <= 4) return 8;
  if(days <= 7) return 6;
  if(days <= 14) return 4;
  if(days <= 30) return 2;
  return 1;
}


// Tagli di carne aggiuntivi per il nuovo ricettario
if(!PRODUCTS.manzo){
  PRODUCTS.manzo={name:"Carne di manzo",cat:"carne",pack:500,unit:"g",prices:{conad:8.90,lidl:8.20,eurospin:7.80,sole365:8.50,piccolo:8.40,deco:8.30}};
}
if(!PRODUCTS.maiale){
  PRODUCTS.maiale={name:"Carne di maiale",cat:"carne",pack:500,unit:"g",prices:{conad:5.90,lidl:5.40,eurospin:5.10,sole365:5.60,piccolo:5.50,deco:5.45}};
}
if(!PRODUCTS.tacchino){
  PRODUCTS.tacchino={name:"Fesa di tacchino",cat:"carne",pack:400,unit:"g",prices:{conad:6.40,lidl:5.90,eurospin:5.60,sole365:6.10,piccolo:6.00,deco:5.95}};
}
if(!PRODUCTS.vitello){
  PRODUCTS.vitello={name:"Carne di vitello",cat:"carne",pack:500,unit:"g",prices:{conad:10.90,lidl:10.20,eurospin:9.80,sole365:10.50,piccolo:10.40,deco:10.30}};
}
if(!PRODUCTS.prosciutto){
  PRODUCTS.prosciutto={name:"Prosciutto cotto",cat:"carne",pack:150,unit:"g",prices:{conad:2.90,lidl:2.50,eurospin:2.30,sole365:2.70,piccolo:2.65,deco:2.60}};
}
if(!PRODUCTS.funghi){
  PRODUCTS.funghi={name:"Funghi",cat:"verdure",pack:300,unit:"g",prices:{conad:2.50,lidl:2.20,eurospin:1.95,sole365:2.35,piccolo:2.30,deco:2.25}};
}
if(!PRODUCTS.piselli){
  PRODUCTS.piselli={name:"Piselli",cat:"verdure",pack:450,unit:"g",prices:{conad:1.90,lidl:1.65,eurospin:1.50,sole365:1.80,piccolo:1.75,deco:1.70}};
}

const PANTRY_CATALOG = {
  ...PRODUCTS,
  // FRUTTA FRESCA E SECCA
  mela:{name:"Mele",cat:"frutta",unit:"g"},
  pera:{name:"Pere",cat:"frutta",unit:"g"},
  banana:{name:"Banane",cat:"frutta",unit:"g"},
  arancia:{name:"Arance",cat:"frutta",unit:"g"},
  limone:{name:"Limoni",cat:"frutta",unit:"g"},
  mandarino:{name:"Mandarini",cat:"frutta",unit:"g"},
  clementina:{name:"Clementine",cat:"frutta",unit:"g"},
  kiwi:{name:"Kiwi",cat:"frutta",unit:"g"},
  uva:{name:"Uva",cat:"frutta",unit:"g"},
  anguria:{name:"Anguria",cat:"frutta",unit:"g"},
  melone:{name:"Melone",cat:"frutta",unit:"g"},
  pesca:{name:"Pesche",cat:"frutta",unit:"g"},
  nettarina:{name:"Nettarine",cat:"frutta",unit:"g"},
  albicocca:{name:"Albicocche",cat:"frutta",unit:"g"},
  ciliegia:{name:"Ciliegie",cat:"frutta",unit:"g"},
  prugna:{name:"Prugne",cat:"frutta",unit:"g"},
  fico:{name:"Fichi",cat:"frutta",unit:"g"},
  melagrana:{name:"Melagrane",cat:"frutta",unit:"g"},
  pompelmo:{name:"Pompelmi",cat:"frutta",unit:"g"},
  cachi:{name:"Cachi",cat:"frutta",unit:"g"},
  fragole:{name:"Fragole",cat:"frutta",unit:"g"},
  noci:{name:"Noci",cat:"frutta",unit:"g"},
  mandorle:{name:"Mandorle",cat:"frutta",unit:"g"},
  nocciole:{name:"Nocciole",cat:"frutta",unit:"g"},
  pistacchi:{name:"Pistacchi",cat:"frutta",unit:"g"},
  pinoli:{name:"Pinoli",cat:"frutta",unit:"g"},

  farina:{name:"Farina 00",cat:"dispensa"},
  farina_integrale:{name:"Farina integrale",cat:"dispensa"},
  semola:{name:"Semola rimacinata",cat:"dispensa"},
  pangrattato:{name:"Pangrattato",cat:"dispensa"},
  lievito:{name:"Lievito di birra",cat:"dispensa"},
  zucchero:{name:"Zucchero",cat:"dispensa"},
  zucchero_canna:{name:"Zucchero di canna",cat:"dispensa"},
  sale:{name:"Sale",cat:"condimenti"},
  pepe:{name:"Pepe nero",cat:"condimenti"},
  origano:{name:"Origano",cat:"condimenti"},
  basilico:{name:"Basilico",cat:"condimenti"},
  rosmarino:{name:"Rosmarino",cat:"condimenti"},
  prezzemolo:{name:"Prezzemolo",cat:"condimenti"},
  aglio:{name:"Aglio",cat:"verdure"},
  cipolla:{name:"Cipolla",cat:"verdure"},
  carote:{name:"Carote",cat:"verdure"},
  patate:{name:"Patate",cat:"verdure"},
  peperoni:{name:"Peperoni",cat:"verdure"},
  spinaci:{name:"Spinaci",cat:"verdure"},
  broccoli:{name:"Broccoli",cat:"verdure"},
  cavolfiore:{name:"Cavolfiore",cat:"verdure"},
  insalata:{name:"Insalata",cat:"verdure"},
  piselli:{name:"Piselli",cat:"legumi"},
  fave:{name:"Fave",cat:"legumi"},
  cannellini:{name:"Fagioli cannellini",cat:"legumi"},
  borlotti:{name:"Fagioli borlotti",cat:"legumi"},
  mais:{name:"Mais",cat:"legumi"},
  pasta_integrale:{name:"Pasta integrale",cat:"pasta"},
  linguine:{name:"Linguine",cat:"pasta"},
  rigatoni:{name:"Rigatoni",cat:"pasta"},
  fusilli:{name:"Fusilli",cat:"pasta"},
  lasagne:{name:"Lasagne",cat:"pasta"},
  couscous:{name:"Cous cous",cat:"pasta"},
  orzo:{name:"Orzo perlato",cat:"pasta"},
  gnocchi:{name:"Gnocchi",cat:"pasta"},
  pancarre:{name:"Pane in cassetta",cat:"pane"},
  crackers:{name:"Cracker",cat:"pane"},
  friselle:{name:"Friselle",cat:"pane"},
  piadine:{name:"Piadine",cat:"pane"},
  latte:{name:"Latte",cat:"latticini"},
  burro:{name:"Burro",cat:"latticini"},
  mozzarella:{name:"Mozzarella",cat:"latticini"},
  ricotta:{name:"Ricotta",cat:"latticini"},
  yogurt:{name:"Yogurt",cat:"latticini"},
  scamorza:{name:"Scamorza",cat:"latticini"},
  pecorino:{name:"Pecorino",cat:"latticini"},
  prosciutto_cotto:{name:"Prosciutto cotto",cat:"carne"},
  prosciutto_crudo:{name:"Prosciutto crudo",cat:"carne"},
  pancetta:{name:"Pancetta",cat:"carne"},
  tacchino:{name:"Fesa di tacchino",cat:"carne"},
  bistecche:{name:"Bistecche",cat:"carne"},
  spezzatino:{name:"Spezzatino",cat:"carne"},
  wurstel:{name:"Würstel",cat:"carne"},
  salmone:{name:"Salmone",cat:"pesce"},
  sgombro:{name:"Sgombro",cat:"pesce"},
  gamberi:{name:"Gamberi",cat:"pesce"},
  calamari:{name:"Calamari",cat:"pesce"},
  alici:{name:"Alici",cat:"pesce"},
  sardine:{name:"Sardine",cat:"pesce"},
  aceto:{name:"Aceto",cat:"condimenti"},
  aceto_balsamico:{name:"Aceto balsamico",cat:"condimenti"},
  maionese:{name:"Maionese",cat:"condimenti"},
  ketchup:{name:"Ketchup",cat:"condimenti"},
  senape:{name:"Senape",cat:"condimenti"},
  salsa_soia:{name:"Salsa di soia",cat:"condimenti"},
  capperi:{name:"Capperi",cat:"condimenti"},
  olive:{name:"Olive",cat:"condimenti"},
  brodo:{name:"Dado o brodo",cat:"condimenti"},
  caffe:{name:"Caffè",cat:"bevande"},
  te:{name:"Tè",cat:"bevande"},
  camomilla:{name:"Camomilla",cat:"bevande"},
  acqua:{name:"Acqua",cat:"bevande"},
  succhi:{name:"Succhi di frutta",cat:"bevande"},
  biscotti:{name:"Biscotti",cat:"colazione"},
  cereali:{name:"Cereali",cat:"colazione"},
  marmellata:{name:"Marmellata",cat:"colazione"},
  miele:{name:"Miele",cat:"colazione"},
  cacao:{name:"Cacao",cat:"colazione"},
  cioccolato:{name:"Cioccolato",cat:"colazione"},
  mele:{name:"Mele",cat:"frutta"},
  banane:{name:"Banane",cat:"frutta"},
  arance:{name:"Arance",cat:"frutta"},
  limoni:{name:"Limoni",cat:"frutta"},
  pere:{name:"Pere",cat:"frutta"},
  frutta_secca:{name:"Frutta secca",cat:"frutta"},
  surgelati_misti:{name:"Verdure surgelate",cat:"surgelati"},
  patatine:{name:"Patatine surgelate",cat:"surgelati"},
  minestrone:{name:"Minestrone surgelato",cat:"surgelati"}
};



const PACK_OPTIONS = {
  spaghetti:[{size:500,mult:1},{size:1000,mult:1.82}],
  penne:[{size:500,mult:1},{size:1000,mult:1.82}],
  riso:[{size:500,mult:.58},{size:1000,mult:1}],
  passata:[{size:500,mult:.78},{size:700,mult:1}],
  pomodorini:[{size:250,mult:.58},{size:500,mult:1}],
  zucchine:[{size:500,mult:.55},{size:1000,mult:1}],
  melanzane:[{size:500,mult:.55},{size:1000,mult:1}],
  fagioli:[{size:400,mult:1},{size:800,mult:1.82}],
  ceci:[{size:400,mult:1},{size:800,mult:1.82}],
  lenticchie:[{size:500,mult:1},{size:1000,mult:1.85}],
  pollo:[{size:400,mult:.84},{size:800,mult:1.55}],
  salsiccia:[{size:400,mult:.84},{size:800,mult:1.58}],
  macinato:[{size:400,mult:.84},{size:800,mult:1.58}],
  merluzzo:[{size:400,mult:1},{size:800,mult:1.85}],
  tonno:[{size:160,mult:.72},{size:240,mult:1},{size:480,mult:1.82}],
  uova:[{size:6,mult:1},{size:10,mult:1.52}],
  provola:[{size:250,mult:1},{size:500,mult:1.86}],
  parmigiano:[{size:100,mult:.58},{size:200,mult:1},{size:500,mult:2.2}],
  pane:[{size:500,mult:1},{size:1000,mult:1.78}],
  olio:[{size:750,mult:1},{size:1000,mult:1.28}],
  patate:[{size:1000,mult:1},{size:2000,mult:1.75}],
  broccoli:[{size:500,mult:1},{size:1000,mult:1.8}],
  cavolfiore:[{size:1000,mult:1}],
  spinaci:[{size:500,mult:1},{size:1000,mult:1.8}],
  peperoni:[{size:500,mult:.56},{size:1000,mult:1}],
  insalata:[{size:300,mult:1},{size:600,mult:1.82}],
  gnocchi:[{size:500,mult:1},{size:1000,mult:1.78}]
};

function optimizePackCombination(key,qty,basePrice){
  const product=PRODUCTS[key];
  const options=(PACK_OPTIONS[key]||[{size:product.pack,mult:1}])
    .map(o=>({size:o.size,price:basePrice*o.mult}));

  let best=null;
  const maxPacks=Math.max(8,Math.ceil(qty/Math.min(...options.map(o=>o.size)))+2);

  function search(index,totalQty,totalCost,counts){
    if(totalQty>=qty){
      const waste=totalQty-qty;
      const score=totalCost+(waste/Math.max(qty,1))*0.12;
      if(!best || score<best.score){
        best={totalQty,totalCost,waste,counts:[...counts],score};
      }
      return;
    }
    if(index>=options.length) return;
    if(counts.reduce((a,b)=>a+b,0)>=maxPacks) return;

    for(let c=0;c<=maxPacks;c++){
      counts[index]=c;
      search(index+1,totalQty+c*options[index].size,totalCost+c*options[index].price,counts);
      if(totalQty+c*options[index].size>qty+Math.max(...options.map(o=>o.size))*2) break;
    }
    counts[index]=0;
  }

  search(0,0,0,new Array(options.length).fill(0));

  if(!best){
    const fallback=Math.ceil(qty/product.pack);
    return {
      packs:fallback,totalQty:fallback*product.pack,totalCost:fallback*basePrice,
      waste:fallback*product.pack-qty,description:`${fallback} × ${product.pack} ${product.unit}`
    };
  }

  const parts=best.counts
    .map((c,i)=>c?`${c} × ${options[i].size} ${product.unit}`:"")
    .filter(Boolean);

  return {
    packs:best.counts.reduce((a,b)=>a+b,0),
    totalQty:best.totalQty,
    totalCost:best.totalCost,
    waste:best.waste,
    description:parts.join(" + ")
  };
}

const NUTRITION_PER_100 = {
  spaghetti:{kcal:350,protein:12,carbs:72,fat:1.5},
  penne:{kcal:350,protein:12,carbs:72,fat:1.5},
  riso:{kcal:360,protein:7,carbs:79,fat:0.8},
  passata:{kcal:30,protein:1.5,carbs:5,fat:0.2},
  pomodorini:{kcal:18,protein:0.9,carbs:3.9,fat:0.2},
  zucchine:{kcal:17,protein:1.2,carbs:3.1,fat:0.3},
  melanzane:{kcal:25,protein:1,carbs:6,fat:0.2},
  fagioli:{kcal:95,protein:6,carbs:14,fat:0.5},
  ceci:{kcal:120,protein:7,carbs:18,fat:2.2},
  lenticchie:{kcal:115,protein:9,carbs:20,fat:0.4},
  pollo:{kcal:165,protein:31,carbs:0,fat:3.6},
  salsiccia:{kcal:300,protein:16,carbs:1,fat:26},
  macinato:{kcal:250,protein:26,carbs:0,fat:17},
  merluzzo:{kcal:82,protein:18,carbs:0,fat:0.7},
  tonno:{kcal:190,protein:26,carbs:0,fat:9},
  uova:{kcal:143,protein:13,carbs:1.1,fat:10},
  provola:{kcal:280,protein:22,carbs:2,fat:21},
  parmigiano:{kcal:390,protein:33,carbs:0,fat:28},
  pane:{kcal:265,protein:9,carbs:49,fat:3.2},
  olio:{kcal:884,protein:0,carbs:0,fat:100},
  patate:{kcal:77,protein:2,carbs:17,fat:0.1},
  broccoli:{kcal:34,protein:2.8,carbs:7,fat:0.4},
  cavolfiore:{kcal:25,protein:1.9,carbs:5,fat:0.3},
  spinaci:{kcal:23,protein:2.9,carbs:3.6,fat:0.4},
  peperoni:{kcal:31,protein:1,carbs:6,fat:0.3},
  insalata:{kcal:17,protein:1.2,carbs:3,fat:0.2},
  gnocchi:{kcal:150,protein:4,carbs:32,fat:1},
  mela:{kcal:52,protein:.3,carbs:14,fat:.2},
  pera:{kcal:57,protein:.4,carbs:15,fat:.1},
  banana:{kcal:89,protein:1.1,carbs:23,fat:.3},
  arancia:{kcal:47,protein:.9,carbs:12,fat:.1},
  mandarino:{kcal:53,protein:.8,carbs:13,fat:.3},
  clementina:{kcal:47,protein:.9,carbs:12,fat:.2},
  kiwi:{kcal:61,protein:1.1,carbs:15,fat:.5},
  uva:{kcal:69,protein:.7,carbs:18,fat:.2},
  anguria:{kcal:30,protein:.6,carbs:8,fat:.2},
  melone:{kcal:34,protein:.8,carbs:8,fat:.2},
  pesca:{kcal:39,protein:.9,carbs:10,fat:.3},
  albicocca:{kcal:48,protein:1.4,carbs:11,fat:.4},
  ciliegia:{kcal:63,protein:1.1,carbs:16,fat:.2},
  prugna:{kcal:46,protein:.7,carbs:11,fat:.3},
  fico:{kcal:74,protein:.8,carbs:19,fat:.3},
  melagrana:{kcal:83,protein:1.7,carbs:19,fat:1.2},
  pompelmo:{kcal:42,protein:.8,carbs:11,fat:.1},
  cachi:{kcal:70,protein:.6,carbs:19,fat:.2},
  fragole:{kcal:32,protein:.7,carbs:8,fat:.3}
};

function ingredientNutrition(key,qty){
  const n=NUTRITION_PER_100[key];
  if(!n) return {kcal:0,protein:0,carbs:0,fat:0};
  const factor=qty/100;
  return {
    kcal:n.kcal*factor,
    protein:n.protein*factor,
    carbs:n.carbs*factor,
    fat:n.fat*factor
  };
}

function recipeNutrition(recipe,portionScale=1){
  return Object.entries(recipe.ingredients).reduce((tot,[key,qty])=>{
    const n=ingredientNutrition(key,qty*portionScale);
    tot.kcal+=n.kcal;
    tot.protein+=n.protein;
    tot.carbs+=n.carbs;
    tot.fat+=n.fat;
    return tot;
  },{kcal:0,protein:0,carbs:0,fat:0});
}

function weeklyNutrition(meals,portionScale=1){
  const total={kcal:0,protein:0,carbs:0,fat:0,recipes:0};
  meals.forEach(day=>{
    [...day.lunch,...day.dinner].forEach(recipe=>{
      const n=recipeNutrition(recipe,portionScale);
      total.kcal+=n.kcal;
      total.protein+=n.protein;
      total.carbs+=n.carbs;
      total.fat+=n.fat;
      total.recipes++;
    });
  });
  return total;
}
