//src/pages/ProductPage.jsx
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Heart, Star, Eye, Package } from "lucide-react";
import { ProductDetail } from "../components/ProductDetail";
import '../style.css';
import { productService } from "../service/product";

// const PRODUCTS = [
//   {
//     id: "WM-7800", name: "FrontLoad Pro 7800", category: "washing-machine",
//     tagline: "Intelligent wash, gentle on every fabric",
//     price: "RM 2,499", oldPrice: "RM 2,899", badge: "Best Seller",
//     rating: 4.8, reviews: 324, inStock: true,
//     color: "icon-blue",
//     specs: { capacity: "8 kg", energy: "5-Star", noise: "42 dB", programs: "16", spin: "1400 RPM" },
//     features: ["AI Fabric Sensor", "Steam Wash", "Self-Clean Drum", "Wi-Fi Control", "Child Lock"],
//     warranty: "2 Years (Parts & Labour)",
//     image: "🫧",
//   },
//   {
//     id: "WM-5500", name: "TopLoad Eco 5500", category: "washing-machine",
//     tagline: "Economical, reliable, everyday performance",
//     price: "RM 1,299", oldPrice: null, badge: "New",
//     rating: 4.5, reviews: 187, inStock: true,
//     color: "icon-teal",
//     specs: { capacity: "7 kg", energy: "4-Star", noise: "48 dB", programs: "10", spin: "1200 RPM" },
//     features: ["Fuzzy Logic", "Soak Mode", "Gentle Drum", "Auto-Balance"],
//     warranty: "1 Year (Parts & Labour)",
//     image: "🌀",
//   },
//   {
//     id: "AC-5500", name: "CoolMax Inverter 5500", category: "air-conditioner",
//     tagline: "Whisper-quiet cooling, all day comfort",
//     price: "RM 1,799", oldPrice: "RM 2,100", badge: "Hot Deal",
//     rating: 4.7, reviews: 512, inStock: true,
//     color: "icon-purple",
//     specs: { btu: "12,000 BTU", energy: "5-Star", noise: "19 dB", coverage: "450 sq ft", compressor: "Inverter" },
//     features: ["Auto-Cleaning", "4D Airflow", "Sleep Mode", "PM 2.5 Filter", "Wi-Fi Smart"],
//     warranty: "5 Years Compressor, 2 Years Parts",
//     image: "❄️",
//   },
//   {
//     id: "AC-3300", name: "AirLite Standard 3300", category: "air-conditioner",
//     tagline: "Affordable cooling for small spaces",
//     price: "RM 999", oldPrice: null, badge: null,
//     rating: 4.3, reviews: 98, inStock: true,
//     color: "icon-teal",
//     specs: { btu: "9,000 BTU", energy: "3-Star", noise: "26 dB", coverage: "280 sq ft", compressor: "Non-Inverter" },
//     features: ["Timer Function", "Auto Restart", "Dehumidify Mode", "Sleep Mode"],
//     warranty: "1 Year (Parts & Labour)",
//     image: "🌬️",
//   },
//   {
//     id: "RF-3300", name: "FreshKeep 2-Door 3300", category: "refrigerator",
//     tagline: "Keep everything fresher, longer",
//     price: "RM 1,599", oldPrice: "RM 1,850", badge: "Popular",
//     rating: 4.6, reviews: 276, inStock: true,
//     color: "icon-green",
//     specs: { capacity: "340L", energy: "3-Star", noise: "38 dB", freezer: "80L", defrost: "Auto" },
//     features: ["No-Frost Technology", "Humidity Control", "Odour Filter", "Turbo Cool", "Tempered Glass Shelves"],
//     warranty: "2 Years (Parts), 5 Years Compressor",
//     image: "🧊",
//   },
//   {
//     id: "RF-4500", name: "FrenchDoor Elite 4500", category: "refrigerator",
//     tagline: "Stylish, spacious, and smart",
//     price: "RM 3,299", oldPrice: null, badge: "Premium",
//     rating: 4.9, reviews: 64, inStock: false,
//     color: "icon-rose",
//     specs: { capacity: "520L", energy: "5-Star", noise: "34 dB", freezer: "140L", defrost: "Auto" },
//     features: ["Twin Cooling System", "Water Dispenser", "Smart Diagnosis", "Door Alarm", "Sabbath Mode"],
//     warranty: "2 Years (Parts), 10 Years Compressor",
//     image: "🏠",
//   },
//   {
//     id: "DW-2200", name: "CleanSweep Dishwasher 2200", category: "dishwasher",
//     tagline: "Spotless results, zero effort",
//     price: "RM 2,199", oldPrice: "RM 2,499", badge: null,
//     rating: 4.4, reviews: 143, inStock: true,
//     color: "icon-orange",
//     specs: { capacity: "13 sets", energy: "4-Star", noise: "44 dB", programs: "8", drying: "Heat Dry" },
//     features: ["Half-Load Option", "Intensive Zone", "Delay Start", "Auto Door Open", "Stainless Interior"],
//     warranty: "2 Years (Parts & Labour)",
//     image: "✨",
//   },
//   {
//     id: "MW-1100", name: "QuickHeat Microwave 1100", category: "microwave",
//     tagline: "Fast, even, and perfectly heated every time",
//     price: "RM 399", oldPrice: "RM 499", badge: "Value Pick",
//     rating: 4.2, reviews: 389, inStock: true,
//     color: "icon-blue",
//     specs: { power: "1100W", capacity: "28L", noise: "50 dB", programs: "12", display: "LED" },
//     features: ["Auto Cook Menus", "Defrost by Weight", "Child Lock", "Keep Warm", "Easy Clean Interior"],
//     warranty: "1 Year (Parts & Labour)",
//     image: "📡",
//   },
// ];

