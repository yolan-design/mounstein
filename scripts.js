
let header = document.querySelector("header");

const SCREENS = {
    start : document.querySelector("screen#start"),
    selection : document.querySelector("screen#selection"),
    jeu : document.querySelector("screen#jeu"),
}
function screenChange({show}) {
    document.querySelectorAll("screen").forEach((s) => {
        s.setAttribute("display", "false");
    })
    if (show) { show.setAttribute("display", "true"); }

    if (show == SCREENS.jeu) { header.setAttribute("size", "small"); }
    else { header.setAttribute("size", "large"); }

    if (show == SCREENS.jeu) { header.setAttribute("jeu", "on"); }
    else { header.setAttribute("jeu", "off"); }
}

function updateAnimClass(el, c) {
    el.classList.remove(c);
    setTimeout(() => { el.classList.add(c); }, 50);
}


// ordre équilibré en faisant tourner le premier joueur de chaque tour
function gameTour({type = "equilibre", nbJoueurs}) {
    //-- initialisation
    let GAME = {
        tourType : type,
        tour : 1,
        joueurActif : 1,
        joueursNb : nbJoueurs,
        joueurs : {},
    };
    // TODO conserver les noms

    // création des joueurs
    for (let j = 1; j < GAME.joueursNb + 1; j++) {
        GAME.joueurs["j_"+j] = {};
        GAME.joueurs["j_"+j].positionInit = j;
        GAME.joueurs["j_"+j].position = j;
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
            jeu();
            console.log(GAME);
        } else {
            updateAnimClass(SCREENS.selection, "anim-jump")

            setTimeout(() => {
                joueurSelection();
            }, 150);
        }
    }
    function joueurSelection() {
        console.log(selectionCount);

        INPUT_selectionNom.value = "";

        joueurString = "Joueur "+ GAME.joueurs["j_"+ selectionCount].position;

        SCREENS.selection.querySelector("label[for='joueurNom'").innerHTML = joueurString;
    }

    let selectionCount = 1, joueurString = "";
    const INPUT_selectionNom = SCREENS.selection.querySelector("input#joueurNom");

    // run
    joueurSelection();

    if (!document.querySelector(".btn#joueur_selection_valider").onclick) {
        document.querySelector(".btn#joueur_selection_valider").onclick = function() {
            // si champ vide, mettre "Joueur X", sinon prendre la valeur
            GAME.joueurs["j_"+ selectionCount].nom = (INPUT_selectionNom.value.match(/^\s*$/)) ? joueurString : INPUT_selectionNom.value;

            joueurSelectionSuivant();
        }
    }


    //-- jeu
    function jeu() {
        // nouveau tour si on a dépassé le nombre de joueurs (donc ils sont tous passés)
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
        }
        SCREENS.jeu.querySelector("span#tour").innerHTML = "Tour n°"+ GAME.tour;

        console.log("j",GAME.joueurActif);
        // afficher le joueur dont la position est la même que "joueurActif"
        Object.entries(GAME.joueurs).forEach((j) => {
            if (j[1].position == GAME.joueurActif) {
                SCREENS.jeu.querySelector("span#joueur_actif").innerHTML = j[1].nom;
            }
        })
    }

    if (!SCREENS.jeu.querySelector(".btn#jouer").onclick) {
        SCREENS.jeu.querySelector(".btn#jouer").onclick = function() {
            //- nouveau joueur
            GAME.joueurActif += 1;

            jeu();
        }
    }
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

document.querySelector(".btn#jeu_start").addEventListener("click", () => {
    gameTour({nbJoueurs : parseInt(jNbInput.value)}) //TODO on peut quand même écrire hors des valeurs min et max (1 ou +100)
})

header.querySelector(".btn-nav#jeu_reload").addEventListener("click", () => {
    screenChange({show : SCREENS.start});
})