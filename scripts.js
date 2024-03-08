
// apply function at the end of a css transition of an element (no propagation, option to do it only once)
function addEvTrEnd(elem, func, property, once) {
    var isNotAlready = true,
        property = property ? property : false, // default: false
        once = once ? once : true; // once? / default: true

    if(!property) { // will check for all css properties
        elem.addEventListener("transitionend", () => { func(); }, { once : once });
    } else { // will check only for specified css property
        elem.addEventListener("transitionend", (ev) => { if(ev.propertyName == property) { func(); }}, { once : once });
    }

    trEndAlready.forEach(e => { isNotAlready &= (e == elem) ? false : true; }); // check if already checking for trEnd
    if(isNotAlready) {
        trEndAlready.push(elem);
        elem.childNodes.forEach((el) => { el.addEventListener("transitionend", (ev) => { ev.stopPropagation(); })});
    }
} var trEndAlready = [];


function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}


//-- initialisation
let GAME = {
    joueursNoms : [],
    joueurs : {},
};

const SCREENS = {
    start : document.querySelector("screen#start"),
    selection : document.querySelector("screen#selection"),
    jeu : document.querySelector("screen#jeu"),
    rules : document.querySelector("screen#rules"),
    infos : document.querySelector("screen#infos"),
}
function screenChange({toShow = false}) {
    // remove current screen
    document.querySelectorAll("screen[display-instant='true']").forEach((sd) => {
        addEvTrEnd(sd, () => { sd.classList.add("hidden"); }, "opacity", true);
    })

    // clear screens
    document.querySelectorAll("screen").forEach((sd) => {
        sd.setAttribute("display", "false");
        sd.setAttribute("display-instant", "false");
    });

    // display screen
    if (toShow) {
        toShow.classList.remove("hidden");
        setTimeout(() => { toShow.setAttribute("display", "true"); }, 33);
        toShow.setAttribute("display-instant", "true"); // no delay
    }

    // logo size in/out game
    if (toShow == SCREENS.jeu) {
        header.setAttribute("size", "small");
        document.documentElement.setAttribute("jeu", "on"); // global on
    }
    else {
        header.setAttribute("size", "large");
        document.documentElement.setAttribute("jeu", "off"); // global off
    }
}

function screenPop({toShow = false, logoLarge = true}) {
    if (!toShow) {
        // remove current pop
        document.querySelectorAll("screen[pop-instant='true']").forEach((popEl) => {
            addEvTrEnd(popEl, () => { popEl.classList.add("hidden"); }, "opacity", true);
        })

        // global off
        document.documentElement.setAttribute("pop", "off");

        // restore logo size
        if (logoLarge && document.documentElement.getAttribute("jeu") != "on") { header.setAttribute("size", "large"); }
    }
    if (!logoLarge) { header.setAttribute("size", "small"); }

    // clear pops
    document.querySelectorAll("screen").forEach((sEl) => {
        sEl.setAttribute("pop", "false");
        sEl.setAttribute("pop-instant", "false");
    });

    if (toShow) {
        // lower current screen
        document.querySelectorAll("screen[display-instant='true']").forEach((sEl) => { sEl.setAttribute("pop", "lower"); });

        // display pop
        toShow.classList.remove("hidden");
        setTimeout(() => { toShow.setAttribute("pop", "true"); }, 33);
        toShow.setAttribute("pop-instant", "true"); // no delay

        // global on
        document.documentElement.setAttribute("pop", "active");
    }
}

function updateAnimClass(el, c) {
    el.classList.remove(c);
    setTimeout(() => { el.classList.add(c); }, 100);
}

let header = document.querySelector("header"),
    jeuOrdreColNb = SCREENS.jeu.querySelector("#jeu_ordre .col.nombres"),
    jeuOrdreColNoms = SCREENS.jeu.querySelector("#jeu_ordre .col.noms");


