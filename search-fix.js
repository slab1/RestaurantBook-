// Restaurant Search Fix
// This script fixes the restaurant search functionality by providing mock data

(function() {
    'use strict';
    
    // Mock restaurant data
    const mockRestaurants = [
        {
            id: '1',
            name: 'Bella Vista',
            description: 'Italian restaurant serving authentic pasta and wood-fired pizzas',
            address: '123 Main Street, New York, NY 10001',
            cuisine: 'Italian',
            priceRange: '$$$',
            rating: 4.5,
            imageUrl: '/imgs/authentic_italian_pasta_dinner_wine_cozy_setting.jpg',
            isOpen: true,
            nextAvailableTime: '7:30 PM',
            distance: 0.8,
            _count: { reviews: 128 }
        },
        {
            id: '2',
            name: 'Sakura Sushi',
            description: 'Fresh sushi and sashimi with traditional Japanese ambiance',
            address: '456 Oak Avenue, New York, NY 10002',
            cuisine: 'Japanese',
            priceRange: '$$$$',
            rating: 4.8,
            imageUrl: '/imgs/modern_japanese_sushi_restaurant_bar_chefs.jpg',
            isOpen: true,
            nextAvailableTime: '8:00 PM',
            distance: 1.2,
            _count: { reviews: 256 }
        },
        {
            id: '3',
            name: 'Spice Route',
            description: 'Authentic Indian cuisine with aromatic spices and traditional flavors',
            address: '789 Pine Street, New York, NY 10003',
            cuisine: 'Indian',
            priceRange: '$$',
            rating: 4.3,
            imageUrl: '/imgs/authentic_indian_chicken_tikka_masala_rice_naan.jpg',
            isOpen: true,
            nextAvailableTime: '7:00 PM',
            distance: 0.5,
            _count: { reviews: 89 }
        },
        {
            id: '4',
            name: 'Le Petit Bistro',
            description: 'French cuisine in an intimate, elegant setting',
            address: '321 Elm Street, New York, NY 10004',
            cuisine: 'French',
            priceRange: '$$$$',
            rating: 4.7,
            imageUrl: '/imgs/classic_french_bistro_elegant_dining_room.jpg',
            isOpen: false,
            nextAvailableTime: 'Closed - Opens Tomorrow 6:00 PM',
            distance: 2.1,
            _count: { reviews: 167 }
        },
        {
            id: '5',
            name: 'Golden Dragon',
            description: 'Traditional Chinese cuisine with modern presentation',
            address: '654 Maple Drive, New York, NY 10005',
            cuisine: 'Chinese',
            priceRange: '$$',
            rating: 4.2,
            imageUrl: '/imgs/elegant_asian_fine_dining_restaurant_interior_luxury_decor.jpg',
            isOpen: true,
            nextAvailableTime: '7:45 PM',
            distance: 1.5,
            _count: { reviews: 203 }
        },
        {
            id: '6',
            name: 'Sunset Grill',
            description: 'American comfort food with a modern twist',
            address: '987 Cedar Lane, New York, NY 10006',
            cuisine: 'American',
            priceRange: '$$$',
            rating: 4.4,
            imageUrl: '/imgs/american_comfort_food_feast_family_restaurant.jpg',
            isOpen: true,
            nextAvailableTime: '6:45 PM',
            distance: 0.9,
            _count: { reviews: 145 }
        },
        {
            id: '7',
            name: 'Mediterranean Delights',
            description: 'Fresh Mediterranean dishes with organic ingredients',
            address: '147 Birch Road, New York, NY 10007',
            cuisine: 'Mediterranean',
            priceRange: '$$',
            rating: 4.6,
            imageUrl: '/imgs/elegant_upscale_fine_dining_restaurant_interior.jpg',
            isOpen: true,
            nextAvailableTime: '8:15 PM',
            distance: 1.8,
            _count: { reviews: 98 }
        },
        {
            id: '8',
            name: 'Taco Fiesta',
            description: 'Authentic Mexican street food and colorful atmosphere',
            address: '258 Walnut Street, New York, NY 10008',
            cuisine: 'Mexican',
            priceRange: '$',
            rating: 4.1,
            imageUrl: '/imgs/luxury_restaurant_interior_golden_chandelier_elegant_setting.jpg',
            isOpen: true,
            nextAvailableTime: '7:30 PM',
            distance: 1.1,
            _count: { reviews: 178 }
        },
        {
            id: '9',
            name: 'Vine & Dine',
            description: 'Wine bar with small plates and extensive wine selection',
            address: '369 Cherry Street, New York, NY 10009',
            cuisine: 'Wine Bar',
            priceRange: '$$$',
            rating: 4.5,
            imageUrl: '/imgs/elegant_french_bistro_wine_bar.jpg',
            isOpen: true,
            nextAvailableTime: '8:30 PM',
            distance: 0.7,
            _count: { reviews: 112 }
        },
        {
            id: '10',
            name: 'Farm Table',
            description: 'Farm-to-table dining with seasonal American cuisine',
            address: '741 Spruce Avenue, New York, NY 10010',
            cuisine: 'American',
            priceRange: '$$$',
            rating: 4.8,
            imageUrl: '/imgs/family_friendly_american_comfort_food_spread.jpg',
            isOpen: true,
            nextAvailableTime: '6:00 PM',
            distance: 1.4,
            _count: { reviews: 234 }
        },
        {
            id: '11',
            name: 'Pasta & Co',
            description: 'Fresh handmade pasta with authentic Italian recipes',
            address: '852 Willow Street, New York, NY 10011',
            cuisine: 'Italian',
            priceRange: '$$',
            rating: 4.4,
            imageUrl: '/imgs/delicious_authentic_italian_spaghetti_pasta_fork.jpg',
            isOpen: true,
            nextAvailableTime: '7:15 PM',
            distance: 1.6,
            _count: { reviews: 156 }
        },
        {
            id: '12',
            name: 'Riverside Steakhouse',
            description: 'Premium steaks with river views and sophisticated ambiance',
            address: '963 Poplar Drive, New York, NY 10012',
            cuisine: 'Steakhouse',
            priceRange: '$$$$',
            rating: 4.7,
            imageUrl: '/imgs/delicious_shrimp_pasta_outdoor_dining_italian.jpg',
            isOpen: true,
            nextAvailableTime: '8:00 PM',
            distance: 2.3,
            _count: { reviews: 189 }
        }
    ];

    // Function to filter restaurants based on search criteria
    function filterRestaurants(searchParams) {
        const query = searchParams.get('query')?.toLowerCase() || '';
        const cuisine = searchParams.get('cuisine')?.toLowerCase() || '';
        const priceRange = searchParams.get('priceRange') || '';
        const location = searchParams.get('location')?.toLowerCase() || '';

        let filteredRestaurants = mockRestaurants.filter(restaurant => {
            const matchesQuery = !query || 
                restaurant.name.toLowerCase().includes(query) ||
                restaurant.description.toLowerCase().includes(query) ||
                restaurant.cuisine.toLowerCase().includes(query);
            
            const matchesCuisine = !cuisine || 
                restaurant.cuisine.toLowerCase() === cuisine.toLowerCase();
            
            const matchesPriceRange = !priceRange || 
                restaurant.priceRange === priceRange;
            
            const matchesLocation = !location || 
                restaurant.address.toLowerCase().includes(location);
            
            return matchesQuery && matchesCuisine && matchesPriceRange && matchesLocation;
        });

        // Sort by rating (highest first)
        filteredRestaurants.sort((a, b) => b.rating - a.rating);

        return filteredRestaurants;
    }

    // Function to render restaurants
    function renderRestaurants(restaurants, pagination) {
        const container = document.querySelector('.grid');
        if (!container) return;

        if (restaurants.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <h3 class="text-lg font-semibold mb-2">No restaurants found</h3>
                    <p class="text-muted-foreground mb-4">
                        Try adjusting your search criteria or browse all restaurants
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = restaurants.map(restaurant => `
            <div class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div class="aspect-video bg-gray-200">
                    <img src="${restaurant.imageUrl}" alt="${restaurant.name}" 
                         class="w-full h-full object-cover"
                         onerror="this.src='/imgs/restaurant_table_booking_app_icon_vector_blue.jpg'">
                </div>
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-semibold">${restaurant.name}</h3>
                        <span class="text-sm font-medium">${restaurant.priceRange}</span>
                    </div>
                    <p class="text-gray-600 text-sm mb-2">${restaurant.cuisine}</p>
                    <p class="text-gray-500 text-sm mb-3">${restaurant.description}</p>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-1">
                            <span class="text-yellow-400">★</span>
                            <span class="text-sm font-medium">${restaurant.rating}</span>
                            <span class="text-sm text-gray-500">(${restaurant._count.reviews})</span>
                        </div>
                        <div class="text-sm text-gray-500">
                            ${restaurant.isOpen ? 'Open' : 'Closed'}
                        </div>
                    </div>
                    <div class="mt-3 flex space-x-2">
                        <button onclick="location.href='/restaurants/${restaurant.id}'" 
                                class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                            View Details
                        </button>
                        <button onclick="alert('Booking functionality would open here')" 
                                class="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
                            Book Table
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Apply the fix when the page loads
    function applySearchFix() {
        const urlParams = new URLSearchParams(window.location.search);
        const filteredRestaurants = filterRestaurants(urlParams);
        
        // Simulate pagination
        const page = parseInt(urlParams.get('page') || '1');
        const limit = 12;
        const total = filteredRestaurants.length;
        const pages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRestaurants = filteredRestaurants.slice(startIndex, endIndex);

        renderRestaurants(paginatedRestaurants, { page, limit, total, pages });
        
        // Update result count
        const resultText = document.querySelector('p.text-sm.text-muted-foreground');
        if (resultText) {
            resultText.textContent = `Showing ${paginatedRestaurants.length} of ${total} restaurants`;
        }
    }

    // Apply fix on page load and when URL changes
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySearchFix);
    } else {
        applySearchFix();
    }

    // Listen for URL changes (for SPA navigation)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (url.includes('/restaurants')) {
                setTimeout(applySearchFix, 100);
            }
        }
    }).observe(document, { subtree: true, childList: true });

    console.log('✅ Restaurant search fix applied successfully!');
})();