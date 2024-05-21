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

/**
 * Creates a Pokémon card HTML string
 * @param {string} pokemonName - Name of the Pokémon
 * @param {Object} pokemonData - Data of the Pokémon
 * @returns {string} - HTML string for the Pokémon card
 */
function createPokemonCardHTML(pokemonName, pokemonData) {
    const { sprites, types, weight, height, description } = pokemonData;
    const backgroundColor = getPokemonTypeColor(types);

    const typeImages = types.map(typeInfo => {
        const typeName = typeInfo.type.name;
        const imgSrc = `image/${typeName}.png`;
        return `<img src="${imgSrc}" alt="${typeName}" class="type-icon">`;
    }).join(' ');

    const formattedDescription = cleanText(description).replace(/\n/g, '<br>');

    return `
        <div class="pokemon-card" style="background-color: ${backgroundColor};" onclick="openPokemonCard(this)">
            <img src="${sprites.front_default}" class="pokemonImage" alt="${pokemonName}">
            <div class="card-body">
                <div class="name">${pokemonName}</div>
            </div>
            <div class="typeContainer">${typeImages}</div>
            <div class="additional-info">
                <div class="description">${formattedDescription}</div>
                <div class="stats">
                    <div><b>Weight:</b> ${weight}</div>
                    <div><b>Height:</b> ${height}</div>
                </div>
            </div>
        </div>`;
}

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
