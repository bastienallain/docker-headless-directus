// 🎯 Directus API Client for Next.js
// Optimized for our headless CMS stack with ISR support

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8057';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';

// Base fetch function with Next.js optimizations
async function directusFetch(endpoint, options = {}) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(DIRECTUS_TOKEN && { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }),
      ...options.headers
    },
    // Next.js ISR configuration
    next: {
      revalidate: options.revalidate || 3600, // 1 hour default (matches our cache)
      tags: options.tags || ['directus']
    }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`Directus API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    
    // Return empty data structure on error to prevent page crashes
    return { data: options.fallback || null };
  }
}

// Get all items from a collection with ISR support
export async function getItems(collection, params = {}, options = {}) {
  const searchParams = new URLSearchParams({
    limit: '100',
    ...params
  });
  
  const data = await directusFetch(`/items/${collection}?${searchParams}`, {
    revalidate: options.revalidate || 3600,
    tags: [`directus-${collection}`, ...(options.tags || [])],
    fallback: []
  });
  
  return data.data || [];
}

// Get single item by ID with ISR
export async function getItem(collection, id, params = {}, options = {}) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString() ? `?${searchParams}` : '';
  
  const data = await directusFetch(`/items/${collection}/${id}${query}`, {
    revalidate: options.revalidate || 3600,
    tags: [`directus-${collection}`, `directus-${collection}-${id}`, ...(options.tags || [])],
    fallback: null
  });
  
  return data.data;
}

// Get static paths for dynamic routes
export async function getStaticPaths(collection, pathField = 'slug') {
  try {
    const items = await getItems(collection, {
      fields: [pathField],
      status: 'published'
    }, { revalidate: 86400 }); // 24 hours for paths
    
    const paths = items.map(item => ({
      params: { [pathField]: item[pathField] }
    }));
    
    return {
      paths,
      fallback: 'blocking' // Enable ISR for new content
    };
  } catch (error) {
    console.error(`Error getting static paths for ${collection}:`, error);
    return { paths: [], fallback: 'blocking' };
  }
}

// Optimized image URL builder for Next.js Image component
export function getImageProps(assetId, transforms = {}) {
  if (!assetId) return null;
  
  const params = new URLSearchParams();
  
  // Apply transforms
  if (transforms.width) params.set('width', transforms.width);
  if (transforms.height) params.set('height', transforms.height);
  if (transforms.quality) params.set('quality', transforms.quality);
  if (transforms.format) params.set('format', transforms.format);
  if (transforms.fit) params.set('fit', transforms.fit);
  
  // Defaults optimized for Next.js
  if (!params.has('quality')) params.set('quality', '85');
  if (!params.has('format')) params.set('format', 'webp');
  
  const query = params.toString() ? `?${params}` : '';
  const src = `${DIRECTUS_URL}/assets/${assetId}${query}`;
  
  return {
    src,
    width: transforms.width || 1200,
    height: transforms.height || 800,
    alt: transforms.alt || ''
  };
}

// Generate blur placeholder for images
export function getBlurDataURL(assetId) {
  if (!assetId) return null;
  
  // Generate a tiny blurred version
  return `${DIRECTUS_URL}/assets/${assetId}?width=10&height=10&quality=1&blur=10&format=webp`;
}

// Revalidation function for webhooks
export async function revalidateContent(tag, path) {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag, path })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Revalidation failed:', error);
    return false;
  }
}

// Collection-specific helpers with ISR optimization
export const blog = {
  // Get all posts with pagination
  getPosts: (params = {}, options = {}) => getItems('blog_posts', {
    sort: '-date_created',
    status: 'published',
    ...params
  }, {
    revalidate: 1800, // 30 minutes for blog list
    tags: ['blog-posts'],
    ...options
  }),
  
  // Get single post by slug
  getPost: async (slug, options = {}) => {
    const posts = await getItems('blog_posts', {
      filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
      limit: 1
    }, {
      revalidate: 3600, // 1 hour for individual posts
      tags: ['blog-posts', `blog-post-${slug}`],
      ...options
    });
    return posts[0] || null;
  },
  
  // Get static paths for blog posts
  getStaticPaths: () => getStaticPaths('blog_posts', 'slug'),
  
  // Get categories
  getCategories: (options = {}) => getItems('blog_categories', {
    sort: 'name'
  }, {
    revalidate: 86400, // 24 hours for categories
    tags: ['blog-categories'],
    ...options
  })
};

export const pages = {
  // Get all pages
  getPages: (params = {}, options = {}) => getItems('pages', {
    sort: 'sort',
    status: 'published',
    ...params
  }, {
    revalidate: 3600,
    tags: ['pages'],
    ...options
  }),
  
  // Get page by slug
  getPage: async (slug, options = {}) => {
    const pages = await getItems('pages', {
      filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
      limit: 1
    }, {
      revalidate: 3600,
      tags: ['pages', `page-${slug}`],
      ...options
    });
    return pages[0] || null;
  },
  
  // Get static paths for pages
  getStaticPaths: () => getStaticPaths('pages', 'slug')
};

export const globals = {
  // Get site settings
  getSettings: (options = {}) => getItems('globals', {
    filter: { key: { _eq: 'site_settings' } },
    limit: 1
  }, {
    revalidate: 86400, // 24 hours for globals
    tags: ['globals', 'site-settings'],
    ...options
  }).then(items => items[0] || null),
  
  // Get navigation
  getNavigation: (options = {}) => getItems('globals', {
    filter: { key: { _eq: 'navigation' } },
    limit: 1
  }, {
    revalidate: 3600,
    tags: ['globals', 'navigation'],
    ...options
  }).then(items => items[0] || null)
};

// Example API route handler for webhooks (/api/revalidate.js)
export const revalidateHandler = async (req, res) => {
  // Verify webhook token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== process.env.REVALIDATE_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  const { collection, action, key } = req.body;
  
  try {
    // Revalidate based on collection
    switch (collection) {
      case 'blog_posts':
        await res.revalidateTag('blog-posts');
        if (key) await res.revalidateTag(`blog-post-${key}`);
        break;
        
      case 'pages':
        await res.revalidateTag('pages');
        if (key) await res.revalidateTag(`page-${key}`);
        break;
        
      case 'globals':
        await res.revalidateTag('globals');
        break;
        
      default:
        await res.revalidateTag(`directus-${collection}`);
    }
    
    return res.json({ revalidated: true, collection, action, key });
  } catch (error) {
    console.error('Revalidation error:', error);
    return res.status(500).json({ message: 'Error revalidating' });
  }
};

/* Example usage in pages/blog/[slug].js:

export async function getStaticProps({ params }) {
  const post = await blog.getPost(params.slug);
  
  if (!post) {
    return { notFound: true };
  }
  
  return {
    props: { post },
    revalidate: 3600 // ISR: regenerate page every hour
  };
}

export async function getStaticPaths() {
  return await blog.getStaticPaths();
}

// In your component:
import Image from 'next/image';
import { getImageProps, getBlurDataURL } from '../lib/directus';

export default function BlogPost({ post }) {
  const imageProps = getImageProps(post.featured_image, { 
    width: 1200, 
    height: 800,
    alt: post.title 
  });
  
  return (
    <article>
      <h1>{post.title}</h1>
      {imageProps && (
        <Image
          {...imageProps}
          placeholder="blur"
          blurDataURL={getBlurDataURL(post.featured_image)}
          priority
        />
      )}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
*/