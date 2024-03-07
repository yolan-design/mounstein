
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
}
function screenChange({show = false}) {
    document.querySelectorAll("screen").forEach((s) => {
        s.setAttribute("display", "false");
    })
    if (show) { show.setAttribute("display", "true"); }

    if (show == SCREENS.jeu) { header.setAttribute("size", "small"); }
    else { header.setAttribute("size", "large"); }

    if (show == SCREENS.jeu) { document.documentElement.setAttribute("jeu", "on"); }
    else { document.documentElement.setAttribute("jeu", "off"); }
}
function screenPop({show = false, logo = true}) {
    document.querySelectorAll("screen").forEach((s) => {
        if (show) { s.setAttribute("pop", "lower"); }
        else { s.setAttribute("pop", "false"); }
    })

    if (show) {
        show.setAttribute("pop", "true");
        document.documentElement.setAttribute("pop", "active");
    } else {
        document.documentElement.setAttribute("pop", "off");
        if (logo && document.documentElement.getAttribute("jeu") != "on") { header.setAttribute("size", "large"); }
    }

    if (!logo) { header.setAttribute("size", "small"); }
}

function updateAnimClass(el, c) {
    el.classList.remove(c);
    setTimeout(() => { el.classList.add(c); }, 50);
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
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


    //-- création des joueurs
    for (let j = 1; j < GAME.joueursNb + 1; j++) {
        GAME.joueurs["j_"+j] = {};
        GAME.joueurs["j_"+j].positionInit = j;
        GAME.joueurs["j_"+j].position = j;
        GAME.joueurs["j_"+j].random = randomIntFromInterval(4, 9) * ((j % 2 == 0) ? 1 : -1);
        // GAME.joueurs["j_"+j].actif = false;
    }
    console.log(GAME);


    //-- joueurs choississent leur nom
    screenChange({show : SCREENS.selection});

    function joueurSelectionSuivant() {
        selectionCount += 1;
        if (selectionCount > GAME.joueursNb) {
            selectionCount = 1;

            screenChange({show : SCREENS.jeu});
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
            colNb += "<span>"+ j +"</span>";
            colNoms += "<span>"+ GAME.joueurs["j_"+ j].nom +"</span>";
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
            jeuOrdreColNb.innerHTML =
                "<span class='in'>"+
                ((parseInt(jeuOrdreColNb.firstElementChild.innerText) <= 1) ? GAME.joueursNb : (parseInt(jeuOrdreColNb.firstElementChild.innerText) - 1))
                +"</span>" + jeuOrdreColNb.innerHTML;

            jeuOrdreColNb.lastElementChild.classList.add("out");
            jeuOrdreColNb.classList.add("move");

            setTimeout(() => {
                jeuOrdreColNb.lastElementChild.remove();
                jeuOrdreColNb.firstElementChild.classList.remove("in");
                jeuOrdreColNb.classList.remove("move");
            }, 400);
        }
        SCREENS.jeu.querySelector("#jeu_tour").innerText = "Tour n° "+ GAME.tour;

        console.log("j",GAME.joueurActif);
        //- afficher le joueur dont la position est la même que "joueurActif"
        Object.entries(GAME.joueurs).forEach((j) => {
            if (j[1].position == GAME.joueurActif) {
                SCREENS.jeu.querySelector("span#joueur_actif").innerText = j[1].nom;

                jeuOrdreColNb.querySelectorAll("span").forEach(span => { span.classList.remove("active"); });
                jeuOrdreColNoms.querySelectorAll("span").forEach(span => { span.classList.remove("active"); });
                setTimeout(() => {
                    jeuOrdreColNb.querySelectorAll("span:nth-child("+ j[1].positionInit +")").forEach(span => { span.classList.add("active"); });
                    jeuOrdreColNoms.querySelectorAll("span:nth-child("+ j[1].positionInit +")").forEach(span => { span.classList.add("active"); });
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


//-- FLOW
screenChange({show : SCREENS.start});
if(window.location.hash != "#jeu") { screenPop({show : SCREENS.rules, logo : false}); } // afficher les règles dès l'ouverture du site (mais pas avec une URL particulière en cas où)

SCREENS.start.querySelector(".btn#jeu_start_rules").addEventListener("click", () => {
    screenPop({show : SCREENS.rules, logo : false});
})
SCREENS.rules.querySelector(".btn-nav#rules_close").addEventListener("click", () => {
    screenPop({}); // TODO special case in game to not scale up logo when closing
})

header.querySelector(".btn-nav#jeu_reload").addEventListener("click", () => {
    screenChange({show : SCREENS.start});
})
header.querySelector(".btn-nav#jeu_rules").addEventListener("click", () => {
    screenPop({show : SCREENS.rules, logo : false});
})

document.querySelector(".btn#jeu_start").addEventListener("click", () => {
    gameTour({nbJoueurs : parseInt(jNbInput.value)}) //TODO on peut quand même écrire hors des valeurs min et max (1 ou +100)
})
