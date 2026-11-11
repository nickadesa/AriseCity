// Service to aggregate and query all 1,495+ City Masterplan Assets and Catalogs
import buildingTypologiesData from '../../city/data/catalog/building_typologies.json';
import coastalLandscapeData from '../../city/data/catalog/landscape_coastal.json';
import streetFurnitureData from '../../city/data/catalog/street_furniture.json';
import interiorFurnitureData from '../../city/data/catalog/interior_furniture.json';
import specializedEquipmentData from '../../city/data/catalog/specialized_equipment.json';
import vehiclesData from '../../city/data/catalog/vehicles.json';
import hairCatalogData from '../../city/npc/catalog/hair_catalog.json';
import topCatalogData from '../../city/npc/catalog/top_catalog.json';
import bottomCatalogData from '../../city/npc/catalog/bottom_catalog.json';

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  tile_footprint?: {
    width: number;
    depth: number;
    height_tiles?: number;
  };
  dimensions?: {
    width_m?: number;
    depth_m?: number;
    height_m?: number;
  };
  material?: string;
  color_hex?: string;
  tags?: string[];
  description?: string;
  variants?: Array<{
    name: string;
    color_hex?: string;
    material?: string;
  }>;
}

export interface CatalogCategorySummary {
  id: string;
  title: string;
  icon: string;
  count: number;
  description: string;
  items: CatalogItem[];
}

export class CatalogService {
  private static cachedCategories: CatalogCategorySummary[] | null = null;

  static getCategories(): CatalogCategorySummary[] {
    if (this.cachedCategories) return this.cachedCategories;

    const buildings = (buildingTypologiesData as any).items || [];
    const landscape = (coastalLandscapeData as any).items || [];
    const street = (streetFurnitureData as any).items || [];
    const interior = (interiorFurnitureData as any).items || [];
    const specialized = (specializedEquipmentData as any).items || [];
    const vehicles = (vehiclesData as any).items || [];
    
    // Aggregate NPC fashion items
    const npcHair = (hairCatalogData as any).items || [];
    const npcTops = (topCatalogData as any).items || [];
    const npcBottoms = (bottomCatalogData as any).items || [];
    const npcItems = [...npcHair, ...npcTops, ...npcBottoms];

    this.cachedCategories = [
      {
        id: 'buildings',
        title: 'Building Typologies',
        icon: '🏢',
        count: buildings.length,
        description: 'Architectural massing, modular containers, stepped coastal villas, maritime pavilions, and clean energy towers.',
        items: buildings,
      },
      {
        id: 'landscape',
        title: 'Coastal Landscape & Flora',
        icon: '🌴',
        count: landscape.length,
        description: 'Mexican fan palms, coastal dunes, seawalls, boardwalk decks, rock revetments, and beach cabanas.',
        items: landscape,
      },
      {
        id: 'street',
        title: 'Street Furniture & Infrastructure',
        icon: '🪑',
        count: street.length,
        description: 'Solar streetlights, granite bollards, teak promenade benches, smart transit stops, and EV chargers.',
        items: street,
      },
      {
        id: 'interior',
        title: 'Interior Workspaces & Lounges',
        icon: '🛋️',
        count: interior.length,
        description: 'Catch Coworking 01 ergonomic desks, bleacher steps, acoustic meeting pods, coffee bars, and sofas.',
        items: interior,
      },
      {
        id: 'specialized',
        title: 'Clean Tech & Specialized Equipment',
        icon: '🔬',
        count: specialized.length,
        description: 'AIRMADE Direct Air Capture modules, solar canopies, seawater desalination skids, and weather sensors.',
        items: specialized,
      },
      {
        id: 'vehicles',
        title: 'Vehicles & Maritime Vessels',
        icon: '🚗',
        count: vehicles.length,
        description: 'Electric autonomous shuttles, fishing trawlers, sailing catamarans, delivery drones, and commuter e-buses.',
        items: vehicles,
      },
      {
        id: 'fashion',
        title: 'NPC Outfits & Character Styling',
        icon: '👔',
        count: npcItems.length,
        description: 'Coastal maritime caps, linen blazers, tech wear, polarized sunglasses, wetsuits, and formal office wear.',
        items: npcItems,
      },
    ];

    return this.cachedCategories;
  }

  static getTotalItemCount(): number {
    return this.getCategories().reduce((sum, cat) => sum + cat.count, 0);
  }

  static searchItems(query: string, categoryId?: string): CatalogItem[] {
    const categories = this.getCategories();
    const filteredCategories = categoryId 
      ? categories.filter(c => c.id === categoryId)
      : categories;

    const q = query.toLowerCase().trim();
    if (!q) {
      return filteredCategories.flatMap(c => c.items);
    }

    const results: CatalogItem[] = [];
    for (const cat of filteredCategories) {
      for (const item of cat.items) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchTag = item.tags?.some(t => t.toLowerCase().includes(q));
        const matchCat = item.category?.toLowerCase().includes(q);
        if (matchName || matchId || matchTag || matchCat) {
          results.push(item);
        }
      }
    }
    return results;
  }
}
