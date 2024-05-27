/**Bobaclaaat
 * 
 * Hie isch standpunkt wa alles einigermassu ok gsi isch
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 *  
 * 
 * 
 * Initial function to load data and update navigation buttons
 */
function initializePokedex() {
    fetchAllPokemons();
    updateNavigationButtons();
}

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let currentPage = 1;
const pokemonPerPage = 30;
const pokemonList = []; 
let allPokemons = [];



/**
 * Fetches detailed data for a single Pokémon
 * @param {string} url - URL to fetch Pokémon data
 * @returns {Object} - Combined Pokémon and species data
 */
async function fetchDetailedPokemonData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        console.log(speciesData)


        const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        const description = flavorTextEntry ? flavorTextEntry.flavor_text : 'No description available.';
        

        return {
            ...data,
            description,
            speciesData,
        };
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
    }
}




/**
 * Fetches all Pokémon data from the API and initializes the page
 */
async function fetchAllPokemons() {
    try {
        const response = await fetch(`${BASE_URL}?limit=1302`);
        const data = await response.json();
        allPokemons = data.results;  // Speichere alle Pokémon-Informationen global.
        displayPokemonCards(currentPage);  // Zeige die erste Seite an.
    } catch (error) {
        console.error("Error fetching all Pokémon:", error);
    }
}




async function displayPokemonCards(page) {
    const container = document.getElementById('container');
    container.innerHTML = '';
    const startIndex = (page - 1) * pokemonPerPage;
    const endIndex = Math.min(startIndex + pokemonPerPage, allPokemons.length);

    const pokemonDetailsPromises = allPokemons.slice(startIndex, endIndex).map(pokemon => fetchDetailedPokemonData(pokemon.url));
    const detailedPokemons = await Promise.all(pokemonDetailsPromises);

    const pokemonCardsHtml = detailedPokemons.map((pokemonData, index) => {
        const pokemonName = allPokemons[startIndex + index].name.toUpperCase();
        return createPokemonCardHTML(pokemonName, pokemonData);
    }).join('');

    container.innerHTML = pokemonCardsHtml;
}




function createPokemonCardHTML(pokemonName, pokemonData) {
    const { types } = pokemonData;
    const backgroundColor = getPokemonTypeColor(types);

    const spriteUrl = pokemonData.sprites.other.dream_world.front_default || pokemonData.sprites.front_default;

    const typeImages = types.map(typeInfo => {
        const typeName = typeInfo.type.name;
        const imgSrc = `image/${typeName}.png`;
        return `<img src="${imgSrc}" alt="${typeName}" class="type-icon">`;
    }).join(' ');

    // Hier verwenden wir nur den Namen, um die Karte zu öffnen
    return `
        <div onclick="openPokemonCardHTML('${pokemonName}')" class="pokemon-card" style="background-color: ${backgroundColor};">
            <img src="${spriteUrl}" class="pokemonImage" alt="${pokemonName}">
            <div class="card-body">
                <div class="name">${pokemonName}</div>
                <div class="typeContainer">${typeImages}</div>
            </div>
        </div>`;
}




function getPokemonTypeImages(types) {
    return types.map(typeInfo => {
        const imgSrc = `image/${typeInfo.type.name}.png`;
        return `
            <div class="openedTypeContainer">
                <img src="${imgSrc}" class="type-icon">
                <div class="typeName">${typeInfo.type.name}</div>
            </div>`;
    }).join('');
}




async function openPokemonCardHTML(pokemonName) {

    const url = `${BASE_URL}/${pokemonName.toLowerCase()}`;
    const pokemonData = await fetchDetailedPokemonData(url);

    const { sprites, types, weight, height, description, stats, abilities } = pokemonData;
    const formattedStats = formatStats(stats); // Formatiere die Stats für das Balkendiagramm
    const abilityNames = abilities.map(ab => ab.ability.name).join(', ');
    const backgroundColor = getPokemonTypeColor(types);
    const typeImages = getPokemonTypeImages(types);
    const spriteUrl = sprites.other.dream_world.front_default || sprites.front_default;

    const openCard = document.getElementById('openedCard');
    openCard.innerHTML = `
        <div class="openedCard" style="background-color: ${backgroundColor};">
            ${createOpenedCardHeader(pokemonName.toUpperCase(), spriteUrl)}
            ${createOpenedCardBody(description, typeImages, weight, height, formattedStats, abilityNames)}
        </div>`;
    openCard.classList.remove('d-none');

    // Aktualisiere die Anzeige direkt mit den Stats beim Öffnen der Karte
    createStatsContainer(weight, height, abilityNames, formattedStats);
}



function createOpenedCardBody(description, typeImages, weight, height, stats, abilityNames) {
    const formattedDescription = cleanText(description).replace(/\n/g, '<br>');
    return `
        <div class="openedCardBody" id="openedCardBody">
            <div class="description">${formattedDescription}</div>
            <div class="typeContainer">${typeImages}</div>

            ${createStatsContainer(weight, height, abilityNames, stats)}
        </div>`;
}



