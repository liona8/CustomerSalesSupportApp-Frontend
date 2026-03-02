const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const productService = {
  async getProducts(filters = {}) {
    const params = new URLSearchParams();

    if (filters.product_id) params.append("product_id", filters.product_id);
    if (filters.name) params.append("name", filters.name);
    if (filters.category && filters.category !== "all") {
        params.append("category", filters.category);
    }

    const queryString = params.toString();
    const url = queryString
        ? `${API_BASE}/tools/products?${queryString}`
        : `${API_BASE}/tools/products`;

    const response = await fetch(url);

    if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
    }

    return response.json();
    }
};