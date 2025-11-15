document.addEventListener('DOMContentLoaded', function() {
    const productGrid = document.querySelector('.product-grid.catalogue-grid');
    if (!productGrid) return;

    let products = Array.from(productGrid.querySelectorAll('.product-card'));
    let currentFilters = {
        priceRange: 'all',
        availability: 'all'
    };
    let currentSort = 'name-asc';

    // Create filter and sort dropdown menus
    createFilterDropdowns();
    createSortDropdown();

    function createFilterDropdowns() {
        // Price filter
        const priceFilter = document.querySelector('.filters .dropdown-filter:nth-child(3)');
        if (priceFilter) {
            const priceMenu = document.createElement('div');
            priceMenu.className = 'filter-dropdown-menu';
            priceMenu.innerHTML = `
                <div class="filter-option" data-filter="price" data-value="all">All Prices</div>
                <div class="filter-option" data-filter="price" data-value="0-1000">Under ₱1,000</div>
                <div class="filter-option" data-filter="price" data-value="1000-2000">₱1,000 - ₱2,000</div>
                <div class="filter-option" data-filter="price" data-value="2000-3000">₱2,000 - ₱3,000</div>
                <div class="filter-option" data-filter="price" data-value="3000-5000">₱3,000 - ₱5,000</div>
                <div class="filter-option" data-filter="price" data-value="5000+">Over ₱5,000</div>
            `;
            priceFilter.appendChild(priceMenu);

            priceFilter.addEventListener('click', function(e) {
                e.stopPropagation();
                priceMenu.classList.toggle('active');
            });

            priceMenu.querySelectorAll('.filter-option').forEach(option => {
                option.addEventListener('click', function(e) {
                    e.stopPropagation();
                    currentFilters.priceRange = this.dataset.value;
                    applyFiltersAndSort();
                    priceMenu.classList.remove('active');
                });
            });
        }

        // Availability filter
        const availFilter = document.querySelector('.filters .dropdown-filter:nth-child(2)');
        if (availFilter) {
            const availMenu = document.createElement('div');
            availMenu.className = 'filter-dropdown-menu';
            availMenu.innerHTML = `
                <div class="filter-option" data-filter="availability" data-value="all">All Products</div>
                <div class="filter-option" data-filter="availability" data-value="in-stock">In Stock</div>
                <div class="filter-option" data-filter="availability" data-value="low-stock">Low Stock</div>
            `;
            availFilter.appendChild(availMenu);

            availFilter.addEventListener('click', function(e) {
                e.stopPropagation();
                availMenu.classList.toggle('active');
            });

            availMenu.querySelectorAll('.filter-option').forEach(option => {
                option.addEventListener('click', function(e) {
                    e.stopPropagation();
                    currentFilters.availability = this.dataset.value;
                    applyFiltersAndSort();
                    availMenu.classList.remove('active');
                });
            });
        }
    }

    function createSortDropdown() {
        const sortContainer = document.querySelector('.dropdown-sort');
        if (!sortContainer) return;

        const sortMenu = document.createElement('div');
        sortMenu.className = 'sort-dropdown-menu';
        sortMenu.innerHTML = `
            <div class="sort-option" data-sort="name-asc">Alphabetically, A-Z</div>
            <div class="sort-option" data-sort="name-desc">Alphabetically, Z-A</div>
            <div class="sort-option" data-sort="price-asc">Price, Low to High</div>
            <div class="sort-option" data-sort="price-desc">Price, High to Low</div>
            <div class="sort-option" data-sort="newest">Newest First</div>
        `;
        sortContainer.appendChild(sortMenu);

        sortContainer.addEventListener('click', function(e) {
            e.stopPropagation();
            sortMenu.classList.toggle('active');
        });

        sortMenu.querySelectorAll('.sort-option').forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                currentSort = this.dataset.sort;
                sortContainer.childNodes[0].textContent = this.textContent + ' ';
                applyFiltersAndSort();
                sortMenu.classList.remove('active');
            });
        });
    }

    function applyFiltersAndSort() {
        // Filter products
        let filteredProducts = products.filter(product => {
            const priceText = product.querySelector('.product-price').textContent;
            const price = parseFloat(priceText.replace(/[₱,]/g, ''));

            // Price filter
            if (currentFilters.priceRange !== 'all') {
                if (currentFilters.priceRange === '0-1000' && price >= 1000) return false;
                if (currentFilters.priceRange === '1000-2000' && (price < 1000 || price >= 2000)) return false;
                if (currentFilters.priceRange === '2000-3000' && (price < 2000 || price >= 3000)) return false;
                if (currentFilters.priceRange === '3000-5000' && (price < 3000 || price >= 5000)) return false;
                if (currentFilters.priceRange === '5000+' && price < 5000) return false;
            }

            return true;
        });

        // Sort products
        filteredProducts.sort((a, b) => {
            const nameA = a.querySelector('.product-name').textContent;
            const nameB = b.querySelector('.product-name').textContent;
            const priceA = parseFloat(a.querySelector('.product-price').textContent.replace(/[₱,]/g, ''));
            const priceB = parseFloat(b.querySelector('.product-price').textContent.replace(/[₱,]/g, ''));

            switch(currentSort) {
                case 'name-asc':
                    return nameA.localeCompare(nameB);
                case 'name-desc':
                    return nameB.localeCompare(nameA);
                case 'price-asc':
                    return priceA - priceB;
                case 'price-desc':
                    return priceB - priceA;
                default:
                    return 0;
            }
        });

        // Update display
        productGrid.innerHTML = '';
        filteredProducts.forEach(product => {
            productGrid.appendChild(product);
        });

        // Update product count
        const productCount = document.querySelector('.product-count');
        if (productCount) {
            productCount.textContent = `${filteredProducts.length} products`;
        }
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.filter-dropdown-menu, .sort-dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    });
});