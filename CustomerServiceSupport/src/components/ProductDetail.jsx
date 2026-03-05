//src/components/ProductDetail.jsx
import { useState } from "react";
import { ChevronLeft, CheckCircle, X, Shield, Wrench, Package, Star, ShoppingCart, Heart, Minus, Plus as PlusIcon, MessageCircle } from "lucide-react";

export const ProductDetail = ({ product, onBack, setPage, products, onWishlist, wishlisted }) => {
  const [activeTab, setActiveTab] = useState("specs");
  const [qty, setQty] = useState(1);

  const specLabels = {
    capacity: "Capacity", energy: "Energy Rating", noise: "Noise Level",
    programs: "Programs", spin: "Spin Speed", btu: "Cooling Power",
    coverage: "Room Coverage", compressor: "Compressor Type",
    freezer: "Freezer Capacity", defrost: "Defrost",
    power: "Power Output", display: "Display", drying: "Drying Method",
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="prod-breadcrumb">
        <div className="container">
          <button className="prod-back-btn" onClick={onBack}><ChevronLeft size={14} /> All Products</button>
          <span className="prod-breadcrumb-sep">/</span>
          <span className="prod-breadcrumb-current">{product.name}</span>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          <div className="prod-detail-grid">
            {/* Left: Image */}
            <div className="prod-detail-left">
              <div className={`prod-detail-image ${product.color}`}>
                <span className="prod-detail-emoji">{product.image}</span>
              </div>
              <div className="prod-detail-badges">
                {product.features.map((f, i) => (
                  <span key={i} className="prod-feature-tag"><CheckCircle size={11} /> {f}</span>
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className="prod-detail-right">
              <div className="prod-detail-top">
                <div className="prod-model-id" style={{ fontSize: 13 }}>{product.id}</div>
                {product.badge && <span className="prod-badge prod-badge-inline">{product.badge}</span>}
              </div>
              <h1 className="prod-detail-name">{product.name}</h1>
              <p className="prod-detail-tagline">{product.tagline}</p>

              <div className="prod-rating" style={{ marginBottom: 20 }}>
                <div className="prod-stars">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} fill={s <= Math.round(product.rating) ? "#f59e0b" : "none"} color={s <= Math.round(product.rating) ? "#f59e0b" : "#d1d5db"} />
                  ))}
                </div>
                <span className="prod-rating-val" style={{ fontSize: 15 }}>{product.rating}</span>
                <span className="prod-review-count">({product.reviews} reviews)</span>
              </div>

              <div className="prod-detail-price-row">
                <div>
                  <div className="prod-detail-price">{product.price}</div>
                  {product.oldPrice && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="prod-old-price" style={{ fontSize: 14 }}>{product.oldPrice}</div>
                      <span className="prod-savings">
                        Save {Math.round(((parseInt(product.oldPrice.replace(/\D/g, "")) - parseInt(product.price.replace(/\D/g, ""))) / parseInt(product.oldPrice.replace(/\D/g, ""))) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`prod-stock-badge ${product.inStock ? "in-stock" : "oos"}`}>
                  {product.inStock ? <><CheckCircle size={12} /> In Stock</> : <><X size={12} /> Out of Stock</>}
                </div>
              </div>

              <div className="prod-detail-warranty">
                <Shield size={14} color="var(--brand)" />
                <span><strong>Warranty:</strong> {product.warranty}</span>
              </div>

              {/* Qty + Actions */}
              {/* <div className="prod-qty-row">
                <div className="prod-qty">
                  <button className="prod-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={14} /></button>
                  <span className="prod-qty-val">{qty}</span>
                  <button className="prod-qty-btn" onClick={() => setQty(q => q + 1)}><PlusIcon size={14} /></button>
                </div>
                <button className="btn-primary" style={{ flex: 1 }} disabled={!product.inStock}>
                  <ShoppingCart size={15} /> {product.inStock ? "Add to Cart" : "Notify Me"}
                </button>
                <button className={`prod-wish-btn ${wishlisted ? "active" : ""}`} onClick={() => onWishlist(product.id)}>
                  <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
                </button>
              </div> */}

              {/* Tabs */}
              <div className="prod-tabs">
                {["specs", "features", "support"].map(tab => (
                  <button key={tab} className={`prod-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                    {tab === "specs" ? "Specifications" : tab === "features" ? "Features" : "Support Info"}
                  </button>
                ))}
              </div>

              {activeTab === "specs" && (
                <div className="prod-specs-grid">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="prod-spec-row">
                      <span className="prod-spec-label">{specLabels[k] || k}</span>
                      <span className="prod-spec-value">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "features" && (
                <div className="prod-features-list">
                  {product.features.map((f, i) => (
                    <div key={i} className="prod-feature-row">
                      <CheckCircle size={15} color="var(--brand)" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "support" && (
                <div className="prod-support-panel">
                  <div className="prod-support-item">
                    <Shield size={16} color="var(--brand)" />
                    <div>
                      <div className="prod-support-label">Warranty Coverage</div>
                      <div className="prod-support-val">{product.warranty}</div>
                    </div>
                  </div>
                  <div className="prod-support-item">
                    <Wrench size={16} color="#16a34a" />
                    <div>
                      <div className="prod-support-label">Service Available</div>
                      <div className="prod-support-val">Nationwide — 48h response</div>
                    </div>
                  </div>
                  <div className="prod-support-item">
                    <Package size={16} color="#f59e0b" />
                    <div>
                      <div className="prod-support-label">Spare Parts</div>
                      <div className="prod-support-val">In stock · 2–3 day delivery</div>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ marginTop: 12, width: "100%" }} onClick={() => setPage("support")}>
                    <MessageCircle size={14} /> Get Support for This Product
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Related products */}
          <div style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, marginBottom: 20 }}>You might also like</h2>
            <div className="prod-related-grid">
              {products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3).map(p => (
                <div key={p.id} className="prod-related-card" onClick={() => { window.scrollTo(0, 0); }}>
                  <div className={`prod-related-img ${p.color}`}><span>{p.image}</span></div>
                  <div className="prod-related-info">
                    <div className="prod-model-id" style={{ fontSize: 11 }}>{p.id}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 14, color: "var(--brand)", fontWeight: 700 }}>{p.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}