//-- JEU
function gameTour({type = "equilibre", nbJoueurs}) {
    //-- reset
    GAME.tour = 1;
    GAME.tourType = type;
    GAME.joueursNb = nbJoueurs;
    GAME.joueurActif = 1;
    GAME.randomRotateInvert = parseInt(Math.random().toFixed());

    //-- création des joueurs
    for (let j = 1; j < GAME.joueursNb + 1; j++) {
        GAME.joueurs["j_"+j] = {};
        GAME.joueurs["j_"+j].positionInit = j;
        GAME.joueurs["j_"+j].position = j;
        GAME.joueurs["j_"+j].random = randomIntFromInterval(4, 10) * (((j + GAME.randomRotateInvert) % 2 == 0) ? 1 : -1);
        // GAME.joueurs["j_"+j].actif = false;
    }
    console.log(GAME);


    //-- joueurs choississent leur nom
    screenChange({toShow : SCREENS.selection});

    function joueurSelectionSuivant() {
        selectionCount += 1;
        if (selectionCount > GAME.joueursNb) {
            selectionCount = 1;

            screenChange({toShow : SCREENS.jeu});
            jeuCreate();

            // stocker les noms
            GAME.joueursNoms = [];
            Object.entries(GAME.joueurs).forEach((j) => { GAME.joueursNoms.push(j[1].nom); });
            console.log(GAME.joueursNoms);
        } else {
            updateAnimClass(SCREENS.selection, "anim-jump")

            joueurSelectionUpdate();
        }
    }
    function joueurSelectionUpdate() {
        console.log("selectionCount", selectionCount);

        joueurStringUpdate();
        LABEL_selectionNom.innerText = joueurString; // label UI
        SCREENS.selection.style.setProperty('--j-rotate', GAME.joueurs["j_"+ selectionCount].random +"deg");

         // valeur champ, conserver nom joueur si existe
        INPUT_selectionNom.value = ((GAME.joueursNoms.length > 0)
                                    ? ((GAME.joueursNoms[selectionCount - 1] != joueurString)
                                        ? GAME.joueursNoms[selectionCount - 1]
                                        : "")
                                    : "");
    }

    function joueurStringUpdate() { // string numéro de joueur
        joueurString = "Joueur "+ GAME.joueurs["j_"+ selectionCount].position;
    }

    let selectionCount = 1, joueurString = "";
    const INPUT_selectionNom = SCREENS.selection.querySelector("input#joueurNom"),
          LABEL_selectionNom = SCREENS.selection.querySelector("label[for='joueurNom'");

    // run
    if (GAME.joueursNb != GAME.joueursNoms.length) { GAME.joueursNoms = []; } // réutiliser les noms pour la prochaine partie s'il y a le même nb de joueurs
    joueurSelectionUpdate();

    if (!document.querySelector(".btn#joueur_selection_valider").onclick) {
        document.querySelector(".btn#joueur_selection_valider").onclick = function() {
            joueurStringUpdate();
            // si champ vide, mettre "Joueur X", sinon prendre la valeur
            GAME.joueurs["j_"+ selectionCount].nom = (INPUT_selectionNom.value.match(/^\s*$/)) ? joueurString : INPUT_selectionNom.value.replace(/</g, "/");
            joueurSelectionSuivant();
        }
    }


    //-- jeu
    function jeuCreate() {
        let colNb = "", colNoms = "";

        for (let j = 1; j <= GAME.joueursNb; j++) {
            colNb += "<item><span style='--j-rotate: "+ (GAME.joueurs["j_"+ j].random * 1.3) +"deg;'>"+ j +"</span></item>";
            colNoms += "<item>"+ GAME.joueurs["j_"+ j].nom +"</item>";
        }
        jeuOrdreColNb.innerHTML = colNb;
        jeuOrdreColNoms.innerHTML = colNoms;

        jeu();
    }

    function jeu() {
        //- nouveau tour si on a dépassé le nombre de joueurs (donc ils sont tous passés)
        if (GAME.joueurActif > GAME.joueursNb) {
            GAME.tour += 1;
            GAME.joueurActif = 1;

            if (true || GAME.tourType == "equilibre") { // équilibré, faire tourner le "premier" joueur / pour l'instant le seul mode
                console.log("------ tour "+ GAME.tour);
                Object.entries(GAME.joueurs).forEach((j) => {
                    j[1].position = (j[1].position <= 1) ? GAME.joueursNb : j[1].position - 1;
                    console.log(j[0], "pos "+j[1].position);
                });
            }

            // update liste ordre nombre
            let nbOrdre = ((parseInt(jeuOrdreColNb.firstElementChild.innerText) <= 1) ? GAME.joueursNb : (parseInt(jeuOrdreColNb.firstElementChild.innerText) - 1));

            jeuOrdreColNb.innerHTML =
                "<item class='in'><span style='--j-rotate: "+ (GAME.joueurs["j_"+ nbOrdre].random * 1.3) +"deg;'>"+
                nbOrdre
                +"</span></item>" + jeuOrdreColNb.innerHTML;

            jeuOrdreColNb.lastElementChild.classList.add("out");
            jeuOrdreColNb.classList.add("move");

            setTimeout(() => {
                jeuOrdreColNb.lastElementChild.remove();
                jeuOrdreColNb.firstElementChild.classList.remove("in");
                jeuOrdreColNb.classList.remove("move");
            }, 500);
        }
        SCREENS.jeu.querySelector("#jeu_tour").innerText = "Tour n° "+ GAME.tour;

        console.log("j",GAME.joueurActif);
        //- afficher le joueur dont la position est la même que "joueurActif"
        Object.entries(GAME.joueurs).forEach((j) => {
            if (j[1].position == GAME.joueurActif) {
                SCREENS.jeu.querySelector("span#joueur_actif").innerText = j[1].nom;

                jeuOrdreColNb.querySelectorAll("item").forEach(item => { item.classList.remove("active"); });
                jeuOrdreColNoms.querySelectorAll("item").forEach(item => { item.classList.remove("active"); });
                setTimeout(() => {
                    jeuOrdreColNb.querySelectorAll("item:nth-child("+ j[1].positionInit +")").forEach(item => { item.classList.add("active"); });
                    jeuOrdreColNoms.querySelectorAll("item:nth-child("+ j[1].positionInit +")").forEach(item => { item.classList.add("active"); });
                }, 200);
            }
        })

        setTimeout(() => { jeu_offset(); }, 200+50);
    }

    function jeu_offset() {
        if (!SCREENS.jeu.querySelector(".btn#jouer").onclick) {
            SCREENS.jeu.querySelector(".btn#jouer").onclick = function() {
                this.onclick=null;

                //- nouveau joueur
                GAME.joueurActif += 1;

                jeu();
            }
        }
    }
    jeu_offset();

}

