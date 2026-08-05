const DAYS=["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"];
let currentPlan=null;

const euro=n=>new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR"}).format(n);
function allowedCategories(){return [...document.querySelectorAll("[data-cat]:checked")].map(x=>x.dataset.cat)}
function pantryItems(){return [...document.querySelectorAll("[data-pantry]:checked")].map(x=>x.dataset.pantry)}
function foodPreferences(){
  return {
    avoidFish:document.getElementById("avoid-fish").checked,
    avoidMeat:document.getElementById("avoid-meat").checked,
    avoidLegumes:document.getElementById("avoid-legumes").checked,
    avoidDairy:document.getElementById("avoid-dairy").checked
  };
}
function recipeRespectsPreferences(recipe,prefs){
  if(prefs.avoidFish && recipe.tags.includes("pesce")) return false;
  if(prefs.avoidMeat && recipe.tags.includes("carne")) return false;
  if(prefs.avoidLegumes && recipe.tags.includes("legumi")) return false;
  if(prefs.avoidDairy && recipe.tags.includes("latticini")) return false;
  return true;
}

const PANTRY_CATEGORY_LABELS={
  verdure:"🥬 Verdura",
  frutta:"🍎 Frutta",
  carne:"🥩 Carne",
  pesce:"🐟 Pesce",
  latticini:"🥛 Latticini e uova",
  pasta:"🍝 Pasta e cereali",
  legumi:"🫘 Legumi",
  condimenti:"🫒 Condimenti",
  conserve:"🥫 Conserve",
  surgelati:"❄️ Surgelati",
  dispensa:"📦 Altro"
};
let activePantryCategory="all";

function pantryProductCategory(product){
  if(product.cat==="pasta" && ["pane"].includes(product.name?.toLowerCase())) return "pane";
  return product.cat || "dispensa";
}

function renderPantry(){
  const grid=document.getElementById("pantryGrid");
  const cats=["all",...new Set(Object.values(PANTRY_CATALOG).map(p=>pantryProductCategory(p)))];
  document.getElementById("pantryCategories").innerHTML=cats.map(cat=>
    `<button type="button" class="pantry-cat ${cat===activePantryCategory?"active":""}" data-pantry-cat="${PANTRY_CATEGORY_LABELS[cat]||cat}">${PANTRY_CATEGORY_LABELS[cat]||cat}</button>`
  ).join("");

  grid.innerHTML=Object.entries(PANTRY_CATALOG)
    .sort((a,b)=>a[1].name.localeCompare(b[1].name,"it"))
    .map(([key,p])=>`<div class="pantry-item pantry-item-qty" data-pantry-label="${p.name.toLowerCase()}" data-pantry-category="${pantryProductCategory(p)}">
      <label class="pantry-name">
        <input type="checkbox" data-pantry="${key}"> ${p.name}
      </label>
      <div class="pantry-meta">
        <label class="opened-label"><input type="checkbox" data-opened="${key}"> aperto</label>
        <input type="number" min="0" step="1" placeholder="${p.unit}" data-pantry-qty="${key}" class="pantry-qty" title="Quantità disponibile">
      </div>
    </div>`).join("");

  document.querySelectorAll("[data-pantry-cat]").forEach(btn=>btn.onclick=()=>{
    activePantryCategory=btn.dataset.pantryCat;
    document.querySelectorAll("[data-pantry-cat]").forEach(x=>x.classList.toggle("active",x.dataset.pantryCat===activePantryCategory));
    filterPantry();
  });
  const openedSet=new Set(openedPantryItems());
  document.querySelectorAll("[data-opened]").forEach(x=>{
    x.checked=openedSet.has(x.dataset.opened);
    x.onchange=()=>{
      const current=new Set(openedPantryItems());
      if(x.checked) current.add(x.dataset.opened);
      else current.delete(x.dataset.opened);
      saveOpenedPantry([...current]);
    };
  });
  document.querySelectorAll("[data-pantry]").forEach(x=>x.onchange=()=>{updatePantryCount();saveSettings()});
  renderPantryQuantityInputs();
  document.querySelectorAll("[data-cat]").forEach(x=>x.onchange=saveSettings);
}

function filterPantry(){
  const q=(document.getElementById("pantrySearch").value||"").trim().toLowerCase();
  document.querySelectorAll(".pantry-item").forEach(item=>{
    const name=item.dataset.pantryLabel||"";
    const cat=item.dataset.pantryCategory;
    const visible=(!q||name.includes(q))&&(activePantryCategory==="all"||cat===activePantryCategory);
    item.classList.toggle("hidden",!visible);
  });
}

function updatePantryCount(){
  const selected=pantryItems();
  const quantities=loadPantryQuantities();
  const quantified=Object.values(quantities).filter(v=>(parseFloat(v)||0)>0).length;
  const count=new Set([...selected,...Object.keys(quantities).filter(k=>(parseFloat(quantities[k])||0)>0)]).size;

  document.getElementById("pantryCount").textContent=
    `${count} prodott${count===1?"o":"i"} disponibili · ${quantified} con quantità`;
}
function recipeAllowed(r,cats,style,season,prefs){
  const seasonMatch=season==="inverno" ? true : r.season.includes("estate");
  const categoryMatch=r.tags.every(t=>cats.includes(t));

  let modeMatch=false;
  if(style==="veloce"){
    modeMatch=r.style.includes("veloce");
  }else if(style==="gourmet"){
    modeMatch=r.style.includes("gourmet");
  }else{
    modeMatch=r.style.includes("normale") && !r.style.includes("gourmet");
  }

  return seasonMatch && categoryMatch && modeMatch && recipeRespectsPreferences(r,prefs);
}
function chooseRecipes(type,count,cats,style,season,prefs){
  let pool=RECIPES.filter(r=>r.type===type && recipeAllowed(r,cats,style,season,prefs));

  if(!pool.length){
    pool=RECIPES.filter(r=>{
      const seasonMatch=season==="inverno" ? true : r.season.includes("estate");
      const styleMatch=style==="veloce" ? r.style.includes("veloce")
        : style==="gourmet" ? r.style.includes("gourmet")
        : r.style.includes("normale") && !r.style.includes("gourmet");
      return r.type===type && seasonMatch && styleMatch && r.tags.some(t=>cats.includes(t)) && recipeRespectsPreferences(r,prefs);
    });
  }

  if(!pool.length){
    pool=RECIPES.filter(r=>{
      const seasonMatch=season==="inverno" ? true : r.season.includes("estate");
      const styleMatch=style==="veloce" ? r.style.includes("veloce")
        : style==="gourmet" ? r.style.includes("gourmet")
        : r.style.includes("normale") && !r.style.includes("gourmet");
      return r.type===type && seasonMatch && styleMatch && recipeRespectsPreferences(r,prefs);
    });
  }

  if(!pool.length) return [];

  const out=[];
  let previousId=null;

  while(out.length<count){
    let cycle=[...pool].sort(()=>Math.random()-.5);

    if(previousId && cycle.length>1 && cycle[0].id===previousId){
      [cycle[0],cycle[1]]=[cycle[1],cycle[0]];
    }

    for(const recipe of cycle){
      if(out.length>=count) break;
      out.push(recipe);
      previousId=recipe.id;
    }
  }

  return out;
}
function servingsFor(pref){return pref==="entrambi"?2:pref==="fuori"?0:1}


function loadPantryQuantities(){
  try{
    return JSON.parse(localStorage.getItem("smartCampaniaPantryQuantities")||"{}");
  }catch(e){
    return {};
  }
}

function savePantryQuantities(data){
  localStorage.setItem("smartCampaniaPantryQuantities",JSON.stringify(data));
}

function setPantryQuantity(key,value){
  const data=loadPantryQuantities();
  const numeric=Math.max(0,parseFloat(value)||0);

  if(numeric>0) data[key]=numeric;
  else delete data[key];

  savePantryQuantities(data);
}

function pantryQuantity(key){
  return Math.max(0,parseFloat(loadPantryQuantities()[key])||0);
}

function consumePantryQuantities(needs, selectedPantry){
  const available=loadPantryQuantities();
  const remainingNeeds={...needs};
  const usedFromPantry={};

  Object.keys(remainingNeeds).forEach(key=>{
    const selected=selectedPantry.includes(key);
    const knownQty=Math.max(0,parseFloat(available[key])||0);

    // Compatibilità con il vecchio sistema:
    // se il prodotto è selezionato ma non ha una quantità inserita,
    // viene considerato completamente disponibile.
    if(selected && knownQty<=0){
      usedFromPantry[key]=remainingNeeds[key];
      remainingNeeds[key]=0;
      return;
    }

    if(knownQty>0){
      const used=Math.min(remainingNeeds[key],knownQty);
      usedFromPantry[key]=used;
      remainingNeeds[key]-=used;
    }
  });

  return {remainingNeeds,usedFromPantry};
}

function renderPantryQuantityInputs(){
  const quantities=loadPantryQuantities();

  document.querySelectorAll("[data-pantry-qty]").forEach(input=>{
    const key=input.dataset.pantryQty;
    input.value=quantities[key] ?? "";

    input.onchange=()=>{
      setPantryQuantity(key,input.value);

      const checkbox=document.querySelector(`[data-pantry="${key}"]`);
      if(checkbox && parseFloat(input.value)>0){
        checkbox.checked=true;
      }

      updatePantryCount();
      saveSettings();
    };
  });
}

function calculateShopping(meals, people, supermarket, pantry=[], portionScale=1){
  const needs={};
  meals.forEach(d=>[...d.lunch,...d.dinner].forEach(r=>{
    Object.entries(r.ingredients).forEach(([k,q])=>needs[k]=(needs[k]||0)+q*people*portionScale);
  }));

  const pantryUse=consumePantryQuantities(needs,pantry);
  const shopping=[];
  let spent=0;

  Object.entries(pantryUse.remainingNeeds).forEach(([k,qty])=>{
    if(qty<=0) return;
    const p=PRODUCTS[k];
    const price=p.prices[supermarket];
    const packPlan=optimizePackCombination(k,qty,price);
    const total=packPlan.totalCost;
    spent+=total;
    shopping.push({
      key:k,name:p.name,qty,
      packs:packPlan.packs,
      pack:p.pack,
      unit:p.unit,
      total,
      price,
      department:productDepartment(k,p),
      packDescription:packPlan.description,
      purchasedQty:packPlan.totalQty,
      leftoverQty:packPlan.waste
    });
  });

  return {shopping,spent,needs,usedFromPantry:pantryUse.usedFromPantry,remainingNeeds:pantryUse.remainingNeeds};
}

function recipeEstimatedCost(recipe, people, supermarket){
  return Object.entries(recipe.ingredients).reduce((sum,[k,q])=>{
    const p=PRODUCTS[k];
    return sum + ((q*people)/p.pack)*p.prices[supermarket];
  },0);
}

function cheapestRecipe(type,cats,style,people,supermarket){
  let pool=RECIPES.filter(r=>r.type===type && recipeAllowed(r,cats,style,season,prefs));
  if(!pool.length) pool=RECIPES.filter(r=>r.type===type && r.tags.every(t=>cats.includes(t)));
  return pool.sort((a,b)=>recipeEstimatedCost(a,people,supermarket)-recipeEstimatedCost(b,people,supermarket))[0] || null;
}

function optimizeMealsToBudget(meals, people, supermarket, budget, cats, style, pantry, season, prefs){
  const cloned=JSON.parse(JSON.stringify(meals));
  let portionScale=1;
  let result=calculateShopping(cloned,people,supermarket,pantry,portionScale);

  if(result.spent<=budget){
    return {...result,meals:cloned,optimized:false,reduced:false,portionScale};
  }

  const pools={};
  ["primo","secondo","contorno","frutta"].forEach(type=>{
    let pool=RECIPES.filter(r=>r.type===type && recipeAllowed(r,cats,style,season,prefs));

    if(!pool.length){
      pool=RECIPES.filter(r=>{
        const seasonMatch=season==="inverno" ? true : r.season.includes("estate");
        const styleMatch=style==="veloce" ? r.style.includes("veloce")
          : style==="gourmet" ? r.style.includes("gourmet")
          : r.style.includes("normale") && !r.style.includes("gourmet");
        return r.type===type && seasonMatch && styleMatch && recipeRespectsPreferences(r,prefs);
      });
    }

    pools[type]=pool.sort(
      (a,b)=>recipeEstimatedCost(a,people,supermarket)-recipeEstimatedCost(b,people,supermarket)
    );
  });

  const usage={};
  cloned.forEach(day=>{
    [...day.lunch,...day.dinner].forEach(r=>{
      usage[r.id]=(usage[r.id]||0)+1;
    });
  });

  const slots=[];
  cloned.forEach((day,dayIndex)=>{
    ["lunch","dinner"].forEach(mealKey=>{
      day[mealKey].forEach((recipe,recipeIndex)=>{
        slots.push({dayIndex,mealKey,recipeIndex});
      });
    });
  });

  let attempts=0;

  while(result.spent>budget && attempts<250){
    attempts++;
    let bestMove=null;

    for(const slot of slots){
      const current=cloned[slot.dayIndex][slot.mealKey][slot.recipeIndex];
      const pool=pools[current.type]||[];

      for(const candidate of pool){
        if(candidate.id===current.id) continue;

        const sameMeal=cloned[slot.dayIndex][slot.mealKey]
          .some((r,i)=>i!==slot.recipeIndex && r.id===candidate.id);

        const otherMealKey=slot.mealKey==="lunch"?"dinner":"lunch";
        const sameDay=cloned[slot.dayIndex][otherMealKey]
          .some(r=>r.id===candidate.id);

        if(sameMeal || sameDay) continue;

        cloned[slot.dayIndex][slot.mealKey][slot.recipeIndex]=candidate;
        const trial=calculateShopping(cloned,people,supermarket,pantry,1);
        cloned[slot.dayIndex][slot.mealKey][slot.recipeIndex]=current;

        const saving=result.spent-trial.spent;
        if(saving>0 && (!bestMove || saving>bestMove.saving)){
          bestMove={slot,candidate,current,trial,saving};
        }
      }
    }

    if(!bestMove) break;

    const {slot,candidate,current,trial}=bestMove;
    cloned[slot.dayIndex][slot.mealKey][slot.recipeIndex]=candidate;
    usage[current.id]=Math.max(0,(usage[current.id]||1)-1);
    usage[candidate.id]=(usage[candidate.id]||0)+1;
    result=trial;
  }

  // Ruota tra le ricette più economiche mantenendo varietà e modalità.
  if(result.spent>budget){
    const counters={primo:0,secondo:0,contorno:0,frutta:0};

    cloned.forEach((day,dayIndex)=>{
      ["lunch","dinner"].forEach(mealKey=>{
        cloned[dayIndex][mealKey]=day[mealKey].map(recipe=>{
          const pool=pools[recipe.type]||[];
          if(!pool.length) return recipe;

          const economicalPool=pool.slice(0,Math.min(pool.length,7));
          const candidate=economicalPool[counters[recipe.type] % economicalPool.length];
          counters[recipe.type]++;
          return candidate;
        });
      });
    });

    result=calculateShopping(cloned,people,supermarket,pantry,1);
  }

  // Protezione finale: mantiene tutti i piatti ma riduce progressivamente
  // le quantità per porzione finché la spesa rientra nel budget.
  if(result.spent>budget){
    const scales=[0.95,0.90,0.85,0.80,0.75,0.70,0.65,0.60,0.55,0.50,0.45,0.40];

    for(const scale of scales){
      const trial=calculateShopping(cloned,people,supermarket,pantry,scale);
      if(trial.spent<=budget){
        portionScale=scale;
        result=trial;
        break;
      }
    }
  }

  // Garanzia assoluta: se le confezioni minime superano ancora il budget,
  // usa una selezione essenziale mantenendo almeno un piatto per pasto.
  if(result.spent>budget){
    for(let dayIndex=cloned.length-1;dayIndex>=0 && result.spent>budget;dayIndex--){
      for(const mealKey of ["dinner","lunch"]){
        const meal=cloned[dayIndex][mealKey];
        while(meal.length>1 && result.spent>budget){
          meal.pop();
          result=calculateShopping(cloned,people,supermarket,pantry,0.40);
          portionScale=0.40;
        }
      }
    }
  }

  return {
    ...result,
    meals:cloned,
    optimized:true,
    reduced:portionScale<1,
    portionScale
  };
}


