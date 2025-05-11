// search.js - Funcionalidad de búsqueda unificada
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch(searchInput.value.trim());
        });
    }
    
    // También buscar al cambiar el input (opcional)
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (this.value.length > 2) {
                performSearch(this.value.trim());
            }
        });
    }
});

function performSearch(query) {
    if (query.length < 2) return;
    
    // Determinar en qué página estamos
    const currentPage = window.location.pathname.split('/').pop();
    
    // Buscar en eventos.json o artistas.json según la página
    const dataFile = currentPage === 'artistas.html' ? 'artistas.json' : 'eventos.json';
    
    fetch(`data/${dataFile}`)
        .then(response => response.json())
        .then(data => {
            const results = data.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase()) || 
                (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
            );
            
            displaySearchResults(results, currentPage);
        })
        .catch(error => console.error('Error al buscar:', error));
}

function displaySearchResults(results, currentPage) {
    const resultsContainer = document.getElementById('search-results') || createResultsContainer();
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="text-gray-600 py-4">No se encontraron resultados.</p>';
        return;
    }
    
    results.forEach(item => {
        const resultElement = document.createElement('div');
        resultElement.className = 'p-4 border-b border-gray-200 hover:bg-gray-50';
        
        if (currentPage === 'artistas.html') {
            resultElement.innerHTML = `
                <a href="artistas/${item.slug}.html" class="flex items-center">
                    <img src="images/artistas/${item.image}" alt="${item.name}" class="w-12 h-12 rounded-full mr-4">
                    <div>
                        <h3 class="font-semibold text-gray-800">${item.name}</h3>
                        <p class="text-sm text-gray-600">${item.category}</p>
                    </div>
                </a>
            `;
        } else {
            resultElement.innerHTML = `
                <a href="evento-detalle.html?id=${item.id}" class="block">
                    <h3 class="font-semibold text-gray-800">${item.name}</h3>
                    <p class="text-sm text-gray-600">${item.date} • ${item.location}</p>
                    <p class="text-sm mt-1 text-gray-700">${item.description.substring(0, 100)}...</p>
                </a>
            `;
        }
        
        resultsContainer.appendChild(resultElement);
    });
}

function createResultsContainer() {
    const container = document.createElement('div');
    container.id = 'search-results';
    container.className = 'absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-md max-h-96 overflow-y-auto z-50';
    document.getElementById('search-container').appendChild(container);
    return container;
}