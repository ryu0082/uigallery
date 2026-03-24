import { GalleryItem, Category } from "@/types";

const categories: Category[] = [
  "navigation", "hero", "cards", "forms", "dashboard",
  "mobile", "ecommerce", "landing", "typography"
];

const tagPool = [
  "minimal", "dark", "glassmorphism", "neumorphism", "brutalist",
  "gradient", "animated", "interactive", "sidebar", "dropdown",
  "modal", "table", "chart", "button", "input", "responsive",
  "grid", "flex", "scroll", "hover", "motion", "3d",
];

const titles: Record<Category, string[]> = {
  all: [],
  navigation: ["Floating Nav", "Sidebar Dock", "Mega Menu", "Tab Bar", "Breadcrumb Trail", "Sticky Header"],
  hero: ["Split Screen Hero", "Video Background", "Particle Effect", "Typographic Hero", "Gradient Mesh"],
  cards: ["Product Card", "Profile Card", "Stat Card", "Blog Card", "Pricing Card", "Feature Card"],
  forms: ["Multi-step Form", "Floating Label", "OTP Input", "Search Bar", "Date Picker", "Upload Zone"],
  dashboard: ["Analytics Board", "KPI Widget", "Data Table", "Chart Grid", "Activity Feed", "Status Board"],
  mobile: ["Bottom Sheet", "Swipe Card", "Tab Navigator", "Pull to Refresh", "Action Sheet"],
  ecommerce: ["Product Grid", "Cart Drawer", "Checkout Flow", "Filter Panel", "Review Card"],
  landing: ["Pricing Section", "Feature Grid", "Testimonial Carousel", "CTA Banner", "FAQ Accordion"],
  typography: ["Display Type", "Editorial Layout", "Pull Quote", "Code Block", "Article Header"],
};

const aspectRatios = [
  { w: 800, h: 600 },
  { w: 800, h: 500 },
  { w: 800, h: 700 },
  { w: 800, h: 450 },
  { w: 800, h: 800 },
  { w: 800, h: 550 },
];

const imageSeeds = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
  110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
  210, 220, 230, 240, 250, 260, 270, 280, 290, 300,
  310, 320, 330, 340, 350, 360, 370, 380, 390, 400,
  410, 420, 430, 440, 450, 460, 470, 480, 490, 500,
];

const authors = ["Mia Choi", "Jun Park", "Hana Lee", "Kai Shin", "Yuna Kim"];

// Deterministic likes/views using index
function deterministicLikes(i: number): number {
  return 50 + ((i * 137 + 31) % 1950);
}
function deterministicViews(i: number): number {
  return 500 + ((i * 251 + 77) % 9500);
}

// Deterministic tags - pick 2-3 tags based on index
function getTagsForIndex(i: number): string[] {
  const count = 2 + (i % 2);
  const tags: string[] = [];
  for (let t = 0; t < count; t++) {
    tags.push(tagPool[(i * 3 + t * 7) % tagPool.length]);
  }
  // deduplicate
  return [...new Set(tags)];
}

// Fixed base date so it doesn't change on every render
const BASE_DATE = new Date("2025-01-01T00:00:00Z").getTime();

function deterministicDate(i: number): string {
  const offset = (i * 86400 * 1000 * 2) % (90 * 24 * 60 * 60 * 1000);
  return new Date(BASE_DATE + offset).toISOString();
}

export const mockGalleryData: GalleryItem[] = Array.from({ length: 48 }, (_, i) => {
  const cat = categories[i % categories.length];
  const titleList = titles[cat];
  const titleBase = titleList[i % titleList.length];
  const ratio = aspectRatios[i % aspectRatios.length];
  const seed = imageSeeds[i % imageSeeds.length];

  return {
    id: `item-${i + 1}`,
    title: titleBase,
    description: `A beautifully crafted ${titleBase.toLowerCase()} component with modern aesthetics.`,
    imageUrl: `https://picsum.photos/seed/${seed + i}/${ratio.w}/${ratio.h}`,
    category: cat,
    tags: getTagsForIndex(i),
    author: authors[i % authors.length],
    likes: deterministicLikes(i),
    views: deterministicViews(i),
    createdAt: deterministicDate(i),
    width: ratio.w,
    height: ratio.h,
  };
});

export const allCategories: { id: Category; label: string; count: number }[] = [
  { id: "all", label: "All", count: mockGalleryData.length },
  { id: "navigation", label: "Navigation", count: mockGalleryData.filter(i => i.category === "navigation").length },
  { id: "hero", label: "Hero", count: mockGalleryData.filter(i => i.category === "hero").length },
  { id: "cards", label: "Cards", count: mockGalleryData.filter(i => i.category === "cards").length },
  { id: "forms", label: "Forms", count: mockGalleryData.filter(i => i.category === "forms").length },
  { id: "dashboard", label: "Dashboard", count: mockGalleryData.filter(i => i.category === "dashboard").length },
  { id: "mobile", label: "Mobile", count: mockGalleryData.filter(i => i.category === "mobile").length },
  { id: "ecommerce", label: "E-Commerce", count: mockGalleryData.filter(i => i.category === "ecommerce").length },
  { id: "landing", label: "Landing", count: mockGalleryData.filter(i => i.category === "landing").length },
  { id: "typography", label: "Typography", count: mockGalleryData.filter(i => i.category === "typography").length },
];

export const popularTags = tagPool.slice(0, 14);
