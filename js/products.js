/** Product catalog - specialty shop items */

export const PRODUCTS = [
  {
    id: "dead-sea-mud-mask",
    name: "Dead Sea Mud Mask",
    price: 89,
    badge: "Famous",
    description: "Mineral-rich mask from the Dead Sea - a top exported beauty product.",
    image: "public/dead-sea-mud-mask.jpg",
  },
  {
    id: "ahava-hand-cream",
    name: "AHAVA Hand Cream",
    price: 99,
    badge: "Famous",
    description: "Mineral-rich hand cream from the Dead Sea - AHAVA's iconic Dermud body intensive nourishment.",
    image: "public/ahava-hand-cream.jpg",
  },
  {
    id: "sabon-body-scrub",
    name: "Sabon Body Scrub",
    price: 119,
    badge: "Best Seller",
    description: "Handmade body scrub with natural oils and sea salt.",
    image: "public/sabon-body-scrub.jpg",
  },
  {
    id: "elite-chocolate-box",
    name: "Elite Chocolate Assortment",
    price: 45,
    badge: "Classic",
    description: "Beloved Elite chocolate - a household name since 1934.",
    image: "public/elite-chocolate-box.jpg",
  },
  {
    id: "bamba-family-pack",
    name: "Bamba Family Pack",
    price: 32,
    badge: "Iconic",
    description: "Peanut butter puffs - the snack every kid grows up on.",
    image: "public/bamba-family-pack.jpg",
  },
  {
    id: "galil-wine-red",
    name: "Galil Mountain Red Wine",
    price: 95,
    badge: "Award Winner",
    description: "Premium Galilee wine from one of the region's top vineyards.",
    image: "public/galil-wine-red.jpg",
  },
  {
    id: "soda-stream-spark",
    name: "SodaStream Spark",
    price: 349,
    badge: "Local Brand",
    description: "The world-famous carbonation system, invented locally.",
    image: "public/soda-stream-spark.jpg",
  },
  {
    id: "shabbat-candle-set",
    name: "Shabbat Candle Set",
    price: 28,
    description: "Traditional beeswax candles - 12-hour burn.",
    image: "public/shabbat-candle-set.jpg",
  },
  {
    id: "linen-table-runner",
    name: "Linen Table Runner",
    price: 78,
    description: "Natural linen runner in Mediterranean blue.",
    image: "public/linen-table-runner.jpg",
  },
];

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function getProductImage(product) {
  return product?.image || "";
}