function createOpenedCardHeader(name, imageUrl) {
    return `
        <div class="openedCardHeader">
            <button class="dot left-arrow" onclick="fetchPreviousPokemon()">&#8592;</button>
            <img src="${imageUrl}" class="openedPokemonImage" alt="${name}">
            <h1>${name}</h1>
            <button class="dot right-arrow" onclick="fetchNextPokemon()">&#8594;</button>
        </div>`;
}



function createDotNavigation() {
    return `
        <div class="dot-navigation">
            <button class="dot left-arrow" onclick="fetchPreviousPokemon()">&#8592;</button>
            <button class="dot right-arrow" onclick="fetchNextPokemon()">&#8594;</button>
        </div>`;
}



async function fetchNextPokemon() {
    if (currentPage < pokemonPerPage) {
        currentPage++;
        await displayPokemonCardByIndex(currentPage + 1);
    }
}



async function fetchPreviousPokemon() {
    if (currentPage > 1) {
        currentPage--;
        await displayPokemonCardByIndex(currentPage - 1);
    }
}




async function displayPokemonCardByIndex(index) {
    const response = await fetch(`${BASE_URL}?limit=1302&offset=0`);
    const responseData = await response.json();
    if (responseData.results[index]) {
        const pokemonName = responseData.results[index].name;
        openPokemonCardHTML(pokemonName);
    }
}




function showDetails() {
    const container = document.getElementById('statContainer');
    // Hier musst du sicherstellen, dass die benötigten Daten verfügbar sind, z.B. durch Speichern im Zustand oder Durchreichen als Parameter.
    container.innerHTML = createStatsContainer(weight, height, abilityNames);
}




function createStatsContainer(weight, height, abilityNames, stats) {
    let statsContent = '';
    if (stats) {
        stats.forEach(stat => {
            const percentage = Math.round((stat.value / 150) * 100); // Annahme: 255 ist der maximale Wert
            statsContent += `
                <div class="bar" style="width: ${percentage}%; background-color: #76c7c0; margin: 5px 0;">
                    <span class="stat-name">${stat.name.toUpperCase()}:</span> ${stat.value} (${percentage}%)
                </div>`;
        });
    }

    return `
        <div id="statContainer" class="stats">
            <b>Weight:</b> ${weight} kg <br>  
            <b>Height:</b> ${height} dm <br>
            <b>Abilities:</b> ${abilityNames} <br>
            <div class="bar-chart">${statsContent}</div>
        </div>`;
}




function formatStats(statsArray) {
    return statsArray.map(stat => {
        return {
            name: stat.stat.name,
            value: stat.base_stat
        };
    });
}



// Diese Funktion schliesst die geöffnete Pokemonkarte beim klick auf den Hintergrund.
document.addEventListener('click', function (event) {
    const openCard = document.getElementById('openedCard');
    if (!openCard.contains(event.target) && !event.target.closest('.pokemon-card')) {
        openCard.classList.add('d-none');
        
    }
});




/**
 * Gets the background color based on Pokémon type
 * @param {Array} types - Array of Pokémon types
 * @returns {string} - Background color
 */
function getPokemonTypeColor(types) {
    const mainType = types[0].type.name;
    return typeColors[mainType] || '#FFFFFF';
}




const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD'
};






async function fetchNextPage() {
    if ((currentPage - 1) * pokemonPerPage < allPokemons.length - 1) {
        currentPage++;
        displayPokemonCards(currentPage);
        updateNavigationButtons();
        window.scrollTo(0, 0);
    } else {
        console.log("No more Pokémon to display.");
    }
} 


/**
 * Fetches the previous page of Pokémon data
 */

async function fetchPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPokemonCards(currentPage);
        updateNavigationButtons();
    } else {
    console.log("No previous Pokémon to display.");
}
}

/**
 * Updates the visibility of page navigation buttons
 */
function updateNavigationButtons() {
    const previousPageButton = document.querySelector('.previousPageButton');
    const nextPageButton = document.querySelector('.nextPageButton');
    document.getElementById('actualPage').innerText = currentPage;

    // Check if there is a next or previous page by attempting to fetch without loading
    checkPageAvailability();
}




async function checkPageAvailability() {
    // Check next page
    const offsetNext = currentPage * pokemonPerPage;
    try {
        let response = await fetch(`${BASE_URL}?limit=${pokemonPerPage}&offset=${offsetNext}`);
        let data = await response.json();
        document.querySelector('.nextPageButton').style.visibility = data.results.length > 0 ? 'visible' : 'hidden';
    } catch (error) {
        console.error("Error checking next page availability:", error);
    }

    // Check previous page
    document.querySelector('.previousPageButton').style.visibility = currentPage > 1 ? 'visible' : 'hidden';
}




/**
 * Cleans text by removing non-printable characters
 * @param {string} text - The text to clean
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
    return text.replace(/[^\x20-\x7E]/g, '');
}




function searchPokemon(){
    let serachInput = document.getElementById('inputField').value;
    fetch 

}