//-- SCREEN START
const jNbValue = document.querySelector("#joueursNb-valeur");
const jNbInput = document.querySelector("#joueursNb-slider");
jNbValue.textContent = jNbInput.value;
jNbInput.addEventListener("input", (event) => {
    jNbValue.textContent = event.target.value;
});

// SCREENS INIT
screenChange({toShow : SCREENS.start});
screenPop({});

// afficher les règles dès l'ouverture du site (mais pas avec une URL particulière en cas où)
if(window.location.hash != "#jeu") { screenPop({toShow : SCREENS.rules, logoLarge : false}); }

// remove disabled screens
setTimeout(() => {
    document.querySelectorAll("screen[display-instant='false'][pop-instant='false']").forEach((popEl) => {
        popEl.classList.add("hidden");
    })
}, 100);


//-- INTERACTIONS
SCREENS.start.querySelector(".btn#jeu_start_rules").addEventListener("click", () => {
    screenPop({toShow : SCREENS.rules, logoLarge : false});
})
document.querySelectorAll(".pop-close").forEach((btn) => {
    btn.addEventListener("click", () => {
        screenPop({});
    })
})

header.querySelector("#logo").addEventListener("click", () => {
    screenPop({toShow : SCREENS.infos, logoLarge : false});
})

header.querySelector(".btn-nav#jeu_end").addEventListener("click", () => {
    screenChange({toShow : SCREENS.start});
})
header.querySelector(".btn-nav#jeu_rules").addEventListener("click", () => {
    screenPop({toShow : SCREENS.rules, logoLarge : false});
})

document.querySelector(".btn#jeu_start").addEventListener("click", () => {
    gameTour({nbJoueurs : parseInt(jNbInput.value)})
})