const PRODUCT_CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "washing-machine", label: "Washing Machines" },
  { id: "air-conditioner", label: "Air Conditioners" },
  { id: "refrigerator", label: "Refrigerators" },
  { id: "dishwasher", label: "Dishwashers" },
  { id: "microwave", label: "Microwaves" },
];

export const ProductsPage = ({ setPage }) => {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [selected, setSelected] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const data = await productService.getProducts({
          name: search || undefined,
          category: category !== "all" ? category : undefined,
        });

        // Map backend format to your UI format
        const mapped = data.map(p => ({
          id: p.product_id,
          name: p.name,
          category: p.category,
          tagline: p.tagline,
          price: `RM ${p.price.toLocaleString()}`,
          oldPrice: p.oldPrice ? `RM ${p.oldPrice.toLocaleString()}` : null,
          badge: p.badge,
          rating: p.rating || 0,
          reviews: p.reviews || 0,   // You now HAVE reviews in DB
          inStock: p.in_stock,
          isDiscontinued: !p.inActive,
          specs: p.specs || {},
          features: p.features || [],
          warranty: `${p.warrantyMonths} Months`,
          image: p.image || "📦",
          color: p.color || "icon-blue",
        }));

        setProducts(mapped);

      } catch (error) {
        console.error("Fetch failed:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search]);

  const filtered = products
    .filter(p => (category === "all" || p.category === category) &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === "price-asc") return parseInt(a.price.replace(/\D/g, "")) - parseInt(b.price.replace(/\D/g, ""));
      if (sortBy === "price-desc") return parseInt(b.price.replace(/\D/g, "")) - parseInt(a.price.replace(/\D/g, ""));
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  const toggleWishlist = (id) => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  if (selected) return <ProductDetail product={selected} onBack={() => setSelected(null)} setPage={setPage} onWishlist={toggleWishlist} wishlisted={wishlist.includes(selected.id)} />;

  return (
    <>
      {/* Page Hero */}
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-label">Our Products</div>
          <h1 className="page-hero-title">Find your perfect <em>home appliance</em></h1>
          <p className="page-hero-sub">Browse our full range of quality appliances — each backed by our service guarantee and nationwide support network.</p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          {/* Toolbar */}
          <div className="prod-toolbar">
            <div className="prod-search-box">
              <Search size={15} color="var(--text-muted)" />
              <input className="prod-search-input" placeholder="Search products or model..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="prod-cats">
              {PRODUCT_CATEGORIES.map(cat => (
                <button key={cat.id} className={`prod-cat-btn ${category === cat.id ? "active" : ""}`} onClick={() => setCategory(cat.id)}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="prod-sort">
              <SlidersHorizontal size={14} color="var(--text-muted)" />
              <select className="prod-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="prod-results-meta">
            <span>{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</span>
            {wishlist.length > 0 && <span className="prod-wishlist-count"><Heart size={12} /> {wishlist.length} saved</span>}
          </div>

          {/* Grid */}
          <div className="prod-grid">
            {filtered.map(product => (
              <div key={product.id} className="prod-card" onClick={() => setSelected(product)}>
                {/* Badge */}
                {product.badge && <div className="prod-badge">{product.badge}</div>}
                {product.isDiscontinued && (
                  <div className="prod-badge prod-badge-oos">Discontinued</div>
                )}

                {!product.inStock && !product.isDiscontinued && (
                  <div className="prod-badge prod-badge-oos">Out of Stock</div>
                )}

                {/* Wishlist */}
                <button className={`prod-wishlist-btn ${wishlist.includes(product.id) ? "active" : ""}`}
                  onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}>
                  <Heart size={14} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                </button>

                {/* Image / Emoji placeholder */}
                <div className="prod-image">
                  <div className={`prod-image-inner ${product.color}`}>
                    <span className="prod-emoji">{product.image}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="prod-card-body">
                  <div className="prod-model-id">{product.id}</div>
                  <h3 className="prod-name">{product.name}</h3>
                  <div className="prod-tagline">{product.tagline}</div>

                  {/* Stars */}
                  <div className="prod-rating">
                    <div className="prod-stars">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} fill={s <= Math.round(product.rating) ? "#f59e0b" : "none"} color={s <= Math.round(product.rating) ? "#f59e0b" : "#d1d5db"} />
                      ))}
                    </div>
                    <span className="prod-rating-val">{product.rating}</span>
                    <span className="prod-review-count">({product.reviews})</span>
                  </div>

                  {/* Key specs */}
                  <div className="prod-spec-pills">
                    {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
                      <span key={k} className="prod-spec-pill">{v}</span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="prod-price-row">
                    <div>
                      <div className="prod-price">{product.price}</div>
                      {product.oldPrice && <div className="prod-old-price">{product.oldPrice}</div>}
                    </div>
                    <button className="prod-view-btn" onClick={e => { e.stopPropagation(); setSelected(product); }}>
                      <Eye size={13} /> View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <Package size={40} style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No products found</div>
              <div style={{ fontSize: 14 }}>Try a different category or search term</div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}