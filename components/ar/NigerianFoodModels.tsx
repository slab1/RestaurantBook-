// Nigerian Food 3D Models Configuration
// Each model defines appearance, colors, textures, and 3D rendering properties

export interface FoodModel {
  shape: 'bowl' | 'plate' | 'cylinder' | 'irregular';
  primaryColor: string;
  borderColor: string;
  size?: number;
  texture?: 'grainy' | 'smooth' | 'bumpy';
  garnish?: {
    color: string;
    borderColor?: string;
    elements: Array<{
      type: 'circle' | 'leaf' | 'pepper';
      x: number;
      y: number;
      size?: number;
    }>;
  }[];
  isHot?: boolean;
  path?: string; // Custom SVG path for irregular shapes
  details?: {
    steamColor?: string;
    sparkles?: Array<{ x: number; y: number; color: string }>;
    particles?: Array<{ x: number; y: number; size: number; color: string }>;
  };
}

export const NigerianFoodModels: Record<string, FoodModel> = {
  // Jollof Rice Variants
  'jollof rice': {
    shape: 'bowl',
    primaryColor: '#D2691E',
    borderColor: '#8B4513',
    size: 85,
    texture: 'grainy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'pepper', x: -25, y: -15, size: 8 },
        { type: 'pepper', x: 20, y: -10, size: 6 },
        { type: 'circle', x: -15, y: 10, size: 3, },
        { type: 'circle', x: 10, y: 15, size: 2, }
      ]
    },
    isHot: true,
    details: {
      steamColor: '#F0F8FF'
    }
  },

  'jollof rice with chicken': {
    shape: 'bowl',
    primaryColor: '#CD853F',
    borderColor: '#8B4513',
    size: 90,
    texture: 'grainy',
    garnish: {
      color: '#D2691E',
      elements: [
        { type: 'circle', x: -30, y: -20, size: 12 }, // Chicken piece
        { type: 'circle', x: 25, y: -5, size: 10 },   // Chicken piece
        { type: 'pepper', x: 15, y: 15, size: 6 },
        { type: 'circle', x: -20, y: 20, size: 3 }
      ]
    },
    isHot: true
  },

  'party jollof rice': {
    shape: 'bowl',
    primaryColor: '#B22222',
    borderColor: '#8B0000',
    size: 95,
    texture: 'grainy',
    garnish: {
      color: '#FF6347',
      elements: [
        { type: 'circle', x: -35, y: -15, size: 14 },
        { type: 'circle', x: 30, y: -10, size: 12 },
        { type: 'circle', x: 0, y: -25, size: 10 },
        { type: 'pepper', x: -20, y: 15, size: 8 },
        { type: 'pepper', x: 25, y: 20, size: 6 }
      ]
    },
    isHot: true,
    details: {
      sparkles: [
        { x: -40, y: -30, color: '#FFD700' },
        { x: 40, y: -25, color: '#FFD700' },
        { x: 0, y: -35, color: '#FFD700' }
      ]
    }
  },

  // Rice Dishes
  'fried rice': {
    shape: 'bowl',
    primaryColor: '#F4A460',
    borderColor: '#CD853F',
    size: 80,
    texture: 'grainy',
    garnish: {
      color: '#90EE90',
      elements: [
        { type: 'circle', x: -20, y: -15, size: 5 },
        { type: 'circle', x: 15, y: -10, size: 4 },
        { type: 'circle', x: 0, y: 20, size: 3 },
        { type: 'leaf', x: -15, y: 20, size: 6 }
      ]
    }
  },

  'coconut rice': {
    shape: 'bowl',
    primaryColor: '#FFF8DC',
    borderColor: '#D2B48C',
    size: 82,
    texture: 'smooth',
    garnish: {
      color: '#8B4513',
      elements: [
        { type: 'circle', x: -25, y: -10, size: 8 }, // Coconut flakes
        { type: 'circle', x: 20, y: -15, size: 6 },
        { type: 'circle', x: 5, y: 25, size: 5 }
      ]
    }
  },

  'plain rice': {
    shape: 'bowl',
    primaryColor: '#F5F5DC',
    borderColor: '#D2B48C',
    size: 75,
    texture: 'grainy'
  },

  // Swallow (Starch-based dishes)
  'fufu': {
    shape: 'cylinder',
    primaryColor: '#F5DEB3',
    borderColor: '#DEB887',
    size: 70,
    texture: 'smooth',
    garnish: {
      color: '#8B4513',
      elements: [
        { type: 'circle', x: -15, y: -25, size: 8 }, // Soup
        { type: 'circle', x: 15, y: -25, size: 6 }
      ]
    }
  },

  'pounded yam': {
    shape: 'bowl',
    primaryColor: '#F5DEB3',
    borderColor: '#DEB887',
    size: 75,
    texture: 'smooth',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'leaf', x: -20, y: -20, size: 10 },
        { type: 'leaf', x: 20, y: -15, size: 8 }
      ]
    }
  },

  'semovita': {
    shape: 'cylinder',
    primaryColor: '#FAF0E6',
    borderColor: '#F5DEB3',
    size: 68,
    texture: 'smooth'
  },

  'eba': {
    shape: 'irregular',
    primaryColor: '#DEB887',
    borderColor: '#CD853F',
    size: 72,
    texture: 'bumpy',
    path: 'custom'
  },

  'amala': {
    shape: 'irregular',
    primaryColor: '#8B4513',
    borderColor: '#654321',
    size: 70,
    texture: 'grainy'
  },

  // Soups
  'egusi soup': {
    shape: 'bowl',
    primaryColor: '#8B4513',
    borderColor: '#654321',
    size: 85,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'leaf', x: -30, y: -20, size: 12 },
        { type: 'leaf', x: 25, y: -15, size: 10 },
        { type: 'leaf', x: 0, y: -25, size: 8 },
        { type: 'circle', x: 15, y: 15, size: 6 }, // Meat pieces
        { type: 'circle', x: -15, y: 20, size: 5 }
      ]
    },
    isHot: true
  },

  'ogbono soup': {
    shape: 'bowl',
    primaryColor: '#A0522D',
    borderColor: '#8B4513',
    size: 80,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'leaf', x: -25, y: -18, size: 10 },
        { type: 'leaf', x: 20, y: -12, size: 8 },
        { type: 'circle', x: 10, y: 15, size: 7 },
        { type: 'circle', x: -10, y: 20, size: 6 }
      ]
    },
    isHot: true
  },

  'pepper soup': {
    shape: 'cylinder',
    primaryColor: '#FF6347',
    borderColor: '#DC143C',
    size: 75,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'leaf', x: -20, y: -25, size: 8 },
        { type: 'leaf', x: 15, y: -20, size: 6 }
      ]
    },
    isHot: true,
    details: {
      steamColor: '#FFA07A',
      particles: [
        { x: -25, y: -40, size: 3, color: '#FF4500' },
        { x: 20, y: -35, size: 2, color: '#FF6347' },
        { x: 0, y: -45, size: 4, color: '#FF7F50' }
      ]
    }
  },

  'okra soup': {
    shape: 'bowl',
    primaryColor: '#228B22',
    borderColor: '#006400',
    size: 82,
    texture: 'bumpy',
    garnish: {
      color: '#8B4513',
      elements: [
        { type: 'circle', x: -20, y: -15, size: 8 }, // Meat
        { type: 'circle', x: 15, y: -10, size: 6 },
        { type: 'circle', x: 0, y: 20, size: 5 }
      ]
    },
    isHot: true
  },

  'banga soup': {
    shape: 'bowl',
    primaryColor: '#D2691E',
    borderColor: '#8B4513',
    size: 80,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'leaf', x: -25, y: -18, size: 10 },
        { type: 'leaf', x: 20, y: -12, size: 8 },
        { type: 'circle', x: 10, y: 15, size: 7 }
      ]
    },
    isHot: true
  },

  'afang soup': {
    shape: 'bowl',
    primaryColor: '#2F4F2F',
    borderColor: '#1C1C1C',
    size: 85,
    texture: 'bumpy',
    garnish: {
      color: '#8B4513',
      elements: [
        { type: 'circle', x: -30, y: -20, size: 10 },
        { type: 'circle', x: 25, y: -15, size: 8 },
        { type: 'circle', x: 5, y: -25, size: 6 },
        { type: 'leaf', x: -10, y: 20, size: 12 }
      ]
    },
    isHot: true
  },

  'suya': {
    shape: 'irregular',
    primaryColor: '#8B4513',
    borderColor: '#654321',
    size: 60,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'circle', x: 0, y: 0, size: 3 },
        { type: 'circle', x: 15, y: 5, size: 3 },
        { type: 'circle', x: -15, y: 5, size: 3 },
        { type: 'circle', x: 0, y: 20, size: 3 },
        { type: 'circle', x: 10, y: -15, size: 3 }
      ]
    },
    isHot: true,
    details: {
      steamColor: '#FFA07A'
    }
  },

  'chicken suya': {
    shape: 'irregular',
    primaryColor: '#D2691E',
    borderColor: '#8B4513',
    size: 65,
    texture: 'bumpy',
    garnish: {
      color: '#8B4513',
      elements: [
        { type: 'circle', x: 0, y: 0, size: 10 }, // Chicken piece
        { type: 'circle', x: 20, y: 8, size: 8 },
        { type: 'circle', x: -20, y: 8, size: 8 },
        { type: 'pepper', x: 10, y: -18, size: 4 }
      ]
    },
    isHot: true
  },

  'fish suya': {
    shape: 'irregular',
    primaryColor: '#F5DEB3',
    borderColor: '#DEB887',
    size: 62,
    texture: 'bumpy',
    garnish: {
      color: '#8B4513',
      elements: [
        { type: 'circle', x: 0, y: 0, size: 8 }, // Fish piece
        { type: 'circle', x: 18, y: 6, size: 6 },
        { type: 'pepper', x: 8, y: -15, size: 3 }
      ]
    },
    isHot: true
  },

  // Proteins
  'grilled fish': {
    shape: 'irregular',
    primaryColor: '#F4A460',
    borderColor: '#CD853F',
    size: 75,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'leaf', x: -25, y: -20, size: 8 },
        { type: 'leaf', x: 20, y: -15, size: 6 },
        { type: 'pepper', x: 0, y: 25, size: 4 }
      ]
    },
    isHot: true
  },

  'catfish pepper soup': {
    shape: 'cylinder',
    primaryColor: '#696969',
    borderColor: '#2F4F4F',
    size: 70,
    texture: 'smooth',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'leaf', x: -15, y: -25, size: 6 },
        { type: 'pepper', x: 10, y: -20, size: 4 }
      ]
    },
    isHot: true
  },

  'grilled chicken': {
    shape: 'irregular',
    primaryColor: '#DEB887',
    borderColor: '#CD853F',
    size: 80,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'leaf', x: -30, y: -20, size: 8 },
        { type: 'leaf', x: 25, y: -15, size: 6 },
        { type: 'pepper', x: 5, y: 25, size: 4 }
      ]
    },
    isHot: true
  },

  'assorted meat': {
    shape: 'bowl',
    primaryColor: '#8B4513',
    borderColor: '#654321',
    size: 85,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'circle', x: -25, y: -15, size: 10 },
        { type: 'circle', x: 20, y: -10, size: 8 },
        { type: 'circle', x: 5, y: -20, size: 12 },
        { type: 'circle', x: -10, y: 15, size: 6 },
        { type: 'circle', x: 15, y: 20, size: 7 }
      ]
    },
    isHot: true
  },

  'cow leg': {
    shape: 'cylinder',
    primaryColor: '#8B4513',
    borderColor: '#654321',
    size: 75,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'leaf', x: -20, y: -25, size: 8 },
        { type: 'leaf', x: 15, y: -20, size: 6 }
      ]
    },
    isHot: true
  },

  // Snacks and Small Chops
  'chin chin': {
    shape: 'irregular',
    primaryColor: '#D2691E',
    borderColor: '#8B4513',
    size: 60,
    texture: 'bumpy',
    garnish: {
      color: '#FFF8DC',
      elements: [
        { type: 'circle', x: -15, y: -10, size: 4 },
        { type: 'circle', x: 10, y: -5, size: 3 },
        { type: 'circle', x: 0, y: 15, size: 5 },
        { type: 'circle', x: -20, y: 20, size: 3 },
        { type: 'circle', x: 18, y: 12, size: 4 }
      ]
    }
  },

  'puff puff': {
    shape: 'irregular',
    primaryColor: '#F4A460',
    borderColor: '#D2691E',
    size: 65,
    texture: 'smooth',
    garnish: {
      color: '#FFF8DC',
      elements: [
        { type: 'circle', x: -20, y: -10, size: 12 },
        { type: 'circle', x: 15, y: -5, size: 10 },
        { type: 'circle', x: 0, y: 15, size: 8 }
      ]
    }
  },

  'samosa': {
    shape: 'irregular',
    primaryColor: '#D2B48C',
    borderColor: '#CD853F',
    size: 55,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'circle', x: 0, y: 5, size: 3 }, // Filling
        { type: 'leaf', x: -15, y: -10, size: 4 }
      ]
    }
  },

  'meat pie': {
    shape: 'irregular',
    primaryColor: '#DEB887',
    borderColor: '#CD853F',
    size: 60,
    texture: 'bumpy',
    garnish: {
      color: '#8B4513',
      elements: [
        { type: 'circle', x: 0, y: 0, size: 8 }, // Meat filling
        { type: 'circle', x: -10, y: -5, size: 4 },
        { type: 'circle', x: 10, y: 5, size: 6 }
      ]
    }
  },

  'fish pie': {
    shape: 'irregular',
    primaryColor: '#F5DEB3',
    borderColor: '#DEB887',
    size: 58,
    texture: 'bumpy',
    garnish: {
      color: '#4682B4',
      elements: [
        { type: 'circle', x: 0, y: 0, size: 6 }, // Fish filling
        { type: 'circle', x: -8, y: -3, size: 3 },
        { type: 'circle', x: 8, y: 3, size: 4 }
      ]
    }
  },

  'biscuit': {
    shape: 'irregular',
    primaryColor: '#D2B48C',
    borderColor: '#CD853F',
    size: 50,
    texture: 'bumpy',
    garnish: {
      color: '#FFF8DC',
      elements: [
        { type: 'circle', x: -8, y: -5, size: 3 },
        { type: 'circle', x: 8, y: -3, size: 2 },
        { type: 'circle', x: 0, y: 8, size: 4 }
      ]
    }
  },

  // Swallow Companions
  'ogbono': {
    shape: 'irregular',
    primaryColor: '#8B4513',
    borderColor: '#654321',
    size: 45,
    texture: 'bumpy'
  },

  'melon seeds': {
    shape: 'irregular',
    primaryColor: '#F5DEB3',
    borderColor: '#DEB887',
    size: 40,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'circle', x: 0, y: 0, size: 2 },
        { type: 'circle', x: 8, y: 3, size: 2 },
        { type: 'circle', x: -8, y: -3, size: 2 },
        { type: 'circle', x: 5, y: -8, size: 2 },
        { type: 'circle', x: -5, y: 8, size: 2 }
      ]
    }
  },

  'crayfish': {
    shape: 'irregular',
    primaryColor: '#FF6347',
    borderColor: '#DC143C',
    size: 35,
    texture: 'bumpy',
    garnish: {
      color: '#8B4513',
      elements: [
        { type: 'circle', x: 0, y: 0, size: 3 },
        { type: 'circle', x: 6, y: 2, size: 2 },
        { type: 'circle', x: -6, y: -2, size: 2 }
      ]
    }
  },

  // Proteins (continued)
  'beef': {
    shape: 'irregular',
    primaryColor: '#8B0000',
    borderColor: '#654321',
    size: 70,
    texture: 'bumpy'
  },

  'chicken': {
    shape: 'irregular',
    primaryColor: '#DEB887',
    borderColor: '#CD853F',
    size: 75,
    texture: 'bumpy'
  },

  'fish': {
    shape: 'irregular',
    primaryColor: '#4682B4',
    borderColor: '#2F4F4F',
    size: 65,
    texture: 'smooth'
  },

  'shaki': {
    shape: 'irregular',
    primaryColor: '#A0522D',
    borderColor: '#8B4513',
    size: 68,
    texture: 'bumpy'
  },

  'kponmo': {
    shape: 'irregular',
    primaryColor: '#8B4513',
    borderColor: '#654321',
    size: 65,
    texture: 'bumpy'
  },

  // Traditional/Local Dishes
  'kunun gyada': {
    shape: 'bowl',
    primaryColor: '#F5DEB3',
    borderColor: '#DEB887',
    size: 75,
    texture: 'smooth',
    garnish: {
      color: '#8B4513',
      elements: [
        { type: 'circle', x: -15, y: -10, size: 4 },
        { type: 'circle', x: 10, y: -5, size: 3 }
      ]
    }
  },

  'ogi': {
    shape: 'bowl',
    primaryColor: '#FFF8DC',
    borderColor: '#F5DEB3',
    size: 70,
    texture: 'smooth'
  },

  'tuwo shinkafa': {
    shape: 'bowl',
    primaryColor: '#F5F5F5',
    borderColor: '#D3D3D3',
    size: 78,
    texture: 'smooth'
  },

  'dambun nama': {
    shape: 'irregular',
    primaryColor: '#D2691E',
    borderColor: '#8B4513',
    size: 60,
    texture: 'bumpy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'leaf', x: -15, y: -8, size: 6 },
        { type: 'leaf', x: 12, y: -5, size: 5 },
        { type: 'circle', x: 5, y: 12, size: 4 }
      ]
    }
  },

  'kilishi': {
    shape: 'irregular',
    primaryColor: '#DEB887',
    borderColor: '#CD853F',
    size: 65,
    texture: 'bumpy',
    garnish: {
      color: '#8B4513',
      elements: [
        { type: 'pepper', x: -10, y: -5, size: 3 },
        { type: 'pepper', x: 8, y: 3, size: 2 },
        { type: 'pepper', x: 0, y: 12, size: 4 }
      ]
    }
  },

  'nama': {
    shape: 'irregular',
    primaryColor: '#8B0000',
    borderColor: '#654321',
    size: 70,
    texture: 'bumpy'
  },

  // Default fallback
  'default': {
    shape: 'bowl',
    primaryColor: '#D2691E',
    borderColor: '#8B4513',
    size: 75,
    texture: 'grainy',
    garnish: {
      color: '#228B22',
      elements: [
        { type: 'circle', x: -10, y: -10, size: 5 },
        { type: 'circle', x: 10, y: 10, size: 3 }
      ]
    }
  }
};