function recipeIngredientKeys(recipe){
  return Object.keys(recipe.ingredients);
}

function ingredientReuseScore(recipe,usedIngredients){
  return recipeIngredientKeys(recipe).reduce(
    (score,key)=>score+(usedIngredients.has(key)?1:0),
    0
  );
}

function diversifyAndReuse(recipes){
  const usedIngredients=new Set();
  const result=[];
  const remaining=[...recipes];

  while(remaining.length){
    remaining.sort((a,b)=>{
      const reuseDiff=ingredientReuseScore(b,usedIngredients)-ingredientReuseScore(a,usedIngredients);
      if(reuseDiff!==0) return reuseDiff;
      return Math.random()-.5;
    });

    let index=0;
    const last=result[result.length-1];
    const twoBack=result[result.length-2];

    const alternative=remaining.findIndex(r=>
      (!last || r.id!==last.id) &&
      (!twoBack || r.id!==twoBack.id)
    );

    if(alternative>=0) index=alternative;

    const selected=remaining.splice(index,1)[0];
    result.push(selected);
    recipeIngredientKeys(selected).forEach(k=>usedIngredients.add(k));
  }

  return result;
}


function recipeFamily(recipe){
  if(recipe.type==="frutta") return "vegetariano";
  if(recipe.tags.includes("pesce")) return "pesce";
  if(recipe.tags.includes("carne")) return "carne";
  if(recipe.tags.includes("legumi")) return "legumi";
  if(recipe.tags.includes("latticini") && !recipe.tags.includes("carne") && !recipe.tags.includes("pesce")) return "vegetariano";
  return "vegetariano";
}

function isWeekendDay(dayIndex){
  return dayIndex===5 || dayIndex===6;
}

function scoreCandidate(recipe,dayIndex,usedFamilies,lastFamily,season,style){
  const family=recipeFamily(recipe);
  let score=0;

  // Penalizza ripetizioni consecutive della stessa famiglia.
  if(family===lastFamily) score-=8;

  // Favorisce un equilibrio settimanale.
  const target={carne:3,pesce:3,legumi:3,vegetariano:5};
  const used=usedFamilies[family]||0;
  if(used<target[family]) score+=5;
  else score-=used-target[family]+1;

  // Estate: più pesce e piatti vegetali.
  if(season==="estate"){
    if(family==="pesce") score+=4;
    if(family==="vegetariano") score+=3;
    if(family==="legumi") score+=1;
  }

  // Inverno: più legumi e piatti caldi/casalinghi.
  if(season==="inverno"){
    if(family==="legumi") score+=4;
    if(recipe.name.toLowerCase().includes("forno")) score+=2;
    if(recipe.name.toLowerCase().includes("sugo")) score+=2;
  }

  // Gourmet: privilegia weekend per ricette più elaborate.
  if(style==="gourmet"){
    if(isWeekendDay(dayIndex) && recipe.style.includes("gourmet")) score+=7;
    if(!isWeekendDay(dayIndex) && recipe.style.includes("gourmet")) score-=2;
  }

  // Veloce: preferisce ricette veloci nei giorni feriali.
  if(style==="veloce" && !isWeekendDay(dayIndex) && recipe.style.includes("veloce")) score+=4;

  score+=Math.random();
  return score;
}

function buildBalancedSequence(pool,count,season,style){
  if(!pool.length) return [];

  const sequence=[];
  const usedFamilies={carne:0,pesce:0,legumi:0,vegetariano:0};
  const usedRecipes={};
  let lastFamily=null;

  for(let i=0;i<count;i++){
    const dayIndex=i%7;

    const ranked=[...pool].sort((a,b)=>{
      const repeatPenaltyA=(usedRecipes[a.id]||0)*5;
      const repeatPenaltyB=(usedRecipes[b.id]||0)*5;
      return (scoreCandidate(b,dayIndex,usedFamilies,lastFamily,season,style)-repeatPenaltyB) -
             (scoreCandidate(a,dayIndex,usedFamilies,lastFamily,season,style)-repeatPenaltyA);
    });

    let chosen=ranked.find(r=>
      (!sequence.length || r.id!==sequence[sequence.length-1].id) &&
      (sequence.length<2 || r.id!==sequence[sequence.length-2].id)
    ) || ranked[0];

    sequence.push(chosen);
    usedRecipes[chosen.id]=(usedRecipes[chosen.id]||0)+1;
    const family=recipeFamily(chosen);
    usedFamilies[family]=(usedFamilies[family]||0)+1;
    lastFamily=family;
  }

  return sequence;
}

function weeklyBalanceStats(meals){
  const stats={carne:0,pesce:0,legumi:0,vegetariano:0};

  meals.forEach(day=>{
    [...day.lunch,...day.dinner].forEach(recipe=>{
      if(recipe.type==="frutta") return;
      const family=recipeFamily(recipe);
      stats[family]++;
    });
  });

  return stats;
}


function loadFavorites(){
  try{
    return new Set(JSON.parse(localStorage.getItem("smartCampaniaFavorites")||"[]"));
  }catch(e){
    return new Set();
  }
}

function saveFavorites(set){
  localStorage.setItem("smartCampaniaFavorites",JSON.stringify([...set]));
}

function toggleFavorite(recipeId){
  const favs=loadFavorites();
  if(favs.has(recipeId)) favs.delete(recipeId);
  else favs.add(recipeId);
  saveFavorites(favs);
  renderRecipeLibrary();
}

function loadMenuHistory(){
  try{
    return JSON.parse(localStorage.getItem("smartCampaniaMenuHistory")||"[]");
  }catch(e){
    return [];
  }
}

function saveCurrentPlanToHistory(plan){
  const history=loadMenuHistory();
  const entry={
    id:Date.now(),
    date:new Date().toLocaleDateString("it-IT"),
    supermarket:plan.supermarket,
    budget:plan.budget,
    people:plan.people,
    recipes:plan.meals.flatMap(d=>[...d.lunch,...d.dinner]).map(r=>({id:r.id,name:r.name,type:r.type}))
  };

  history.unshift(entry);
  localStorage.setItem("smartCampaniaMenuHistory",JSON.stringify(history.slice(0,8)));
}

function recentRecipeIds(){
  const history=loadMenuHistory().slice(0,3);
  return new Set(history.flatMap(h=>h.recipes.map(r=>r.id)));
}

function renderHistory(){
  const history=loadMenuHistory();
  const panel=document.getElementById("history");

  panel.innerHTML=history.length
    ? history.map(h=>`
      <div class="history-card">
        <h4>${h.date} · ${h.people} persone · ${euro(h.budget)}</h4>
        <div class="item-sub">${h.recipes.slice(0,8).map(r=>r.name).join(" · ")}${h.recipes.length>8?" · …":""}</div>
      </div>
    `).join("")
    : `<div class="empty">Nessun menu precedente salvato.</div>`;
}

let showOnlyFavorites=false;

