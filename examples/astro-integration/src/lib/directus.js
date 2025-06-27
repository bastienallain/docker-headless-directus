// 🎯 Directus API Client for Astro
// Optimized for our headless CMS stack with aggressive caching

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL || 'http://localhost:8057';
const DIRECTUS_TOKEN = import.meta.env.DIRECTUS_TOKEN || '';

// Base fetch function with optimized caching
async function directusFetch(endpoint, options = {}) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(DIRECTUS_TOKEN && { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }),
      ...options.headers
    },
    // Use our 24h cache from the headless stack
    cache: options.cache || 'default'
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`Directus API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

// Get all items from a collection with pagination support
export async function getItems(collection, params = {}) {
  const searchParams = new URLSearchParams({
    limit: '100', // Default limit
    ...params
  });
  
  const data = await directusFetch(`/items/${collection}?${searchParams}`);
  return data.data || [];
}

// Get single item by ID
export async function getItem(collection, id, params = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString() ? `?${searchParams}` : '';
  
  const data = await directusFetch(`/items/${collection}/${id}${query}`);
  return data.data;
}

// Get global settings/configuration
export async function getGlobals(params = {}) {
  return await getItems('globals', params);
}

// Optimized image URL builder for our Sharp-powered assets
export function getAssetUrl(assetId, transforms = {}) {
  if (!assetId) return null;
  
  const params = new URLSearchParams();
  
  // Apply transforms
  if (transforms.width) params.set('width', transforms.width);
  if (transforms.height) params.set('height', transforms.height);
  if (transforms.quality) params.set('quality', transforms.quality);
  if (transforms.format) params.set('format', transforms.format);
  if (transforms.fit) params.set('fit', transforms.fit);
  
  // Default optimizations for web
  if (!params.has('quality')) params.set('quality', '85');
  if (!params.has('format')) params.set('format', 'webp');
  
  const query = params.toString() ? `?${params}` : '';
  return `${DIRECTUS_URL}/assets/${assetId}${query}`;
}

// Generate responsive image srcset
export function getResponsiveImages(assetId, sizes = [320, 640, 1024, 1920]) {
  if (!assetId) return null;
  
  const srcset = sizes
    .map(width => `${getAssetUrl(assetId, { width })} ${width}w`)
    .join(', ');
    
  return {
    src: getAssetUrl(assetId, { width: 1024 }), // Default size
    srcset,
    sizes: '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px'
  };
}

// Webhooks helper for revalidation (Astro doesn't have built-in ISR like Next.js)
export async function triggerRevalidation(collection, action, key) {
  // This would typically be handled by your deployment platform
  // Example for Vercel:
  if (typeof window !== 'undefined') return; // Only on server
  
  try {
    // You can implement custom revalidation logic here
    console.log(`Revalidation triggered for ${collection}:${action}:${key}`);
  } catch (error) {
    console.error('Revalidation failed:', error);
  }
}

// Example collections helpers
export const blog = {
  getPosts: (params) => getItems('blog_posts', {
    sort: '-date_created',
    status: 'published',
    ...params
  }),
  
  getPost: (slug) => getItems('blog_posts', {
    filter: { slug: { _eq: slug } },
    limit: 1
  }).then(posts => posts[0]),
  
  getCategories: () => getItems('blog_categories', {
    sort: 'name'
  })
};

export const pages = {
  getPages: (params) => getItems('pages', {
    sort: 'sort',
    status: 'published',
    ...params
  }),
  
  getPage: (slug) => getItems('pages', {
    filter: { slug: { _eq: slug } },
    limit: 1
  }).then(pages => pages[0])
};

// Example usage patterns:
/*
// In your .astro files:

---
import { blog, getAssetUrl, getResponsiveImages } from '../lib/directus.js';

// Get all blog posts
const posts = await blog.getPosts();

// Get featured image for a post
const post = posts[0];
const featuredImage = getResponsiveImages(post.featured_image);
---

<div>
  {posts.map(post => (
    <article>
      <h2>{post.title}</h2>
      {post.featured_image && (
        <img 
          src={featuredImage.src}
          srcset={featuredImage.srcset}
          sizes={featuredImage.sizes}
          alt={post.title}
          loading="lazy"
        />
      )}
      <p>{post.excerpt}</p>
    </article>
  ))}
</div>
*/