// Helper functions for model operations
export const getFoodModel = (foodName: string): FoodModel => {
  const normalizedName = foodName.toLowerCase().trim();
  return NigerianFoodModels[normalizedName] || NigerianFoodModels.default;
};

export const getAllFoodNames = (): string[] => {
  return Object.keys(NigerianFoodModels).filter(key => key !== 'default');
};

export const getFoodsByCategory = (category: string): string[] => {
  const categoryMapping: Record<string, string[]> = {
    rice: ['jollof rice', 'jollof rice with chicken', 'party jollof rice', 'fried rice', 'coconut rice', 'plain rice'],
    swallow: ['fufu', 'pounded yam', 'semovita', 'eba', 'amala'],
    soup: ['egusi soup', 'ogbono soup', 'pepper soup', 'okra soup', 'banga soup', 'afang soup'],
    suya: ['suya', 'chicken suya', 'fish suya'],
    protein: ['grilled fish', 'catfish pepper soup', 'grilled chicken', 'assorted meat', 'cow leg', 'beef', 'chicken', 'fish', 'shaki', 'kponmo'],
    snack: ['chin chin', 'puff puff', 'samosa', 'meat pie', 'fish pie', 'biscuit'],
    traditional: ['kunun gyada', 'ogi', 'tuwo shinkafa', 'dambun nama', 'kilishi', 'nama']
  };
  
  return categoryMapping[category.toLowerCase()] || [];
};

export const validateFoodModel = (foodName: string): boolean => {
  return NigerianFoodModels.hasOwnProperty(foodName.toLowerCase().trim());
};