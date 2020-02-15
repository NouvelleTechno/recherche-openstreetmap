// Variables globales
let ville = distance = ""

window.onload = () => {
    // On intialise la carte
    let carte = L.map('map').setView([48.852969, 2.349903], 13)

    // On charge les "tuiles"
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        // Il est toujours bien de laisser le lien vers la source des données
        attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 20,
        name: 'tiles' // Permettra de ne pas supprimer cette couche
    }).addTo(carte)

    // Gestion des champs
    let champVille = document.getElementById('champ-ville')
    let champDistance = document.getElementById('champ-distance')
    let valeurDistance = document.getElementById('valeur-distance')

    champVille.addEventListener("change", function(){
        // On envoie le requête ajax vers Nominatim
        ajaxGet(`https://nominatim.openstreetmap.org/search?q=${this.value}&format=json&addressdetails=1&limit=1&polygon_svg=1`)
        .then(reponse => {
            // On convertit la réponse en objet Javascript
            let data = JSON.parse(reponse)

            // On stocke les coordonnées dans ville
            ville = [data[0].lat, data[0].lon]

            // On centre la carte sur la ville
            carte.panTo(ville)
        })
    })

    champDistance.addEventListener("change", function(){
        distance = this.value

        valeurDistance.innerText = distance + " km"

        // On vérifie si on a une ville
        if(ville != ""){
            // On envoie la requête
            ajaxGet(`http://agences-osm.test/chargeAgences.php?lat=${ville[0]}&lon=${ville[1]}&distance=${distance}`)
            .then(reponse => {
                // On supprime toutes les couches de la carte
                carte.eachLayer(function(layer){
                    if(layer.options.name != 'tiles') carte.removeLayer(layer)
                })

                //On trace un cercle correspondant à la distance souhaitée
                let circle = L.circle(ville, {
                    color: "#839c49",
                    fillColor: "#839c49",
                    fillOpacity: 0.3,
                    radius: distance * 1000
                }).addTo(carte)

                // On boucle sur les données
                let donnees = JSON.parse(reponse)

                Object.entries(donnees).forEach(agence => {
                    // On crée le marqueur
                    let marker = L.marker([agence[1].lat, agence[1].lon]).addTo(carte)
                    marker.bindPopup(agence[1].nom)
                    
                })
                // On centre la carte sur le cercle
                let bounds = circle.getBounds()
                carte.fitBounds(bounds)
            })
        }
    })
}

/**
 * Cette fonction effectue un appel Ajax vers une url et retourne une promesse
 * @param {string} url 
 */
function ajaxGet(url){
    return new Promise(function(resolve, reject){
        // Nous allons gérer la promesse
        let xmlhttp = new XMLHttpRequest()

        xmlhttp.onreadystatechange = function(){
            if(xmlhttp.readyState == 4){
                if(xmlhttp.status == 200){
                    // On "résoud" la promesse
                    resolve(xmlhttp.response)
                }else{
                    reject(xmlhttp)
                }
            }
        }

        xmlhttp.onerror = function(error){
            reject(error)
        }

        xmlhttp.open('get', url, true)
        xmlhttp.send()
    })
}