function recipeMatchesSearch(recipe,query){
  if(!query) return true;
  const ingredientNames=Object.keys(recipe.ingredients)
    .map(k=>PRODUCTS[k]?.name||k)
    .join(" ");
  const haystack=`${recipe.name} ${ingredientNames} ${recipe.tags.join(" ")}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}


function recipeTypeIcon(recipe){
  if(recipe.type==="primo") return "🍝";
  if(recipe.type==="secondo") return "🍗";
  if(recipe.type==="contorno") return "🥗";
  if(recipe.type==="frutta") return "🍎";
  return "🍽️";
}

function recipeTypeLabel(recipe){
  if(recipe.type==="primo") return "Primo";
  if(recipe.type==="secondo") return "Secondo";
  if(recipe.type==="contorno") return "Contorno";
  if(recipe.type==="frutta") return "Frutta";
  return "Ricetta";
}

function recipeVisualClass(recipe){
  if(recipe.type==="primo") return "visual-primo";
  if(recipe.type==="secondo") return "visual-secondo";
  if(recipe.type==="contorno") return "visual-contorno";
  if(recipe.type==="frutta") return "visual-frutta";
  return "visual-default";
}

function recipeShortDescription(recipe){
  const ingredients=Object.keys(recipe.ingredients)
    .slice(0,3)
    .map(key=>PRODUCTS[key]?.name||key)
    .join(", ");

  return ingredients
    ? `${ingredients}.`
    : "Ricetta campana e mediterranea.";
}

function recipeNutritionSummary(recipe){
  const n=recipeNutrition(recipe,1);
  return {
    kcal:Math.round(n.kcal),
    protein:n.protein.toFixed(0),
    carbs:n.carbs.toFixed(0),
    fat:n.fat.toFixed(0)
  };
}

function difficultyDots(recipe){
  const difficulty=recipeDifficulty(recipe);
  if(difficulty==="Facile") return "●○○";
  if(difficulty==="Media" || difficulty==="Facile/Media") return "●●○";
  return "●●●";
}

function renderRecipeLibrary(){
  const query=(document.getElementById("recipeSearch")?.value||"").trim();
  const favs=loadFavorites();

  const rows=RECIPES
    .filter(r=>recipeMatchesSearch(r,query))
    .filter(r=>!showOnlyFavorites || favs.has(r.id))
    .sort((a,b)=>a.name.localeCompare(b.name,"it"))
    .map(r=>{
      const nutrition=recipeNutritionSummary(r);
      return `
      <article class="recipe-card ${recipeVisualClass(r)}">
        <button type="button" class="recipe-card-fav ${favs.has(r.id)?"active":""}" data-fav-recipe="${r.id}" aria-label="Preferita">
          ${favs.has(r.id)?"★":"☆"}
        </button>

        <div class="recipe-card-visual" data-library-recipe="${r.id}">
          <span class="recipe-card-icon">${recipeTypeIcon(r)}</span>
          <span class="recipe-card-type">${recipeTypeLabel(r)}</span>
        </div>

        <div class="recipe-card-body">
          <h3 data-library-recipe="${r.id}">${r.name}</h3>
          <p>${recipeShortDescription(r)}</p>

          <div class="recipe-card-meta">
            <span>⏱ ${recipeTime(r)}</span>
            <span>👨‍🍳 ${recipeDifficulty(r)}</span>
            <span>🍽 ${recipeSatiety(r)}</span>
          </div>

          <div class="recipe-card-nutrition">
            <div><small>Calorie</small><strong>${nutrition.kcal}</strong></div>
            <div><small>Proteine</small><strong>${nutrition.protein} g</strong></div>
            <div><small>Carboidrati</small><strong>${nutrition.carbs} g</strong></div>
          </div>

          <button type="button" class="recipe-open-btn" data-library-recipe="${r.id}">
            Apri ricetta
          </button>
        </div>
      </article>`;
    }).join("");

  document.getElementById("recipeLibrary").innerHTML=rows||`<div class="empty">Nessuna ricetta trovata.</div>`;

  document.querySelectorAll("[data-library-recipe]").forEach(el=>{
    el.onclick=()=>openRecipe(el.dataset.libraryRecipe);
  });

  document.querySelectorAll("[data-fav-recipe]").forEach(btn=>{
    btn.onclick=()=>toggleFavorite(btn.dataset.favRecipe);
  });
}

function pantryPreferenceScore(recipe,pantry){
  return Object.keys(recipe.ingredients).reduce(
    (score,key)=>score+(pantry.includes(key)?4:0),
    0
  );
}

function prioritizePantryAndFavorites(pool,pantry){
  const favs=loadFavorites();
  const recent=recentRecipeIds();

  return [...pool].sort((a,b)=>{
    const scoreA=pantryPreferenceScore(a,pantry)+(favs.has(a.id)?2:0)-(recent.has(a.id)?3:0);
    const scoreB=pantryPreferenceScore(b,pantry)+(favs.has(b.id)?2:0)-(recent.has(b.id)?3:0);
    return scoreB-scoreA || Math.random()-.5;
  });
}


function recipeSatiety(recipe){
  if(recipe.type==="frutta") return "leggera";
  const name=recipe.name.toLowerCase();
  if(
    name.includes("forno") || name.includes("parmigiana") || name.includes("polpette") ||
    name.includes("salsiccia") || name.includes("pasta e patate") || name.includes("gnocchi") ||
    recipe.ingredients.provola>=60 || recipe.ingredients.salsiccia || recipe.ingredients.macinato
  ) return "sostanziosa";

  if(
    recipe.tags.includes("pesce") || recipe.name.toLowerCase().includes("insalata") ||
    recipe.name.toLowerCase().includes("zucchine") || recipe.name.toLowerCase().includes("pomodor")
  ) return "leggera";

  return "normale";
}

function satietyValue(level){
  return level==="leggera"?1:level==="sostanziosa"?3:2;
}

function pairingScore(mainRecipe,sideRecipe){
  if(!mainRecipe || !sideRecipe) return 0;

  const mainFamily=recipeFamily(mainRecipe);
  const sideFamily=recipeFamily(sideRecipe);
  let score=0;

  // Evita ridondanze.
  if(mainFamily==="legumi" && sideFamily==="legumi") score-=8;
  if(mainRecipe.tags.includes("verdure") && sideRecipe.tags.includes("verdure")) score-=1;

  // Abbinamenti sensati.
  if(mainFamily==="carne" && sideRecipe.name.toLowerCase().includes("patate")) score+=6;
  if(mainFamily==="pesce" && (
    sideRecipe.name.toLowerCase().includes("zucchine") ||
    sideRecipe.name.toLowerCase().includes("pomodor") ||
    sideRecipe.name.toLowerCase().includes("insalata")
  )) score+=6;
  if(mainFamily==="legumi" && sideRecipe.name.toLowerCase().includes("insalata")) score+=5;
  if(mainFamily==="vegetariano" && sideFamily==="legumi") score+=3;

  // Migliore equilibrio di sazietà.
  const total=satietyValue(recipeSatiety(mainRecipe))+satietyValue(recipeSatiety(sideRecipe));
  if(total<=4) score+=2;
  if(total>=6) score-=4;

  return score;
}

function chooseBestSide(mainRecipes,sidePool,usedSideIds){
  if(!sidePool.length) return null;

  const ranked=[...sidePool].sort((a,b)=>{
    const scoreA=mainRecipes.reduce((s,m)=>s+pairingScore(m,a),0) - ((usedSideIds[a.id]||0)*4);
    const scoreB=mainRecipes.reduce((s,m)=>s+pairingScore(m,b),0) - ((usedSideIds[b.id]||0)*4);
    return scoreB-scoreA;
  });

  return ranked[0];
}

function mealSatiety(recipes){
  const dishes=recipes.filter(r=>r.type!=="frutta");
  if(!dishes.length) return 0;
  return dishes.reduce((sum,r)=>sum+satietyValue(recipeSatiety(r)),0);
}

function rebalanceLunchDinner(meals){
  meals.forEach(day=>{
    const lunchScore=mealSatiety(day.lunch);
    const dinnerScore=mealSatiety(day.dinner);

    // Se entrambi sono pesanti, alleggerisce la cena sostituendo il piatto
    // più sostanzioso con una ricetta leggera dello stesso tipo.
    if(lunchScore>=5 && dinnerScore>=5){
      const heavyIndex=day.dinner.findIndex(r=>recipeSatiety(r)==="sostanziosa");
      if(heavyIndex>=0){
        const heavy=day.dinner[heavyIndex];
        const replacement=RECIPES.find(r=>
          r.type===heavy.type &&
          recipeSatiety(r)==="leggera" &&
          r.id!==heavy.id
        );
        if(replacement) day.dinner[heavyIndex]=replacement;
      }
    }
  });
  return meals;
}

function longTermRecentRecipeIds(){
  const history=loadMenuHistory().slice(0,5);
  return new Set(history.flatMap(h=>h.recipes.map(r=>r.id)));
}

function dayTheme(dayIndex,season,style){
  const winterThemes=["legumi","pesce","carne","vegetariano","pesce","speciale","tradizionale"];
  const summerThemes=["vegetariano","pesce","carne","legumi","pesce","speciale","tradizionale"];
  const themes=season==="estate"?summerThemes:winterThemes;

  if(style==="gourmet" && (dayIndex===5 || dayIndex===6)) return "speciale";
  return themes[dayIndex];
}

function themeScore(recipe,theme){
  if(theme==="speciale") return recipe.style.includes("gourmet")?8:0;
  if(theme==="tradizionale"){
    const name=recipe.name.toLowerCase();
    return (
      name.includes("napoletana") || name.includes("campana") ||
      name.includes("sorrentina") || name.includes("parmigiana")
    ) ? 7 : 0;
  }
  return recipeFamily(recipe)===theme?7:0;
}

function buildChefSequence(pool,count,season,style,type){
  if(!pool.length) return [];

  const historyIds=longTermRecentRecipeIds();
  const usage={};
  const sequence=[];

  for(let i=0;i<count;i++){
    const dayIndex=i%7;
    const theme=dayTheme(dayIndex,season,style);
    const last=sequence[sequence.length-1];
    const twoBack=sequence[sequence.length-2];

    const ranked=[...pool].sort((a,b)=>{
      const scoreA=
        themeScore(a,theme)
        -(usage[a.id]||0)*6
        -(historyIds.has(a.id)?4:0)
        -(last?.id===a.id?10:0)
        -(twoBack?.id===a.id?6:0);

      const scoreB=
        themeScore(b,theme)
        -(usage[b.id]||0)*6
        -(historyIds.has(b.id)?4:0)
        -(last?.id===b.id?10:0)
        -(twoBack?.id===b.id?6:0);

      return scoreB-scoreA || Math.random()-.5;
    });

    const chosen=ranked[0];
    sequence.push(chosen);
    usage[chosen.id]=(usage[chosen.id]||0)+1;
  }

  return sequence;
}


function openedPantryItems(){
  try{
    return JSON.parse(localStorage.getItem("smartCampaniaOpenedPantry")||"[]");
  }catch(e){
    return [];
  }
}

function saveOpenedPantry(items){
  localStorage.setItem("smartCampaniaOpenedPantry", JSON.stringify(items));
}

function recipeIngredientUsageScore(recipe, pantry, opened){
  return Object.keys(recipe.ingredients).reduce((score,key)=>{
    if(opened.includes(key)) score += 8 + ingredientPerishabilityScore(key,true);
    else if(pantry.includes(key)) score += 4 + ingredientPerishabilityScore(key,false);
    return score;
  },0);
}

function recipeWasteRisk(recipe){
  const keys = Object.keys(recipe.ingredients);
  if(!keys.length) return 0;
  const avg = keys.reduce((s,key)=>s+ingredientPerishabilityScore(key,false),0)/keys.length;
  const uniquePenalty = Math.max(0,keys.length-4)*0.8;
  return avg + uniquePenalty;
}

function ingredientReuseMap(meals){
  const map={};
  meals.forEach(day=>{
    [...day.lunch,...day.dinner].forEach(recipe=>{
      Object.keys(recipe.ingredients).forEach(key=>{
        map[key]=(map[key]||0)+1;
      });
    });
  });
  return map;
}

function calculateChefScore(plan){
  const meals=plan.meals||[];
  const recipes=meals.flatMap(d=>[...d.lunch,...d.dinner]);
  const reuse=ingredientReuseMap(meals);
  const uniqueRecipes=new Set(recipes.map(r=>r.id)).size;
  const totalRecipes=recipes.length||1;
  const repeatedRatio=1-(uniqueRecipes/totalRecipes);

  const budgetScore=plan.spent<=plan.budget
    ? 100
    : Math.max(0,100-((plan.spent-plan.budget)/Math.max(plan.budget,1))*120);

  const reusedIngredients=Object.values(reuse).filter(v=>v>1).length;
  const totalIngredients=Math.max(1,Object.keys(reuse).length);
  const reuseScore=Math.min(100,(reusedIngredients/totalIngredients)*130);

  const varietyScore=Math.max(0,100-repeatedRatio*140);

  const balance=weeklyBalanceStats(meals);
  const familyValues=[balance.carne,balance.pesce,balance.legumi,balance.vegetariano];
  const activeFamilies=familyValues.filter(v=>v>0).length;
  const balanceScore=Math.min(100,activeFamilies*22 + (Math.min(...familyValues.filter(v=>v>0) || [0])*3));

  const seasonalRecipes=recipes.filter(r=>{
    if(plan.season==="inverno") return true;
    return r.season?.includes("estate");
  }).length;
  const seasonScore=(seasonalRecipes/totalRecipes)*100;

  const pantry=plan.pantry||[];
  const opened=openedPantryItems();
  const pantryUsed=new Set();
  recipes.forEach(r=>{
    Object.keys(r.ingredients).forEach(k=>{
      if(pantry.includes(k) || opened.includes(k)) pantryUsed.add(k);
    });
  });
  const pantryScore=Math.min(100,pantryUsed.size*14);

  const wasteBase=recipes.reduce((s,r)=>s+recipeWasteRisk(r),0)/totalRecipes;
  const wasteScore=Math.max(0,100-wasteBase*8);

  const score=Math.round(
    budgetScore*0.24 +
    reuseScore*0.19 +
    varietyScore*0.18 +
    balanceScore*0.15 +
    seasonScore*0.10 +
    pantryScore*0.08 +
    wasteScore*0.06
  );

  return {
    total:Math.max(0,Math.min(100,score)),
    budget:Math.round(budgetScore),
    reuse:Math.round(reuseScore),
    variety:Math.round(varietyScore),
    balance:Math.round(balanceScore),
    season:Math.round(seasonScore),
    pantry:Math.round(pantryScore),
    waste:Math.round(wasteScore)
  };
}

function chefScoreLabel(score){
  if(score>=90) return "Eccellente";
  if(score>=80) return "Molto buono";
  if(score>=70) return "Buono";
  if(score>=60) return "Discreto";
  return "Da migliorare";
}

function explainRecipeChoice(recipe, plan){
  const reasons=[];
  const pantry=plan.pantry||[];
  const opened=openedPantryItems();
  const ingredients=Object.keys(recipe.ingredients);

  if(ingredients.some(k=>opened.includes(k))) reasons.push("usa ingredienti già aperti");
  else if(ingredients.some(k=>pantry.includes(k))) reasons.push("usa prodotti già in dispensa");

  if(plan.season==="estate" && recipe.season?.includes("estate")) reasons.push("è adatta all’estate");
  if(plan.season==="inverno") reasons.push("è compatibile con il periodo invernale");

  if(recipe.style?.includes(plan.style)) reasons.push(`rispetta la modalità ${plan.style}`);

  const cost=recipeCost(recipe,1,plan.supermarket,plan.portionScale||1);
  if(cost<=2.5) reasons.push("ha un costo contenuto");

  if(recipeSatiety(recipe)==="leggera") reasons.push("aiuta a bilanciare i pasti più ricchi");
  if(recipeFamily(recipe)==="pesce") reasons.push("aumenta la varietà settimanale");
  if(recipeFamily(recipe)==="legumi") reasons.push("introduce una fonte vegetale di proteine");

  return reasons.slice(0,4);
}

function prioritizeByChefAI(pool, pantry, opened){
  const recent=longTermRecentRecipeIds();
  const favorites=loadFavorites();

  return [...pool].sort((a,b)=>{
    const scoreA=
      recipeIngredientUsageScore(a,pantry,opened) +
      (favorites.has(a.id)?3:0) -
      (recent.has(a.id)?4:0) -
      recipeWasteRisk(a)*0.7;

    const scoreB=
      recipeIngredientUsageScore(b,pantry,opened) +
      (favorites.has(b.id)?3:0) -
      (recent.has(b.id)?4:0) -
      recipeWasteRisk(b)*0.7;

    return scoreB-scoreA || Math.random()-.5;
  });
}


function recipeUrgencyScore(recipe, openedItems, pantryItemsList){
  return Object.keys(recipe.ingredients).reduce((score,key)=>{
    const opened=openedItems.includes(key);
    const inPantry=pantryItemsList.includes(key) || pantryQuantity(key)>0;

    if(opened){
      score += 20 + ingredientPerishabilityScore(key,true)*2;
    }else if(inPantry){
      score += 6 + ingredientPerishabilityScore(key,false);
    }

    return score;
  },0);
}

function reorderMealsByUrgency(meals, openedItems, pantryItemsList){
  const dayPayloads=meals.map((day,index)=>({
    originalIndex:index,
    day,
    urgency:[...day.lunch,...day.dinner].reduce(
      (sum,recipe)=>sum+recipeUrgencyScore(recipe,openedItems,pantryItemsList),
      0
    )
  }));

  dayPayloads.sort((a,b)=>{
    if(b.urgency!==a.urgency) return b.urgency-a.urgency;
    return a.originalIndex-b.originalIndex;
  });

  return dayPayloads.map((payload,index)=>({
    day:DAYS[index],
    lunch:payload.day.lunch,
    dinner:payload.day.dinner,
    urgency:payload.urgency
  }));
}

function firstUseDayForIngredient(meals,key){
  for(let dayIndex=0;dayIndex<meals.length;dayIndex++){
    const used=[...meals[dayIndex].lunch,...meals[dayIndex].dinner]
      .some(recipe=>Object.prototype.hasOwnProperty.call(recipe.ingredients,key));

    if(used) return dayIndex;
  }
  return -1;
}

function buildExpiryPlan(plan){
  const opened=new Set(plan.opened||openedPantryItems());
  const quantities=loadPantryQuantities();
  const selected=new Set(plan.pantry||[]);
  const keys=new Set([
    ...opened,
    ...selected,
    ...Object.keys(quantities).filter(k=>(parseFloat(quantities[k])||0)>0)
  ]);

  return [...keys].map(key=>{
    const isOpened=opened.has(key);
    const shelfLife=ingredientShelfLife(key,isOpened);
    const firstDay=firstUseDayForIngredient(plan.meals,key);
    const quantity=Math.max(0,parseFloat(quantities[key])||0);
    const risk=
      shelfLife<=2 ? "Altissima" :
      shelfLife<=4 ? "Alta" :
      shelfLife<=7 ? "Media" :
      shelfLife<=14 ? "Bassa" : "Minima";

    return {
      key,
      name:PRODUCTS[key]?.name||PANTRY_CATALOG[key]?.name||key,
      unit:PRODUCTS[key]?.unit||"",
      quantity,
      opened:isOpened,
      shelfLife,
      risk,
      firstDay,
      used:firstDay>=0,
      warning:firstDay<0 && shelfLife<=7
    };
  }).sort((a,b)=>{
    if(a.warning!==b.warning) return a.warning?-1:1;
    if(a.shelfLife!==b.shelfLife) return a.shelfLife-b.shelfLife;
    return a.name.localeCompare(b.name,"it");
  });
}

function expiryRiskClass(risk){
  if(risk==="Altissima" || risk==="Alta") return "risk-high";
  if(risk==="Media") return "risk-medium";
  return "risk-low";
}

function renderExpiryPlan(plan){
  const panel=document.getElementById("expiry");
  if(!panel) return;

  const items=buildExpiryPlan(plan);

  if(!items.length){
    panel.innerHTML=`<div class="empty">Inserisci prodotti o quantità nella dispensa per vedere le priorità di consumo.</div>`;
    return;
  }

  panel.innerHTML=items.map(item=>`
    <div class="expiry-card ${item.warning?"expiry-warning":""}">
      <div>
        <div class="item-title">${item.name}</div>
        <div class="item-sub">
          ${item.opened?"Già aperto · ":""}
          Durata stimata: ${item.shelfLife} giorn${item.shelfLife===1?"o":"i"}
          ${item.quantity>0?` · Disponibili ${Math.ceil(item.quantity)} ${item.unit}`:""}
        </div>
        <div class="expiry-status">
          ${item.used
            ? `Primo utilizzo previsto: <strong>${DAYS[item.firstDay]}</strong>`
            : item.warning
              ? `<strong>Non utilizzato nel menu: conviene inserirlo presto.</strong>`
              : `Non previsto nel menu settimanale.`}
        </div>
      </div>
      <span class="risk-badge ${expiryRiskClass(item.risk)}">${item.risk}</span>
    </div>
  `).join("");
}


function buildIngredientUsageTimeline(meals){
  const timeline={};

  meals.forEach((day,dayIndex)=>{
    ["lunch","dinner"].forEach(mealKey=>{
      day[mealKey].forEach(recipe=>{
        Object.entries(recipe.ingredients).forEach(([key,qty])=>{
          if(!timeline[key]){
            timeline[key]={
              key,
              name:PRODUCTS[key]?.name||key,
              unit:PRODUCTS[key]?.unit||"",
              totalQty:0,
              uses:[]
            };
          }

          timeline[key].totalQty+=qty;
          timeline[key].uses.push({
            dayIndex,
            day:DAYS[dayIndex],
            mealKey,
            mealLabel:mealKey==="lunch"?"Pranzo":"Cena",
            recipeId:recipe.id,
            recipeName:recipe.name,
            qty
          });
        });
      });
    });
  });

  return timeline;
}

function ingredientPrepSuggestion(key){
  const suggestions={
    passata:"Prepara un unico sugo base e dividilo in contenitori.",
    pomodorini:"Lava e taglia in anticipo solo la quantità per i primi 2-3 giorni.",
    zucchine:"Lava e affetta insieme; conserva crude e ben asciutte.",
    melanzane:"Taglia e cuoci una base unica da riutilizzare in più piatti.",
    peperoni:"Arrostisci o cuoci una sola volta e conserva in frigorifero.",
    patate:"Lava e porziona; evita di tagliarle troppo presto se non le cuoci subito.",
    broccoli:"Pulisci e sbollenta una sola volta, poi dividi in porzioni.",
    spinaci:"Cuoci una base unica e conserva le porzioni già strizzate.",
    cavolfiore:"Sbollenta e dividi in contenitori per i pasti previsti.",
    pollo:"Porziona da crudo e conserva separatamente; congela ciò che userai più tardi.",
    salsiccia:"Dividi subito le porzioni per i diversi giorni.",
    macinato:"Prepara un impasto base e forma polpette o porzioni separate.",
    merluzzo:"Dividi in porzioni; conserva in frigorifero solo quelle dei primi giorni.",
    provola:"Taglia solo la parte necessaria e conserva il resto ben chiuso.",
    parmigiano:"Grattugia una quantità unica per tutta la settimana.",
    pane:"Porziona e congela ciò che non userai entro 2 giorni.",
    fagioli:"Cuoci o apri una sola confezione e dividi in porzioni.",
    ceci:"Cuoci o apri una sola confezione e dividi in porzioni.",
    lenticchie:"Prepara una sola cottura base e distribuiscila nei vari pasti.",
    riso:"Pesa in anticipo le porzioni, ma cuocilo al momento.",
    spaghetti:"Pesa in anticipo le porzioni, ma cuocili al momento.",
    penne:"Pesa in anticipo le porzioni, ma cuocile al momento.",
    gnocchi:"Dividi le confezioni senza aprirle troppo presto.",
    olio:"Prepara condimenti base già dosati per le ricette.",
    insalata:"Lava e asciuga bene; conserva con carta assorbente."
  };

  return suggestions[key]||"Raggruppa la preparazione e dividi il prodotto nelle porzioni previste.";
}

function prepSafetyNote(key){
  const shelf=ingredientShelfLife(key,false);
  const opened=ingredientShelfLife(key,true);

  if(["pollo","salsiccia","macinato","merluzzo"].includes(key)){
    return "Conserva in frigorifero solo le porzioni dei primi giorni e congela le successive.";
  }

  if(opened<=3){
    return `Dopo l’apertura, usa preferibilmente entro ${opened} giorni.`;
  }

  if(shelf<=5){
    return `Prodotto deperibile: usalo nei primi ${shelf} giorni.`;
  }

  return "Conserva in un contenitore ben chiuso e rispetta le indicazioni della confezione.";
}

function buildBatchCookingPlan(plan){
  const timeline=buildIngredientUsageTimeline(plan.meals);
  const people=plan.people||1;
  const scale=plan.portionScale||1;

  const reusable=Object.values(timeline)
    .filter(item=>item.uses.length>=2)
    .map(item=>{
      const dayIndexes=[...new Set(item.uses.map(u=>u.dayIndex))].sort((a,b)=>a-b);
      const firstDay=dayIndexes[0];
      const lastDay=dayIndexes[dayIndexes.length-1];
      const totalQty=item.totalQty*people*scale;

      return {
        ...item,
        totalQty,
        firstDay,
        lastDay,
        useDays:dayIndexes.map(i=>DAYS[i]),
        prepScore:item.uses.length*5 + ingredientPerishabilityScore(item.key,false),
        suggestion:ingredientPrepSuggestion(item.key),
        safety:prepSafetyNote(item.key)
      };
    })
    .sort((a,b)=>b.prepScore-a.prepScore);

  const tasks=[];
  const groupedByDay={};

  reusable.forEach(item=>{
    const prepDay=Math.max(0,item.firstDay-1);
    if(!groupedByDay[prepDay]) groupedByDay[prepDay]=[];

    groupedByDay[prepDay].push({
      key:item.key,
      name:item.name,
      totalQty:item.totalQty,
      unit:item.unit,
      useDays:item.useDays,
      uses:item.uses,
      suggestion:item.suggestion,
      safety:item.safety
    });
  });

  Object.entries(groupedByDay).forEach(([dayIndex,items])=>{
    tasks.push({
      dayIndex:Number(dayIndex),
      day:Number(dayIndex)===0?"Prima di iniziare":DAYS[Number(dayIndex)],
      items
    });
  });

  tasks.sort((a,b)=>a.dayIndex-b.dayIndex);

  const estimatedMinutes=Math.round(
    reusable.reduce((sum,item)=>{
      const base=["pollo","salsiccia","macinato","merluzzo"].includes(item.key)?12:
        ["zucchine","melanzane","peperoni","broccoli","spinaci","cavolfiore"].includes(item.key)?10:5;
      return sum+base;
    },0)
  );

  const savedMinutes=Math.max(0,Math.round(
    reusable.reduce((sum,item)=>sum+Math.max(0,item.uses.length-1)*7,0)
  ));

  return {
    reusable,
    tasks,
    estimatedMinutes,
    savedMinutes,
    ingredientsOptimized:reusable.length
  };
}

function renderBatchCookingPlan(plan){
  const panel=document.getElementById("prep");
  if(!panel) return;

  const batch=plan.batchCooking||buildBatchCookingPlan(plan);

  if(!batch.tasks.length){
    panel.innerHTML=`<div class="empty">Non ci sono preparazioni ripetute sufficienti per creare un piano anticipato.</div>`;
    return;
  }

  panel.innerHTML=`
    <div class="prep-summary">
      <div class="kpi"><small>Ingredienti organizzati</small><strong>${batch.ingredientsOptimized}</strong></div>
      <div class="kpi"><small>Tempo preparazione</small><strong>${batch.estimatedMinutes} min</strong></div>
      <div class="kpi"><small>Tempo risparmiato stimato</small><strong>${batch.savedMinutes} min</strong></div>
    </div>
    ${batch.tasks.map(task=>`
      <div class="prep-day">
        <h3>${task.day}</h3>
        ${task.items.map(item=>`
          <div class="prep-item">
            <div>
              <div class="item-title">${item.name}</div>
              <div class="item-sub">
                Prepara circa ${Math.ceil(item.totalQty)} ${item.unit} ·
                Usa: ${item.useDays.join(", ")}
              </div>
              <div class="prep-suggestion">${item.suggestion}</div>
              <div class="prep-safety">${item.safety}</div>
            </div>
          </div>
        `).join("")}
      </div>
    `).join("")}
    <div class="footer-note">
      Le indicazioni di conservazione sono generali: verifica sempre etichetta, temperatura e stato reale degli alimenti.
    </div>
  `;
}


function fruitPoolForSeason(season,cats,style,prefs){
  if(!cats.includes("frutta")) return [];

  const seasonal=RECIPES.filter(recipe=>
    recipe.type==="frutta" &&
    (season==="inverno" || recipe.season.includes("estate")) &&
    recipeRespectsPreferences(recipe,prefs)
  );

  // La frutta è un fine pasto: non deve essere esclusa
  // dalle regole pensate per primi, secondi e contorni.
  return seasonal;
}

function buildFruitSequence(count,season,cats,style,prefs,pantry){
  const pool=fruitPoolForSeason(season,cats,style,prefs);
  if(!pool.length || count<=0) return [];

  const opened=openedPantryItems();
  const recent=longTermRecentRecipeIds();
  const usage={};
  const sequence=[];

  for(let i=0;i<count;i++){
    const ranked=[...pool].sort((a,b)=>{
      const keyA=Object.keys(a.ingredients)[0];
      const keyB=Object.keys(b.ingredients)[0];

      const scoreA=
        (pantry.includes(keyA) || pantryQuantity(keyA)>0 ? 10 : 0) +
        (opened.includes(keyA) ? 8 : 0) +
        ingredientPerishabilityScore(keyA,opened.includes(keyA)) -
        (usage[a.id]||0)*9 -
        (recent.has(a.id)?2:0) -
        similarityPenalty(a,sequence,5)*12;

      const scoreB=
        (pantry.includes(keyB) || pantryQuantity(keyB)>0 ? 10 : 0) +
        (opened.includes(keyB) ? 8 : 0) +
        ingredientPerishabilityScore(keyB,opened.includes(keyB)) -
        (usage[b.id]||0)*9 -
        (recent.has(b.id)?2:0) -
        similarityPenalty(b,sequence,5)*12;

      return scoreB-scoreA || Math.random()-.5;
    });

    const previous=sequence[sequence.length-1];
    const chosen=ranked.find(r=>!previous || r.id!==previous.id) || ranked[0];
    sequence.push(chosen);
    usage[chosen.id]=(usage[chosen.id]||0)+1;
  }

  return sequence;
}


function recipeProfile(recipe){
  const name=recipe.name.toLowerCase();
  const ingredients=Object.keys(recipe.ingredients);
  const profile=new Set();

  profile.add(`type:${recipe.type}`);

  recipe.tags.forEach(tag=>profile.add(`tag:${tag}`));

  ingredients.forEach(key=>{
    if(["spaghetti","penne","gnocchi"].includes(key)) profile.add("base:pasta");
    if(key==="riso") profile.add("base:riso");
    if(["fagioli","ceci","lenticchie"].includes(key)) profile.add("base:legumi");
    if(["pollo","salsiccia","macinato"].includes(key)) profile.add("base:carne");
    if(["merluzzo","tonno"].includes(key)) profile.add("base:pesce");
    if(["provola","parmigiano","uova"].includes(key)) profile.add("base:latticini");
    if(["zucchine","melanzane","broccoli","cavolfiore","spinaci","peperoni","patate","insalata","pomodorini","passata"].includes(key)) {
      profile.add(`veg:${key}`);
    }
    if(["mela","pera","banana","arancia","mandarino","clementina","kiwi","uva","anguria","melone","pesca","albicocca","ciliegia","prugna","fico","melagrana","pompelmo","cachi","fragole"].includes(key)){
      profile.add(`fruit:${key}`);
      profile.add("base:frutta");
    }
  });

  if(name.includes("forno") || name.includes("gratin")) profile.add("cook:forno");
  if(name.includes("padella") || name.includes("saltat")) profile.add("cook:padella");
  if(name.includes("risotto")) profile.add("shape:risotto");
  if(name.includes("pasta e ") || name.includes("riso e ")) profile.add("shape:minestra");
  if(name.includes("cremos")) profile.add("texture:cremosa");
  if(name.includes("insalata")) profile.add("texture:fresca");
  if(name.includes("frittata")) profile.add("shape:frittata");
  if(name.includes("polpette")) profile.add("shape:polpette");
  if(name.includes("parmigiana")) profile.add("shape:parmigiana");
  if(name.includes("pomodoro") || name.includes("pomodorini") || recipe.ingredients.passata) profile.add("taste:pomodoro");
  if(recipe.tags.includes("legumi")) profile.add("taste:legumi");
  if(recipe.tags.includes("pesce")) profile.add("taste:pesce");
  if(recipe.tags.includes("carne")) profile.add("taste:carne");

  return profile;
}

function recipeSimilarity(a,b){
  if(!a || !b) return 0;
  if(a.id===b.id) return 1;

  const pa=recipeProfile(a);
  const pb=recipeProfile(b);

  let common=0;
  pa.forEach(token=>{
    if(pb.has(token)) common++;
  });

  const union=new Set([...pa,...pb]).size || 1;
  let score=common/union;

  // Penalità aggiuntive per famiglie molto simili.
  if(a.type===b.type) score+=0.08;
  if(recipeFamily(a)===recipeFamily(b)) score+=0.10;

  const aLegumes=a.tags.includes("legumi");
  const bLegumes=b.tags.includes("legumi");
  if(aLegumes && bLegumes) score+=0.18;

  const aFruit=a.type==="frutta";
  const bFruit=b.type==="frutta";
  if(aFruit && bFruit){
    const aKey=Object.keys(a.ingredients)[0];
    const bKey=Object.keys(b.ingredients)[0];
    if(aKey===bKey) score=1;
  }

  return Math.min(1,score);
}

function similarityPenalty(candidate,selected,maxHistory=5){
  const recent=selected.slice(-maxHistory);
  return recent.reduce((penalty,recipe,index)=>{
    const similarity=recipeSimilarity(candidate,recipe);
    const weight=1-((recent.length-1-index)*0.12);
    return penalty+similarity*weight;
  },0);
}

function buildDiverseSequence(pool,count,season,style,type){
  if(!pool.length || count<=0) return [];

  const sequence=[];
  const usage={};
  const historyIds=longTermRecentRecipeIds();

  for(let i=0;i<count;i++){
    const dayIndex=i%7;
    const theme=dayTheme(dayIndex,season,style);

    const ranked=[...pool].sort((a,b)=>{
      const similarityA=similarityPenalty(a,sequence,6);
      const similarityB=similarityPenalty(b,sequence,6);

      const scoreA=
        themeScore(a,theme)
        -(usage[a.id]||0)*8
        -(historyIds.has(a.id)?4:0)
        -similarityA*14;

      const scoreB=
        themeScore(b,theme)
        -(usage[b.id]||0)*8
        -(historyIds.has(b.id)?4:0)
        -similarityB*14;

      return scoreB-scoreA || Math.random()-.5;
    });

    let chosen=ranked.find(candidate=>{
      const last=sequence[sequence.length-1];
      const twoBack=sequence[sequence.length-2];
      if(last && recipeSimilarity(candidate,last)>=0.72) return false;
      if(twoBack && recipeSimilarity(candidate,twoBack)>=0.82) return false;
      return true;
    }) || ranked[0];

    sequence.push(chosen);
    usage[chosen.id]=(usage[chosen.id]||0)+1;
  }

  return sequence;
}

function weeklySimilarityScore(meals){
  const recipes=meals
    .flatMap(day=>[...day.lunch,...day.dinner])
    .filter(recipe=>recipe.type!=="frutta");

  if(recipes.length<2) return 100;

  let comparisons=0;
  let totalSimilarity=0;

  for(let i=1;i<recipes.length;i++){
    const from=Math.max(0,i-4);
    for(let j=from;j<i;j++){
      totalSimilarity+=recipeSimilarity(recipes[i],recipes[j]);
      comparisons++;
    }
  }

  const average=comparisons ? totalSimilarity/comparisons : 0;
  return Math.max(0,Math.round(100-average*100));
}

function rebalanceSimilarDays(meals,plan){
  const usedIds=new Set(meals.flatMap(day=>[...day.lunch,...day.dinner]).map(r=>r.id));

  meals.forEach((day,dayIndex)=>{
    ["lunch","dinner"].forEach(mealKey=>{
      day[mealKey].forEach((recipe,recipeIndex)=>{
        if(recipe.type==="frutta") return;

        const previousRecipes=[];
        for(let d=Math.max(0,dayIndex-2);d<dayIndex;d++){
          previousRecipes.push(...meals[d].lunch,...meals[d].dinner);
        }

        const tooSimilar=previousRecipes.some(prev=>recipeSimilarity(recipe,prev)>=0.76);
        if(!tooSimilar) return;

        const pool=candidatePoolForRecipe(recipe,plan)
          .filter(candidate=>!usedIds.has(candidate.id))
          .filter(candidate=>previousRecipes.every(prev=>recipeSimilarity(candidate,prev)<0.62))
          .sort((a,b)=>{
            const penaltyA=similarityPenalty(a,previousRecipes,6);
            const penaltyB=similarityPenalty(b,previousRecipes,6);
            return penaltyA-penaltyB;
          });

        const replacement=pool[0];
        if(replacement){
          usedIds.delete(recipe.id);
          usedIds.add(replacement.id);
          day[mealKey][recipeIndex]=replacement;
        }
      });
    });
  });

  return meals;
}


function mealHasFamily(meal,family){
  return meal.some(recipe=>recipe.type==="secondo" && recipeFamily(recipe)===family);
}

function weekHasFamily(meals,family){
  return meals.some(day=>
    mealHasFamily(day.lunch,family) ||
    mealHasFamily(day.dinner,family)
  );
}

function chooseGuaranteedFamilyRecipe(family,plan,usedIds){
  const pool=RECIPES.filter(recipe=>
    recipe.type==="secondo" &&
    recipeFamily(recipe)===family &&
    recipeAllowed(recipe,plan.cats,plan.style,plan.season,plan.prefs)
  );

  return pool
    .filter(recipe=>!usedIds.has(recipe.id))
    .sort((a,b)=>{
      const pantryA=pantryPreferenceScore(a,plan.pantry||[]);
      const pantryB=pantryPreferenceScore(b,plan.pantry||[]);
      const recentA=longTermRecentRecipeIds().has(a.id)?1:0;
      const recentB=longTermRecentRecipeIds().has(b.id)?1:0;
      return (pantryB-recentB*3)-(pantryA-recentA*3) || Math.random()-.5;
    })[0] || pool[0] || null;
}

function enforceWeeklyMeatAndFish(meals,plan){
  const usedIds=new Set(meals.flatMap(day=>[...day.lunch,...day.dinner]).map(r=>r.id));

  ["carne","pesce"].forEach(family=>{
    if(weekHasFamily(meals,family)) return;

    const replacement=chooseGuaranteedFamilyRecipe(family,plan,usedIds);
    if(!replacement) return;

    // Preferisci una cena senza secondo di quella famiglia.
    let target=null;

    for(let dayIndex=0;dayIndex<meals.length;dayIndex++){
      for(const mealKey of ["dinner","lunch"]){
        const meal=meals[dayIndex][mealKey];
        const secondIndex=meal.findIndex(r=>r.type==="secondo" && r.type!=="frutta");

        if(secondIndex>=0){
          const current=meal[secondIndex];
          if(recipeFamily(current)!==family){
            target={dayIndex,mealKey,secondIndex};
            break;
          }
        }
      }
      if(target) break;
    }

    if(!target){
      // Se il menu non contiene secondi, aggiungilo alla prima cena disponibile.
      const dayIndex=meals.findIndex(day=>day.dinner.length>0);
      if(dayIndex>=0){
        const fruitIndex=meals[dayIndex].dinner.findIndex(r=>r.type==="frutta");
        if(fruitIndex>=0) meals[dayIndex].dinner.splice(fruitIndex,0,replacement);
        else meals[dayIndex].dinner.push(replacement);
        usedIds.add(replacement.id);
      }
      return;
    }

    meals[target.dayIndex][target.mealKey][target.secondIndex]=replacement;
    usedIds.add(replacement.id);
  });

  return meals;
}

function buildPlan(){
  const supermarket=document.getElementById("supermarket").value;
  const people=Math.max(1,parseInt(document.getElementById("people").value)||1);
  const budget=Math.max(1,parseFloat(document.getElementById("budget").value)||1);
  const lunch=document.getElementById("lunch").value;
  const dinner=document.getElementById("dinner").value;
  const style=document.getElementById("style").value;
  const season=document.getElementById("season").value;
  const cats=allowedCategories();
  const pantry=pantryItems();
  const opened=openedPantryItems();
  const prefs=foodPreferences();

  if(!cats.length){alert("Seleziona almeno una categoria.");return}

  const lunchHasFirst=["primo","entrambi","primo_contorno","completo"].includes(lunch);
  const lunchHasSecond=["secondo","entrambi","secondo_contorno","completo"].includes(lunch);
  const lunchHasSide=["primo_contorno","secondo_contorno","completo"].includes(lunch);
  const dinnerHasFirst=["primo","entrambi","primo_contorno","completo"].includes(dinner);
  const dinnerHasSecond=["secondo","entrambi","secondo_contorno","completo"].includes(dinner);
  const dinnerHasSide=["primo_contorno","secondo_contorno","completo"].includes(dinner);

  const firstCount=7*(lunchHasFirst?1:0)+7*(dinnerHasFirst?1:0);
  const secondCount=7*(lunchHasSecond?1:0)+7*(dinnerHasSecond?1:0);
  const sideCount=7*(lunchHasSide?1:0)+7*(dinnerHasSide?1:0);

  const firstPool=prioritizeByChefAI(
    chooseRecipes("primo",Math.max(firstCount,1),cats,style,season,prefs),pantry,opened
  );
  const secondPool=prioritizeByChefAI(
    chooseRecipes("secondo",Math.max(secondCount,1),cats,style,season,prefs),pantry,opened
  );
  const sidePool=prioritizeByChefAI(
    chooseRecipes("contorno",Math.max(sideCount,1),cats,style,season,prefs),pantry,opened
  );

  const firsts=diversifyAndReuse(buildDiverseSequence(firstPool,firstCount,season,style,"primo"));
  const seconds=diversifyAndReuse(buildDiverseSequence(secondPool,secondCount,season,style,"secondo"));
  const sides=diversifyAndReuse(buildDiverseSequence(sidePool,sideCount,season,style,"contorno"));

  const fruitMealCount=
    (lunch!=="fuori"?DAYS.length:0) +
    (dinner!=="fuori"?DAYS.length:0);
  const fruits=buildFruitSequence(fruitMealCount,season,cats,style,prefs,pantry);
  let fruitIndex=0;

  if(cats.includes("frutta") && fruitMealCount>0 && !fruits.length){
    console.warn("Frutta selezionata, ma nessun frutto compatibile è stato trovato.");
  }

  if((firstCount&&!firsts.length)||(secondCount&&!seconds.length)||(sideCount&&!sides.length)){
    alert("Non è stato possibile creare il menu. Ricarica la pagina e riprova.");return
  }

  let fi=0,si=0,ci=0; const meals=[];
  const usedSideIds={};

  DAYS.forEach((day,dayIndex)=>{
    const d={day,lunch:[],dinner:[]};

    if(lunchHasFirst) d.lunch.push(firsts[fi++]);
    if(lunchHasSecond) d.lunch.push(seconds[si++]);

    if(lunchHasSide){
      const candidate=chooseBestSide(d.lunch,sidePool,usedSideIds) || sides[ci++];
      if(candidate){
        d.lunch.push(candidate);
        usedSideIds[candidate.id]=(usedSideIds[candidate.id]||0)+1;
      }
    }

    if(lunch!=="fuori" && fruits[fruitIndex]){
      d.lunch.push(fruits[fruitIndex++]);
    }

    if(dinnerHasFirst) d.dinner.push(firsts[fi++]);
    if(dinnerHasSecond) d.dinner.push(seconds[si++]);

    if(dinnerHasSide){
      const candidate=chooseBestSide(d.dinner,sidePool,usedSideIds) || sides[ci++];
      if(candidate){
        d.dinner.push(candidate);
        usedSideIds[candidate.id]=(usedSideIds[candidate.id]||0)+1;
      }
    }

    if(dinner!=="fuori" && fruits[fruitIndex]){
      d.dinner.push(fruits[fruitIndex++]);
    }

    const idsToday=new Set();
    ["lunch","dinner"].forEach(key=>{
      d[key]=d[key].filter(recipe=>{
        if(idsToday.has(recipe.id)) return false;
        idsToday.add(recipe.id);
        return true;
      });
    });

    meals.push(d);
  });

  rebalanceLunchDinner(meals);

  const urgencyOrderedMeals=reorderMealsByUrgency(meals,opened,pantry);
  const diversityPlanContext={cats,style,season,prefs,pantry,people,supermarket,portionScale:1};
  const diversityBalancedMeals=rebalanceSimilarDays(urgencyOrderedMeals,diversityPlanContext);
  const familyBalancedMeals=enforceWeeklyMeatAndFish(diversityBalancedMeals,diversityPlanContext);
  const optimized=optimizeMealsToBudget(familyBalancedMeals,people,supermarket,budget,cats,style,pantry,season,prefs);

  currentPlan={
    id:Date.now(),
    supermarket,people,budget,lunch,dinner,style,season,cats,pantry,opened,prefs,
    pantryCommitted:false,
    pantryCommitDate:null,
    pantryCommitDetails:[],
    meals:optimized.meals,
    shopping:optimized.shopping,
    spent:optimized.spent,
    usedFromPantry:optimized.usedFromPantry||{},
    optimized:optimized.optimized,
    reduced:optimized.reduced,
    portionScale:optimized.portionScale || 1,
    balanceStats:weeklyBalanceStats(optimized.meals),
    nutritionStats:weeklyNutrition(optimized.meals,optimized.portionScale || 1),
    satietyStats:{
      leggera:optimized.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="leggera").length,
      normale:optimized.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="normale").length,
      sostanziosa:optimized.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="sostanziosa").length
    }
  };
  currentPlan.chefScore=calculateChefScore(currentPlan);
  currentPlan.expiryPlan=buildExpiryPlan(currentPlan);
  currentPlan.batchCooking=buildBatchCookingPlan(currentPlan);
  currentPlan.varietyScore=weeklySimilarityScore(currentPlan.meals);
  currentPlan.varietyScore=weeklySimilarityScore(currentPlan.meals);

  localStorage.setItem("smartCampaniaV2Plan",JSON.stringify(currentPlan));
  localStorage.removeItem("smartCampaniaBoughtItems");
  saveCurrentPlanToHistory(currentPlan);
  renderHistory();
  saveSettings();
  renderPlan();

}


function loadBoughtItems(){
  try{
    return JSON.parse(localStorage.getItem("smartCampaniaBoughtItems")||"{}");
  }catch(e){
    return {};
  }
}

function saveBoughtItems(items){
  localStorage.setItem("smartCampaniaBoughtItems",JSON.stringify(items));
}

function carryLeftoversToPantry(){
  if(!currentPlan) return;

  const leftovers=currentPlan.shopping.filter(i=>(i.leftoverQty||0)>0);
  if(!leftovers.length){
    alert("Non ci sono scorte residue da trasferire.");
    return;
  }

  // Salva anche le quantità residue, così restano disponibili
  // per sviluppi futuri della gestione quantitativa della dispensa.
  let saved={};
  try{
    saved=JSON.parse(localStorage.getItem("smartCampaniaCarryover")||"{}");
  }catch(e){
    saved={};
  }

  const pantryQuantities=loadPantryQuantities();

  leftovers.forEach(i=>{
    saved[i.key]=(saved[i.key]||0)+i.leftoverQty;
    pantryQuantities[i.key]=(pantryQuantities[i.key]||0)+i.leftoverQty;
  });

  localStorage.setItem("smartCampaniaCarryover",JSON.stringify(saved));
  savePantryQuantities(pantryQuantities);

  // Parte dalle selezioni realmente visibili nella dispensa.
  const pantry=new Set(pantryItems());
  leftovers.forEach(i=>{
    if(PANTRY_CATALOG[i.key]) pantry.add(i.key);
  });

  // Aggiorna immediatamente le caselle nel pannello di sinistra.
  document.querySelectorAll("[data-pantry]").forEach(box=>{
    box.checked=pantry.has(box.dataset.pantry);
  });

  // Salva tutte le impostazioni correnti, anche se non esisteva
  // ancora alcun salvataggio precedente.
  saveSettings();
  renderPantryQuantityInputs();
  updatePantryCount();

  // Aggiorna anche il piano corrente, così le scorte sono disponibili
  // senza dover chiudere e riaprire l'app.
  currentPlan.pantry=[...pantry];
  localStorage.setItem("smartCampaniaV2Plan",JSON.stringify(currentPlan));

  alert(`${leftovers.length} scort${leftovers.length===1?"a":"e"} aggiunt${leftovers.length===1?"a":"e"} alla dispensa.`);
}


function loadLockedRecipes(){
  try{
    return JSON.parse(localStorage.getItem("smartCampaniaLockedRecipes")||"{}");
  }catch(e){
    return {};
  }
}

function saveLockedRecipes(locks){
  localStorage.setItem("smartCampaniaLockedRecipes",JSON.stringify(locks));
}

function lockKey(dayIndex,mealKey,recipeIndex){
  return `${dayIndex}-${mealKey}-${recipeIndex}`;
}

function toggleLock(dayIndex,mealKey,recipeIndex){
  const locks=loadLockedRecipes();
  const key=lockKey(dayIndex,mealKey,recipeIndex);
  locks[key]=!locks[key];
  saveLockedRecipes(locks);
  renderPlan();
}

function dayNutrition(day,portionScale=1){
  return [...day.lunch,...day.dinner].reduce((tot,recipe)=>{
    const n=recipeNutrition(recipe,portionScale);
    tot.kcal+=n.kcal;
    tot.protein+=n.protein;
    tot.carbs+=n.carbs;
    tot.fat+=n.fat;
    return tot;
  },{kcal:0,protein:0,carbs:0,fat:0});
}

function dayEstimatedCost(day,plan){
  return [...day.lunch,...day.dinner].reduce(
    (sum,recipe)=>sum+recipeCost(recipe,plan.people,plan.supermarket,plan.portionScale||1),
    0
  );
}

function candidatePoolForRecipe(recipe,plan){
  let pool=RECIPES.filter(r=>
    r.type===recipe.type &&
    r.id!==recipe.id &&
    recipeAllowed(r,plan.cats,plan.style,plan.season,plan.prefs||foodPreferences())
  );

  if(!pool.length){
    pool=RECIPES.filter(r=>r.type===recipe.type && r.id!==recipe.id);
  }

  return pool;
}

function replaceSingleRecipe(dayIndex,mealKey,recipeIndex){
  if(!currentPlan) return;

  const locks=loadLockedRecipes();
  const key=lockKey(dayIndex,mealKey,recipeIndex);

  if(locks[key]){
    alert("Questa ricetta è bloccata. Sbloccala prima di cambiarla.");
    return;
  }

  const current=currentPlan.meals[dayIndex][mealKey][recipeIndex];
  const pool=candidatePoolForRecipe(current,currentPlan);
  const usedIds=new Set(currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).map(r=>r.id));
  const sameDayIds=new Set([
    ...currentPlan.meals[dayIndex].lunch,
    ...currentPlan.meals[dayIndex].dinner
  ].map(r=>r.id));

  const nearbyRecipes=[];
  currentPlan.meals.forEach((day,index)=>{
    if(Math.abs(index-dayIndex)<=2){
      nearbyRecipes.push(...day.lunch,...day.dinner);
    }
  });

  const ranked=[...pool].sort((a,b)=>{
    const similarityA=similarityPenalty(a,nearbyRecipes,8);
    const similarityB=similarityPenalty(b,nearbyRecipes,8);

    const scoreA=
      (usedIds.has(a.id)?-5:3) +
      (sameDayIds.has(a.id)?-8:2) +
      pantryPreferenceScore(a,currentPlan.pantry||[]) +
      (loadFavorites().has(a.id)?2:0) -
      (recentRecipeIds().has(a.id)?2:0) -
      similarityA*10;

    const scoreB=
      (usedIds.has(b.id)?-5:3) +
      (sameDayIds.has(b.id)?-8:2) +
      pantryPreferenceScore(b,currentPlan.pantry||[]) +
      (loadFavorites().has(b.id)?2:0) -
      (recentRecipeIds().has(b.id)?2:0) -
      similarityB*10;

    return scoreB-scoreA || Math.random()-.5;
  });

  const replacement=ranked[0];
  if(!replacement){
    alert("Non ho trovato una ricetta alternativa compatibile.");
    return;
  }

  currentPlan.meals[dayIndex][mealKey][recipeIndex]=replacement;
  currentPlan.pantryCommitted=false;
  currentPlan.pantryCommitDate=null;
  currentPlan.pantryCommitDetails=[];

  const recalculated=calculateShopping(
    currentPlan.meals,
    currentPlan.people,
    currentPlan.supermarket,
    currentPlan.pantry||[],
    currentPlan.portionScale||1
  );

  currentPlan.shopping=recalculated.shopping;
  currentPlan.spent=recalculated.spent;
  currentPlan.balanceStats=weeklyBalanceStats(currentPlan.meals);
  currentPlan.nutritionStats=weeklyNutrition(currentPlan.meals,currentPlan.portionScale||1);
  currentPlan.satietyStats={
    leggera:currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="leggera").length,
    normale:currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="normale").length,
    sostanziosa:currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="sostanziosa").length
  };
  currentPlan.chefScore=calculateChefScore(currentPlan);
  currentPlan.expiryPlan=buildExpiryPlan(currentPlan);
  currentPlan.batchCooking=buildBatchCookingPlan(currentPlan);

  localStorage.setItem("smartCampaniaV2Plan",JSON.stringify(currentPlan));
  renderPlan();
}

function favoriteButtonClass(recipeId){
  return loadFavorites().has(recipeId)?"icon-btn favorite":"icon-btn";
}


function recipeIngredientPreview(recipe){
  return Object.keys(recipe.ingredients)
    .slice(0,3)
    .map(key=>PRODUCTS[key]?.name||key)
    .join(", ");
}

function recipeCostPerPortion(recipe,plan){
  return recipeCost(recipe,1,plan.supermarket,plan.portionScale||1);
}

function surprisePlan(){
  if(!currentPlan){
    buildPlan();
    return;
  }

  const locks=loadLockedRecipes();
  let changed=0;

  currentPlan.meals.forEach((day,dayIndex)=>{
    ["lunch","dinner"].forEach(mealKey=>{
      day[mealKey].forEach((recipe,recipeIndex)=>{
        const key=lockKey(dayIndex,mealKey,recipeIndex);
        if(locks[key]) return;

        const pool=candidatePoolForRecipe(recipe,currentPlan)
          .filter(r=>!recentRecipeIds().has(r.id))
          .sort(()=>Math.random()-.5);

        const replacement=pool.find(r=>
          ![...day.lunch,...day.dinner].some(existing=>existing.id===r.id)
        );

        if(replacement){
          currentPlan.meals[dayIndex][mealKey][recipeIndex]=replacement;
          changed++;
        }
      });
    });
  });

  currentPlan.pantryCommitted=false;
  currentPlan.pantryCommitDate=null;
  currentPlan.pantryCommitDetails=[];

  const recalculated=calculateShopping(
    currentPlan.meals,
    currentPlan.people,
    currentPlan.supermarket,
    currentPlan.pantry||[],
    currentPlan.portionScale||1
  );

  currentPlan.shopping=recalculated.shopping;
  currentPlan.spent=recalculated.spent;
  currentPlan.balanceStats=weeklyBalanceStats(currentPlan.meals);
  currentPlan.nutritionStats=weeklyNutrition(currentPlan.meals,currentPlan.portionScale||1);
  currentPlan.satietyStats={
    leggera:currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="leggera").length,
    normale:currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="normale").length,
    sostanziosa:currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="sostanziosa").length
  };

  localStorage.setItem("smartCampaniaV2Plan",JSON.stringify(currentPlan));
  saveCurrentPlanToHistory(currentPlan);
  renderHistory();
  renderPlan();

  alert(changed
    ? `Ho cambiato ${changed} ricette mantenendo bloccate quelle che hai scelto.`
    : "Non ho trovato abbastanza alternative compatibili.");
}


function updatePlanAfterManualChange(){
  currentPlan.pantryCommitted=false;
  currentPlan.pantryCommitDate=null;
  currentPlan.pantryCommitDetails=[];
  const recalculated=calculateShopping(
    currentPlan.meals,
    currentPlan.people,
    currentPlan.supermarket,
    currentPlan.pantry||[],
    currentPlan.portionScale||1
  );

  currentPlan.shopping=recalculated.shopping;
  currentPlan.spent=recalculated.spent;
  currentPlan.balanceStats=weeklyBalanceStats(currentPlan.meals);
  currentPlan.nutritionStats=weeklyNutrition(currentPlan.meals,currentPlan.portionScale||1);
  currentPlan.satietyStats={
    leggera:currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="leggera").length,
    normale:currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="normale").length,
    sostanziosa:currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).filter(r=>recipeSatiety(r)==="sostanziosa").length
  };

  localStorage.setItem("smartCampaniaV2Plan",JSON.stringify(currentPlan));
  renderPlan();
}

function replaceMeal(dayIndex,mealKey){
  if(!currentPlan) return;

  const meal=currentPlan.meals[dayIndex][mealKey];
  if(!meal.length){
    alert("Questo pasto è impostato fuori casa.");
    return;
  }

  const locks=loadLockedRecipes();
  let changed=0;

  meal.forEach((recipe,recipeIndex)=>{
    const key=lockKey(dayIndex,mealKey,recipeIndex);
    if(locks[key]) return;

    const pool=candidatePoolForRecipe(recipe,currentPlan)
      .filter(r=>r.id!==recipe.id)
      .filter(r=>!currentPlan.meals[dayIndex][mealKey].some(x=>x.id===r.id))
      .sort(()=>Math.random()-.5);

    const replacement=pool.find(r=>
      !currentPlan.meals.flatMap(d=>[...d.lunch,...d.dinner]).some(x=>x.id===r.id)
    ) || pool[0];

    if(replacement){
      currentPlan.meals[dayIndex][mealKey][recipeIndex]=replacement;
      changed++;
    }
  });

  if(!changed){
    alert("Non ho trovato alternative compatibili per questo pasto.");
    return;
  }

  updatePlanAfterManualChange();
}

function replaceDay(dayIndex){
  if(!currentPlan) return;

  const before=JSON.stringify(currentPlan.meals[dayIndex]);
  replaceMeal(dayIndex,"lunch");
  replaceMeal(dayIndex,"dinner");

  if(JSON.stringify(currentPlan.meals[dayIndex])===before){
    alert("Non ho trovato alternative compatibili per questa giornata.");
  }
}


function commitPantryUsage(){
  if(!currentPlan) return;

  if(currentPlan.pantryCommitted){
    alert("Le quantità di questo menu sono già state scalate dalla dispensa.");
    return;
  }

  const used=currentPlan.usedFromPantry||{};
  const usedEntries=Object.entries(used).filter(([,qty])=>(parseFloat(qty)||0)>0);

  if(!usedEntries.length){
    alert("Questo menu non utilizza quantità registrate nella dispensa.");
    return;
  }

  const quantities=loadPantryQuantities();
  const details=[];

  usedEntries.forEach(([key,qty])=>{
    const before=Math.max(0,parseFloat(quantities[key])||0);
    const usedQty=Math.min(before,Math.max(0,parseFloat(qty)||0));
    const after=Math.max(0,before-usedQty);

    if(after>0) quantities[key]=after;
    else delete quantities[key];

    details.push({
      key,
      name:PRODUCTS[key]?.name||key,
      before,
      used:usedQty,
      after,
      unit:PRODUCTS[key]?.unit||""
    });
  });

  savePantryQuantities(quantities);

  const pantrySet=new Set(pantryItems());
  details.forEach(item=>{
    if(item.after<=0) pantrySet.delete(item.key);
  });

  document.querySelectorAll("[data-pantry]").forEach(box=>{
    box.checked=pantrySet.has(box.dataset.pantry);
  });

  currentPlan.pantry=[...pantrySet];
  currentPlan.pantryCommitted=true;
  currentPlan.pantryCommitDate=new Date().toLocaleString("it-IT");
  currentPlan.pantryCommitDetails=details;

  localStorage.setItem("smartCampaniaV2Plan",JSON.stringify(currentPlan));
  saveSettings();
  renderPantryQuantityInputs();
  updatePantryCount();
  renderPlan();

  alert("Le quantità utilizzate sono state scalate correttamente dalla dispensa.");
}

function undoPantryUsage(){
  if(!currentPlan?.pantryCommitted){
    alert("Non ci sono quantità da ripristinare.");
    return;
  }

  const quantities=loadPantryQuantities();
  const details=currentPlan.pantryCommitDetails||[];

  details.forEach(item=>{
    quantities[item.key]=(parseFloat(quantities[item.key])||0)+(parseFloat(item.used)||0);
  });

  savePantryQuantities(quantities);

  const pantrySet=new Set(pantryItems());
  details.forEach(item=>pantrySet.add(item.key));

  document.querySelectorAll("[data-pantry]").forEach(box=>{
    box.checked=pantrySet.has(box.dataset.pantry);
  });

  currentPlan.pantry=[...pantrySet];
  currentPlan.pantryCommitted=false;
  currentPlan.pantryCommitDate=null;

  localStorage.setItem("smartCampaniaV2Plan",JSON.stringify(currentPlan));
  saveSettings();
  renderPantryQuantityInputs();
  updatePantryCount();
  renderPlan();

  alert("Le quantità sono state ripristinate nella dispensa.");
}

function pantryCommitStatus(plan){
  if(plan.pantryCommitted){
    return `<div class="commit-box committed">
      <strong>Dispensa aggiornata</strong>
      <div class="section-note">Quantità scalate il ${plan.pantryCommitDate||""}.</div>
      <button type="button" class="secondary" onclick="undoPantryUsage()">Annulla aggiornamento</button>
    </div>`;
  }

  const hasUsage=Object.values(plan.usedFromPantry||{}).some(v=>(parseFloat(v)||0)>0);

  if(!hasUsage){
    return `<div class="commit-box">
      <strong>Nessuna quantità da scalare</strong>
      <div class="section-note">Il menu non utilizza prodotti con quantità registrate in dispensa.</div>
    </div>`;
  }

  return `<div class="commit-box">
    <strong>Conferma questo menu</strong>
    <div class="section-note">Scala dalla dispensa le quantità realmente utilizzate durante la settimana.</div>
    <button type="button" class="primary" onclick="commitPantryUsage()">Conferma e aggiorna dispensa</button>
  </div>`;
}

function renderPlan(){
  if(!currentPlan)return;
  const p=currentPlan;
  document.getElementById("kBudget").textContent=euro(p.budget);
  document.getElementById("kSpent").textContent=euro(p.spent);
  document.getElementById("kLeft").textContent=euro(p.budget-p.spent);
  const count=p.meals.reduce((n,d)=>n+d.lunch.length+d.dinner.length,0);
  document.getElementById("kMeals").textContent=count;
  document.getElementById("budgetBar").style.width=Math.min(100,(p.spent/p.budget)*100)+"%";
  document.getElementById("budgetBar").style.background=p.spent>p.budget?"var(--danger)":"var(--primary)";

  const groupedShopping={};
  p.shopping.forEach(item=>{
    const dep=item.department||"dispensa";
    if(!groupedShopping[dep]) groupedShopping[dep]=[];
    groupedShopping[dep].push(item);
  });

  const departmentOrder=["ortofrutta","macelleria","pescheria","latticini","pane","dispensa","surgelati"];

  document.getElementById("shopping").innerHTML=departmentOrder
    .filter(dep=>groupedShopping[dep]?.length)
    .map(dep=>`
      <div class="day">
        <h3>${DEPARTMENT_LABELS[dep]||dep}</h3>
        ${groupedShopping[dep].map(i=>`
          <div class="shopping-item ${loadBoughtItems()[i.key]?"bought":""}" data-shopping-row="${i.key}">
            <label class="shopping-check">
              <input type="checkbox" data-buy-key="${i.key}" ${loadBoughtItems()[i.key]?"checked":""}>
              <span style="flex:1">
                <span class="item-title">${i.name}</span>
                <span class="item-sub">Necessari ${Math.ceil(i.qty)} ${i.unit} · Acquista ${i.packDescription||(`${i.packs} confezioni`)}</span>
                ${i.leftoverQty>0?`<span class="leftover">Residuo stimato: ${Math.ceil(i.leftoverQty)} ${i.unit}</span>`:""}
              </span>
              <span class="price">${euro(i.total)}</span>
            </label>
          </div>
        `).join("")}
      </div>
    `).join("");

  document.querySelectorAll("[data-buy-key]").forEach(box=>{
    box.addEventListener("change",()=>{
      const state=loadBoughtItems();
      state[box.dataset.buyKey]=box.checked;
      saveBoughtItems(state);

      const row=document.querySelector(`[data-shopping-row="${box.dataset.buyKey}"]`);
      if(row) row.classList.toggle("bought",box.checked);
    });
  });


  renderExpiryPlan(p);
  renderBatchCookingPlan(p);

  const leftovers=p.shopping.filter(i=>(i.leftoverQty||0)>0);
  document.getElementById("leftovers").innerHTML=leftovers.length
    ? leftovers.map(i=>`
      <div class="shopping-item">
        <div>
          <div class="item-title">${i.name}</div>
          <div class="item-sub">Acquistati ${Math.ceil(i.purchasedQty)} ${i.unit} · Usati ${Math.ceil(i.qty)} ${i.unit}</div>
        </div>
        <div class="price">${Math.ceil(i.leftoverQty)} ${i.unit}</div>
      </div>
    `).join("")+
    `${Object.values(p.usedFromPantry||{}).some(v=>v>0)?`
      <div class="carry-box">
        <strong>Prodotti usati dalla dispensa</strong>
        ${Object.entries(p.usedFromPantry||{}).filter(([,v])=>v>0).map(([key,value])=>`
          <div class="shopping-item">
            <div class="item-title">${PRODUCTS[key]?.name||key}</div>
            <div class="price">${Math.ceil(value)} ${PRODUCTS[key]?.unit||""}</div>
          </div>
        `).join("")}
      </div>`:""}
    <div class="carry-box">
      <strong>Usa le scorte la prossima settimana</strong>
      <div class="section-note">Premendo il pulsante, gli articoli residui vengono aggiunti automaticamente alla dispensa salvata.</div>
      <button type="button" class="secondary" onclick="carryLeftoversToPantry()">Aggiungi scorte alla dispensa</button>
    </div>`
    : `<div class="empty">Nessuna scorta residua significativa.</div>`;

  document.getElementById("menu").innerHTML=p.meals.map((d,dayIndex)=>{
    const nutrition=dayNutrition(d,p.portionScale||1);
    const cost=dayEstimatedCost(d,p);
    const locks=loadLockedRecipes();

    function renderMeal(mealKey,label,icon){
      const recipes=d[mealKey];
      if(!recipes.length){
        return `<div class="meal-block"><div class="meal-title">${icon} ${label}</div><div class="item-sub">Fuori casa</div></div>`;
      }

      return `<div class="meal-block">
        <div class="meal-title">${icon} ${label}</div>
        <div class="meal-actions">
          <button type="button" class="day-action-btn" onclick="replaceMeal(${dayIndex},'${mealKey}')">🔄 ${label}</button>
        </div>
        ${recipes.map((r,recipeIndex)=>{
          const key=lockKey(dayIndex,mealKey,recipeIndex);
          const locked=!!locks[key];
          const favorite=loadFavorites().has(r.id);

          return `<div class="recipe-row">
            <div class="recipe-main">
              <div class="menu-recipe-title">
                <span class="menu-recipe-icon ${recipeVisualClass(r)}">${recipeTypeIcon(r)}</span>
                <div class="item-title recipe-link" data-recipe="${r.id}">${r.type==="primo"?"Primo: ":r.type==="secondo"?"Secondo: ":r.type==="frutta"?"Frutta: ":"Contorno: "}${r.name}</div>
              </div>
              <div class="recipe-preview">${recipeIngredientPreview(r)}</div>
              <div class="recipe-preview"><strong>Perché:</strong> ${explainRecipeChoice(r,p).join(" · ") || "coerente con il menu settimanale"}</div>
              <div class="recipe-badges">
                <span class="mini-badge">⏱ ${recipeTime(r)}</span>
                <span class="mini-badge">👨‍🍳 ${recipeDifficulty(r)}</span>
                <span class="mini-badge">🍽 ${recipeSatiety(r)}</span>
                <span class="mini-badge">💰 ${euro(recipeCostPerPortion(r,p))}/persona</span>
              </div>
            </div>
            <div class="recipe-actions">
              <button type="button" class="icon-btn" onclick="replaceSingleRecipe(${dayIndex},'${mealKey}',${recipeIndex})">🔄 Cambia</button>
              <button type="button" class="${locked?"icon-btn locked":"icon-btn"}" onclick="toggleLock(${dayIndex},'${mealKey}',${recipeIndex})">${locked?"🔒":"🔓"}</button>
              <button type="button" class="${favoriteButtonClass(r.id)}" onclick="toggleFavorite('${r.id}');renderPlan()">${favorite?"★":"☆"}</button>
            </div>
          </div>`;
        }).join("")}
      </div>`;
    }

    return `<div class="day">
      <div class="day-head">
        <div>
          <h3>${d.day}${d.day==="Sabato"?" · Piatto speciale":d.day==="Domenica"?" · Tradizione":""}</h3>
        </div>
        <div class="day-meta">
          <div class="day-cost">${euro(cost)}</div>
          <div>${Math.round(nutrition.kcal)} kcal</div>
          <div class="day-actions">
            <button type="button" class="day-action-btn" onclick="replaceDay(${dayIndex})">🔄 Giorno</button>
          </div>
        </div>
      </div>
      ${renderMeal("lunch","Pranzo","🍝")}
      ${renderMeal("dinner","Cena","🌙")}
    </div>`;
  }).join("");

  const diff=p.budget-p.spent;
  document.getElementById("stats").innerHTML=`
    <div class="shopping-item"><div class="item-title">Persone</div><div class="price">${p.people}</div></div>
    <div class="shopping-item"><div class="item-title">Tipo di cucina</div><div class="price">${p.style==="veloce"?"Veloce":p.style==="gourmet"?"Gourmet":"Normale"}</div></div>
    <div class="shopping-item"><div class="item-title">Preferenze attive</div><div class="price">${[
      p.prefs?.avoidFish?"No pesce":"",
      p.prefs?.avoidMeat?"No carne":"",
      p.prefs?.avoidLegumes?"No legumi":"",
      p.prefs?.avoidDairy?"No latticini":""
    ].filter(Boolean).join(", ") || "Nessuna"}</div></div>
    <div class="shopping-item"><div class="item-title">Quantità porzioni</div><div class="price">${Math.round((p.portionScale||1)*100)}%</div></div>
    <div class="shopping-item"><div class="item-title">Piatti di carne</div><div class="price">${(p.balanceStats||weeklyBalanceStats(p.meals)).carne}</div></div>
    <div class="shopping-item"><div class="item-title">Piatti di pesce</div><div class="price">${(p.balanceStats||weeklyBalanceStats(p.meals)).pesce}</div></div>
    <div class="shopping-item"><div class="item-title">Piatti con legumi</div><div class="price">${(p.balanceStats||weeklyBalanceStats(p.meals)).legumi}</div></div>
    <div class="shopping-item"><div class="item-title">Piatti vegetariani</div><div class="price">${(p.balanceStats||weeklyBalanceStats(p.meals)).vegetariano}</div></div>
    <div class="shopping-item"><div class="item-title">Calorie settimanali stimate</div><div class="price">${Math.round((p.nutritionStats||weeklyNutrition(p.meals,p.portionScale||1)).kcal)} kcal</div></div>
    <div class="shopping-item"><div class="item-title">Calorie medie giornaliere</div><div class="price">${Math.round((p.nutritionStats||weeklyNutrition(p.meals,p.portionScale||1)).kcal/7)} kcal</div></div>
    <div class="shopping-item"><div class="item-title">Proteine settimanali</div><div class="price">${(p.nutritionStats||weeklyNutrition(p.meals,p.portionScale||1)).protein.toFixed(0)} g</div></div>
    <div class="shopping-item"><div class="item-title">Carboidrati settimanali</div><div class="price">${(p.nutritionStats||weeklyNutrition(p.meals,p.portionScale||1)).carbs.toFixed(0)} g</div></div>
    <div class="shopping-item"><div class="item-title">Grassi settimanali</div><div class="price">${(p.nutritionStats||weeklyNutrition(p.meals,p.portionScale||1)).fat.toFixed(0)} g</div></div>
    <div class="shopping-item"><div class="item-title">Prodotti diversi</div><div class="price">${p.shopping.length}</div></div>
    <div class="shopping-item"><div class="item-title">Ingredienti riutilizzati</div><div class="price">${Math.max(0,p.meals.reduce((all,d)=>all.concat(d.lunch,d.dinner),[]).flatMap(r=>Object.keys(r.ingredients)).length-p.shopping.length)}</div></div>
    <div class="shopping-item"><div class="item-title">Confezioni totali</div><div class="price">${p.shopping.reduce((s,i)=>s+i.packs,0)}</div></div>
    <div class="shopping-item"><div class="item-title">Scorte residue stimate</div><div class="price">${Math.round(p.shopping.reduce((s,i)=>s+(i.leftoverQty||0),0))} g/ml/pz</div></div>
    <div class="shopping-item"><div class="item-title">Articoli già acquistati</div><div class="price">${Object.values(loadBoughtItems()).filter(Boolean).length}</div></div>
    <div class="shopping-item"><div class="item-title">Ricette preferite</div><div class="price">${loadFavorites().size}</div></div>
    <div class="shopping-item"><div class="item-title">Menu salvati in cronologia</div><div class="price">${loadMenuHistory().length}</div></div>
    <div class="shopping-item"><div class="item-title">Chef Score</div><div class="price">${(p.chefScore||calculateChefScore(p)).total}/100</div></div>
    <div class="shopping-item"><div class="item-title">Valutazione menu</div><div class="price">${chefScoreLabel((p.chefScore||calculateChefScore(p)).total)}</div></div>
    <div class="shopping-item"><div class="item-title">Riutilizzo ingredienti</div><div class="price">${(p.chefScore||calculateChefScore(p)).reuse}/100</div></div>
    <div class="shopping-item"><div class="item-title">Riduzione sprechi</div><div class="price">${(p.chefScore||calculateChefScore(p)).waste}/100</div></div>
    <div class="shopping-item"><div class="item-title">Varietà reale del menu</div><div class="price">${p.varietyScore??weeklySimilarityScore(p.meals)}/100</div></div>
    <div class="shopping-item"><div class="item-title">Carne presente nella settimana</div><div class="price">${weekHasFamily(p.meals,"carne")?"Sì":"No"}</div></div>
    <div class="shopping-item"><div class="item-title">Pesce presente nella settimana</div><div class="price">${weekHasFamily(p.meals,"pesce")?"Sì":"No"}</div></div>
    <div class="shopping-item"><div class="item-title">Prodotti prioritari</div><div class="price">${(p.expiryPlan||buildExpiryPlan(p)).filter(x=>x.shelfLife<=7).length}</div></div>
    <div class="shopping-item"><div class="item-title">Prodotti deperibili non usati</div><div class="price">${(p.expiryPlan||buildExpiryPlan(p)).filter(x=>x.warning).length}</div></div>
    <div class="shopping-item"><div class="item-title">Ingredienti da preparare insieme</div><div class="price">${(p.batchCooking||buildBatchCookingPlan(p)).ingredientsOptimized}</div></div>
    <div class="shopping-item"><div class="item-title">Tempo risparmiato stimato</div><div class="price">${(p.batchCooking||buildBatchCookingPlan(p)).savedMinutes} min</div></div>
    <div class="shopping-item"><div class="item-title">Ricette leggere</div><div class="price">${(p.satietyStats||{}).leggera||0}</div></div>
    <div class="shopping-item"><div class="item-title">Ricette normali</div><div class="price">${(p.satietyStats||{}).normale||0}</div></div>
    <div class="shopping-item"><div class="item-title">Ricette sostanziose</div><div class="price">${(p.satietyStats||{}).sostanziosa||0}</div></div>
    <div class="shopping-item"><div class="item-title">Articoli già in dispensa</div><div class="price">${(p.pantry||[]).length}</div></div>
    <div class="shopping-item"><div class="item-title">Ingredienti usati dalla dispensa</div><div class="price">${Object.values(p.usedFromPantry||{}).filter(v=>v>0).length}</div></div>
    <div class="shopping-item"><div class="item-title">Quantità totali usate dalla dispensa</div><div class="price">${Math.round(Object.values(p.usedFromPantry||{}).reduce((a,b)=>a+b,0))} g/ml/pz</div></div>
    <div class="shopping-item"><div class="item-title">Dispensa aggiornata</div><div class="price">${p.pantryCommitted?"Sì":"No"}</div></div>
    <div class="shopping-item"><div class="item-title">${diff>=0?"Residuo":"Sforamento"}</div><div class="price" style="color:${diff>=0?"var(--ok)":"var(--danger)"}">${euro(Math.abs(diff))}</div></div>
    ${pantryCommitStatus(p)}
    <div class="footer-note">${p.optimized?"Il menu è stato ottimizzato per rispettare il budget. ":""}${(p.portionScale||1)<1?"Le quantità per porzione sono state ridotte automaticamente per rientrare nel tetto scelto. ":""}Il motore distribuisce carne, pesce, legumi e piatti vegetariani durante la settimana. I valori nutrizionali sono stime indicative basate sugli ingredienti inseriti.</div>`;

  document.querySelectorAll("[data-recipe]").forEach(el=>el.onclick=()=>openRecipe(el.dataset.recipe));
}


function recipeTime(recipe){
  if(recipe.type==="frutta") return "2-5 min";
  if(recipe.style.includes("gourmet")) return "45-70 min";
  if(recipe.style.includes("veloce")) return "10-20 min";
  return "25-40 min";
}

function recipeDifficulty(recipe){
  if(recipe.type==="frutta") return "Facile";
  if(recipe.style.includes("gourmet")) return "Media";
  if(recipe.style.includes("veloce")) return "Facile";
  return "Facile/Media";
}

function recipeTip(recipe){
  if(recipe.type==="frutta"){
    return "Lava la frutta poco prima del consumo e conservala secondo le indicazioni del prodotto.";
  }
  if(recipe.type==="primo"){
    if(recipe.tags.includes("pesce")) return "Manteca la pasta con poca acqua di cottura per legare meglio il condimento.";
    if(recipe.tags.includes("legumi")) return "Frulla una piccola parte dei legumi per ottenere una consistenza più cremosa.";
    return "Scola la pasta al dente e termina la cottura direttamente nel condimento.";
  }
  if(recipe.type==="secondo"){
    if(recipe.tags.includes("pesce")) return "Evita cotture troppo lunghe: il pesce resta più morbido e succoso.";
    if(recipe.tags.includes("carne")) return "Lascia riposare la carne qualche minuto prima di servirla.";
    return "Servi il piatto caldo e completa con un filo d’olio a crudo.";
  }
  return "Condisci il contorno poco prima di servirlo per mantenerne consistenza e freschezza.";
}

function recipeCost(recipe,people,supermarket,portionScale){
  return Object.entries(recipe.ingredients).reduce((sum,[key,qty])=>{
    const product=PRODUCTS[key];
    if(!product) return sum;
    const needed=qty*people*portionScale;
    return sum+(needed/product.pack)*product.prices[supermarket];
  },0);
}

function openRecipe(id){
  const r=RECIPES.find(x=>x.id===id);
  if(!r) return;

  const people=currentPlan?.people || Math.max(1,parseInt(document.getElementById("people").value)||1);
  const portionScale=currentPlan?.portionScale || 1;
  const supermarket=currentPlan?.supermarket || document.getElementById("supermarket").value;

  document.getElementById("modalTitle").textContent=r.name;
  document.getElementById("modalRecipeIcon").textContent=recipeTypeIcon(r);
  document.getElementById("modalRecipeIcon").className=`modal-recipe-icon ${recipeVisualClass(r)}`;
  document.getElementById("modalDescription").textContent=recipeShortDescription(r);
  document.getElementById("modalType").textContent=
    r.type==="primo" ? "Primo piatto" :
    r.type==="secondo" ? "Secondo piatto" :
    r.type==="frutta" ? "Frutta di fine pasto" : "Contorno";

  document.getElementById("modalTime").textContent=recipeTime(r);
  document.getElementById("modalDifficulty").textContent=recipeDifficulty(r);
  document.getElementById("modalPortions").textContent=people;
  document.getElementById("modalCost").textContent=euro(recipeCost(r,people,supermarket,portionScale));
  document.getElementById("modalSatiety").textContent=
    recipeSatiety(r)==="leggera"?"Leggera":
    recipeSatiety(r)==="sostanziosa"?"Sostanziosa":"Normale";
  const nutrition=recipeNutrition(r,portionScale);
  document.getElementById("modalKcal").textContent=Math.round(nutrition.kcal)+" kcal";
  document.getElementById("modalProtein").textContent=nutrition.protein.toFixed(1)+" g";
  document.getElementById("modalCarbs").textContent=nutrition.carbs.toFixed(1)+" g";
  document.getElementById("modalFat").textContent=nutrition.fat.toFixed(1)+" g";
  document.getElementById("modalTip").textContent=recipeTip(r);

  document.getElementById("modalIngredients").innerHTML=
    Object.entries(r.ingredients).map(([k,q])=>{
      const product=PRODUCTS[k];
      const calculated=q*people*portionScale;
      const shown=product.unit==="pz" ? Math.max(1,Math.ceil(calculated)) : Math.ceil(calculated);
      return `<li>${product.name}: ${shown} ${product.unit}</li>`;
    }).join("");

  document.getElementById("modalSteps").innerHTML=
    r.steps.map(s=>`<li>${s}</li>`).join("");

  document.getElementById("recipeModal").classList.add("open");
}




const SUPERMARKET_PICKER_DATA={
  conad:{name:"Conad",logo:"https://upload.wikimedia.org/wikipedia/commons/c/cf/Italian_Conad_Logo_Italia.png"},
  lidl:{name:"Lidl",logo:"https://upload.wikimedia.org/wikipedia/commons/9/91/Lidl-Logo.svg"},
  eurospin:{name:"Eurospin",logo:"https://upload.wikimedia.org/wikipedia/commons/5/57/Eurospin_New_Logo.svg"},
  sole365:{name:"Sole 365",logo:"https://upload.wikimedia.org/wikipedia/commons/f/ff/Sole-365-logo.png"},
  piccolo:{name:"Supermercati Piccolo",logo:"https://www.gruppovege.it/uploads/brands/1495641488-5fbd5b66847f0.jpeg"},
  deco:{name:"Decò",logo:"https://upload.wikimedia.org/wikipedia/commons/3/35/Logo_dec%C3%B2.png"}
};

function updateSupermarketLogo(){
  const select=document.getElementById("supermarket");
  const image=document.getElementById("selectedMarketLogo");
  const name=document.getElementById("selectedMarketName");

  if(!select) return;
  const market=SUPERMARKET_PICKER_DATA[select.value]||SUPERMARKET_PICKER_DATA.conad;

  if(image){
    image.src=market.logo;
    image.alt=`Logo ${market.name}`;
  }
  if(name) name.textContent=market.name;

  document.querySelectorAll("[data-market-choice]").forEach(option=>{
    option.classList.toggle("active",option.dataset.marketChoice===select.value);
  });
}

function openMarketPicker(){
  const modal=document.getElementById("marketModal");
  if(!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  document.body.classList.add("market-modal-open");
}

function closeMarketPicker(){
  const modal=document.getElementById("marketModal");
  if(!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  document.body.classList.remove("market-modal-open");
}

function initMarketPicker(){
  const select=document.getElementById("supermarket");
  const openButton=document.getElementById("openMarketPicker");

  if(!select || !openButton) return;

  openButton.addEventListener("click",openMarketPicker);

  document.querySelectorAll("[data-close-market]").forEach(element=>{
    element.addEventListener("click",closeMarketPicker);
  });

  document.querySelectorAll("[data-market-choice]").forEach(option=>{
    option.addEventListener("click",()=>{
      select.value=option.dataset.marketChoice;
      updateSupermarketLogo();
      saveSettings();
      closeMarketPicker();
    });
  });

  document.addEventListener("keydown",event=>{
    if(event.key==="Escape") closeMarketPicker();
  });

  updateSupermarketLogo();
}


function updateQuickSummary(){
  const budget=document.getElementById("budget");
  const people=document.getElementById("people");
  const season=document.getElementById("season");
  const quickBudget=document.getElementById("quickBudget");
  const quickPeople=document.getElementById("quickPeople");
  const quickSeason=document.getElementById("quickSeason");

  if(quickBudget && budget) quickBudget.textContent=`€${parseFloat(budget.value||0).toFixed(0)}`;
  if(quickPeople && people) quickPeople.textContent=people.value||"1";
  if(quickSeason && season) quickSeason.textContent=season.value==="estate"?"Estate":"Inverno";
}

function saveSettings(){
  updateSupermarketLogo();
  updateQuickSummary();
 updateSupermarketLogo();
 const s={
  settingsVersion:2,
  supermarket:supermarket.value,people:people.value,budget:budget.value,lunch:lunch.value,
  dinner:dinner.value,style:style.value,season:season.value,cats:allowedCategories(),pantry:pantryItems(),prefs:foodPreferences()
 };
 localStorage.setItem("smartCampaniaV2Settings",JSON.stringify(s));
}
function loadSettings(){
 const raw=localStorage.getItem("smartCampaniaV2Settings"); if(!raw)return;
 try{
  const s=JSON.parse(raw);

  // Migrazione una tantum delle impostazioni create prima
  // dell'introduzione della frutta nel menu.
  if((s.settingsVersion||0)<2){
    const migratedCats=new Set(s.cats||[]);
    migratedCats.add("frutta");
    s.cats=[...migratedCats];
    s.settingsVersion=2;
    localStorage.setItem("smartCampaniaV2Settings",JSON.stringify(s));

    // Un vecchio menu salvato non contiene la frutta: viene eliminato
    // per evitare di mostrarlo come se fosse stato appena generato.
    localStorage.removeItem("smartCampaniaV2Plan");
  }

  ["supermarket","people","budget","lunch","dinner","style","season"].forEach(k=>{if(s[k]!=null)document.getElementById(k).value=s[k]});
  if(s.cats)document.querySelectorAll("[data-cat]").forEach(x=>x.checked=s.cats.includes(x.dataset.cat));
  if(s.pantry)document.querySelectorAll("[data-pantry]").forEach(x=>x.checked=s.pantry.includes(x.dataset.pantry));
  if(s.prefs){
    document.getElementById("avoid-fish").checked=!!s.prefs.avoidFish;
    document.getElementById("avoid-meat").checked=!!s.prefs.avoidMeat;
    document.getElementById("avoid-legumes").checked=!!s.prefs.avoidLegumes;
    document.getElementById("avoid-dairy").checked=!!s.prefs.avoidDairy;
  }
 }catch(e){}
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
 document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
 b.classList.add("active");document.getElementById(b.dataset.tab).classList.add("active");
});
document.getElementById("surpriseBtn").onclick=surprisePlan;
document.getElementById("generateBtn").onclick=()=>{
  const btn=document.getElementById("generateBtn");
  const oldHtml=btn.innerHTML;
  btn.disabled=true;
  btn.innerHTML="<span>Sto creando il menu...</span><small>Chef AI sta lavorando</small>";

  try{
    buildPlan();
  }catch(error){
    console.error(error);
    alert("Si è verificato un errore nella generazione. Ricarica il file e riprova.");
  }finally{
    setTimeout(()=>{
      btn.disabled=false;
      btn.innerHTML=oldHtml;
    },350);
  }
};

function printPanel(panelId,title){
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("print-target"));
  const panel=document.getElementById(panelId);
  panel.classList.add("print-target");

  const oldTitle=document.title;
  document.title=title;
  window.print();
  document.title=oldTitle;

  setTimeout(()=>panel.classList.remove("print-target"),200);
}

document.getElementById("printShoppingBtn").onclick=()=>{
  if(!currentPlan){
    alert("Genera prima un piano settimanale.");
    return;
  }
  printPanel("shopping","Lista della spesa - Smart Campania");
};

document.getElementById("printMenuBtn").onclick=()=>{
  if(!currentPlan){
    alert("Genera prima un piano settimanale.");
    return;
  }
  printPanel("menu","Menu settimanale - Smart Campania");
};

document.getElementById("resetBtn").onclick=()=>{
 if(confirm("Vuoi cancellare i dati salvati?")){
  localStorage.removeItem("smartCampaniaV2Plan");
  localStorage.removeItem("smartCampaniaV2Settings");
  localStorage.removeItem("smartCampaniaLockedRecipes");
  localStorage.removeItem("smartCampaniaOpenedPantry");
  localStorage.removeItem("smartCampaniaPantryQuantities");
  localStorage.removeItem("smartCampaniaCarryover");
  location.reload();
 }
};
document.getElementById("closeModal").onclick=()=>recipeModal.classList.remove("open");
document.getElementById("recipeModal").onclick=e=>{if(e.target.id==="recipeModal")recipeModal.classList.remove("open")};
window.addEventListener("load",()=>{
 renderPantry();
 loadSettings();
 initMarketPicker();
 updateQuickSummary();
 updatePantryCount();
 document.getElementById("pantrySearch").addEventListener("input",filterPantry);
 document.getElementById("recipeSearch").addEventListener("input",renderRecipeLibrary);
 document.getElementById("showFavoritesBtn").onclick=()=>{
   showOnlyFavorites=!showOnlyFavorites;
   document.getElementById("showFavoritesBtn").textContent=showOnlyFavorites?"Mostra tutte":"Solo preferiti";
   renderRecipeLibrary();
 };
 renderRecipeLibrary();
 renderHistory();

 document.querySelectorAll("[data-detail]").forEach(btn=>{
   btn.addEventListener("click",()=>{
     document.querySelectorAll("[data-detail]").forEach(x=>x.classList.toggle("active",x===btn));
     document.querySelectorAll(".detail-panel").forEach(panel=>{
       panel.classList.toggle("active",panel.id===btn.dataset.detail);
     });
   });
 });
 document.querySelectorAll("#avoid-fish,#avoid-meat,#avoid-legumes,#avoid-dairy").forEach(x=>x.addEventListener("change",saveSettings));
 document.querySelectorAll("[data-cat]").forEach(x=>x.addEventListener("change",saveSettings));
 document.getElementById("selectVisiblePantry").onclick=()=>{
   document.querySelectorAll(".pantry-item:not(.hidden) [data-pantry]").forEach(x=>x.checked=true);
   updatePantryCount();saveSettings();
 };
 document.getElementById("clearPantry").onclick=()=>{
   document.querySelectorAll("[data-pantry]").forEach(x=>x.checked=false);
   updatePantryCount();saveSettings();
 };
 const raw=localStorage.getItem("smartCampaniaV2Plan");
 if(raw){try{currentPlan=JSON.parse(raw);renderPlan()}catch(e){}}
});
