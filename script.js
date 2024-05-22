/**
 * Initial function to load data and update navigation buttons
 */
function initializePokedex() {
    fetchAndDisplayAllPokemon();
    updateNavigationButtons();
}

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let currentPage = 1;
const pokemonPerPage = 30;

/**
 * Fetches all Pokémon data from the API and initializes the page
 */
async function fetchAndDisplayAllPokemon() {
    try {
        const response = await fetch(`${BASE_URL}?limit=1302&offset=0`);
        const responseData = await response.json();
        const pokemonList = responseData.results;
        updateNavigationButtons();
        displayPokemonCards(pokemonList);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

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

        const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        const description = flavorTextEntry ? flavorTextEntry.flavor_text : 'No description available.';

        return {
            ...data,
            description,
        };
    } catch (error) {
        console.error("Error fetching Pokémon data:", error);
    }
}

/**
 * Displays Pokémon cards for the current page
 * @param {Array} pokemonList - List of Pokémon
 */
async function displayPokemonCards(pokemonList) {
    const container = document.getElementById('container');
    container.innerHTML = '';

    const startIndex = (currentPage - 1) * pokemonPerPage;
    const endIndex = startIndex + pokemonPerPage;

    for (let i = startIndex; i < endIndex && i < pokemonList.length; i++) {
        const pokemonName = pokemonList[i].name.toUpperCase();
        const pokemonData = await fetchDetailedPokemonData(pokemonList[i].url);
        container.innerHTML += createPokemonCardHTML(pokemonName, pokemonData);
    }
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

function createDotNavigation(weight, height, stats) {
    const statsJson = JSON.stringify(stats); // Konvertiere die Stats in einen JSON-String für die sichere Übergabe
    return `
        <div class="dot-navigation">
            <button class="dot" onclick="switchPage1(${weight}, ${height})"></button>
            <button class="dot" onclick="switchPage2(this.getAttribute('data-stats'))" data-stats='${statsJson}'></button>
            <button class="dot" onclick="switchPage3()"></button>
        </div>`;
}


function createStatsContainer(weight, height) {
    return `
        <div id="statContainer" class="stats">
            <b>Weight:</b> ${weight} kg <br>  
            <b>Height:</b> ${height} dm
        </div>`;
}

function createOpenedCardBody(description, typeImages, weight, height, stats) {
    const formattedDescription = cleanText(description).replace(/\n/g, '<br>');
    return `
        <div class="openedCardBody" id="openedCardBody">
            <div class="description">${formattedDescription}</div>
            <div class="typeContainer">${typeImages}</div>
            ${createDotNavigation(weight, height, stats)}
            ${createStatsContainer(weight, height)}
        </div>`;
}

function createOpenedCardHeader(name, imageUrl) {
    return `
        <div class="openedCardHeader">
            <img src="${imageUrl}" class="openedPokemonImage" alt="${name}">
            <h1>${name}</h1>
        </div>`;
}

async function openPokemonCardHTML(pokemonName) {
    const url = `${BASE_URL}/${pokemonName.toLowerCase()}`;
    const pokemonData = await fetchDetailedPokemonData(url);
    const { sprites, types, weight, height, description, stats } = pokemonData;
    const formattedStats = formatStats(stats); // Option 1, wenn du mit den Daten arbeiten möchtest
    // const statsJson = statsToJson(stats); // Option 2, wenn du die Daten als JSON-String brauchst

    const backgroundColor = getPokemonTypeColor(types);
    const typeImages = getPokemonTypeImages(types);
    const spriteUrl = sprites.other.dream_world.front_default || sprites.front_default;

    const openCard = document.getElementById('openedCard');
    openCard.innerHTML = `
        <div class="openedCard" style="background-color: ${backgroundColor};">
            ${createOpenedCardHeader(pokemonName, spriteUrl)}
            ${createOpenedCardBody(description, typeImages, weight, height, formattedStats)}
        </div>`;
    openCard.classList.remove('d-none');
}

function formatStats(statsArray) {
    return statsArray.map(stat => {
        return {
            name: stat.stat.name,
            value: stat.base_stat
        };
    });
}


function switchPage1(weight, height) {
    let container = document.getElementById('statContainer');
    container.innerHTML = `
    <div class="stats">
        <b>Weight:</b> ${weight} kg <br>  
        <b>Height:</b> ${height} dm
    </div>`;
}

function switchPage2(statsData) {
    const stats = JSON.parse(statsData); // Parse den JSON-String zurück in ein JavaScript-Objekt/Array
    let container = document.getElementById('statContainer');
    container.innerHTML = '<div class="bar-chart">';

    stats.forEach(stat => {
        let percentage = Math.round((stat.value / 150) * 100); // Annahme: 255 ist der maximale Wert
        container.innerHTML += `
            <div class="bar" style="width: ${percentage}%; background-color: #76c7c0; margin: 5px 0;">
                <span class="stat-name">${stat.name.toUpperCase()}:</span> ${stat.value} (${percentage}%)
            </div>`;
    });
    container.innerHTML += '</div>';
}

function switchPage3(weight, height) {
    let container = document.getElementById('statContainer');
    container.innerHTML = `
    <div class="stats">

    </div>`;
}


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

/**
 * Fetches the next page of Pokémon data
 */
async function fetchNextPage() {
    currentPage++;
    const offset = (currentPage - 1) * pokemonPerPage;

    try {
        const response = await fetch(`${BASE_URL}?limit=${pokemonPerPage}&offset=${offset}`);
        const responseData = await response.json();
        const pokemonList = responseData.results;

        displayPokemonCards(pokemonList);
        updateNavigationButtons();
        window.scrollTo(0, 0);
    } catch (error) {
        console.error("Error fetching next page:", error);
    }
}

/**
 * Fetches the previous page of Pokémon data
 */
async function fetchPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        const offset = (currentPage - 1) * pokemonPerPage;

        try {
            const response = await fetch(`${BASE_URL}?limit=${pokemonPerPage}&offset=${offset}`);
            const responseData = await response.json();
            const pokemonList = responseData.results;

            displayPokemonCards(pokemonList);
            updateNavigationButtons();
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Error fetching previous page:", error);
        }
    }
}

/**
 * Updates the visibility of page navigation buttons
 */
function updateNavigationButtons() {
    const previousPageButton = document.querySelector('.previousPageButton');
    const nextPageButton = document.querySelector('.nextPageButton');
    document.getElementById('actualPage').innerText = currentPage;

    if (currentPage === 1) {
        previousPageButton.style.visibility = 'hidden';
    } else {
        previousPageButton.style.visibility = 'visible';
    }
}

/**
 * Cleans text by removing non-printable characters
 * @param {string} text - The text to clean
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
    return text.replace(/[^\x20-\x7E]/g, '');
}