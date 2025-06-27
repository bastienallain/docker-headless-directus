// 🔗 Vercel Revalidation Webhook Handler
// API route: /api/revalidate.js

export default async function handler(req, res) {
  // Security: Verify webhook signature/token
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  if (token !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid authorization token' 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { collection, action, key, data } = req.body;
    
    console.log(`[WEBHOOK] ${collection}:${action} - ${key}`);
    
    // Define revalidation strategy based on collection
    const revalidationMap = {
      // Blog posts
      blog_posts: {
        paths: [
          '/blog',
          '/blog/page/[page]',
          key ? `/blog/${data?.slug || key}` : null
        ].filter(Boolean),
        tags: ['blog', 'blog-posts', key ? `blog-${key}` : null].filter(Boolean)
      },
      
      // Pages
      pages: {
        paths: [
          '/',
          key ? `/${data?.slug || key}` : null
        ].filter(Boolean),
        tags: ['pages', key ? `page-${key}` : null].filter(Boolean)
      },
      
      // Global settings
      globals: {
        paths: ['/'], // Revalidate homepage for nav/settings changes
        tags: ['globals', 'navigation', 'settings']
      },
      
      // Products (e-commerce example)
      products: {
        paths: [
          '/products',
          '/products/[category]',
          key ? `/products/${data?.slug || key}` : null
        ].filter(Boolean),
        tags: ['products', key ? `product-${key}` : null].filter(Boolean)
      },
      
      // Categories
      categories: {
        paths: ['/products', '/blog'],
        tags: ['categories', 'products', 'blog']
      }
    };

    const config = revalidationMap[collection];
    
    if (!config) {
      return res.status(200).json({
        success: true,
        message: `No revalidation configured for collection: ${collection}`,
        collection,
        action
      });
    }

    // Revalidate paths
    const revalidatedPaths = [];
    for (const path of config.paths) {
      try {
        await res.revalidate(path);
        revalidatedPaths.push(path);
        console.log(`[REVALIDATED] ${path}`);
      } catch (error) {
        console.error(`[REVALIDATION ERROR] ${path}:`, error.message);
      }
    }

    // If using Next.js 13+ with App Router and revalidateTag
    if (config.tags && res.revalidateTag) {
      for (const tag of config.tags) {
        try {
          await res.revalidateTag(tag);
          console.log(`[REVALIDATED TAG] ${tag}`);
        } catch (error) {
          console.error(`[TAG REVALIDATION ERROR] ${tag}:`, error.message);
        }
      }
    }

    // Special handling for delete actions
    if (action === 'delete') {
      // You might want to redirect deleted pages to 404
      // or trigger a full site rebuild for critical content
      console.log(`[DELETE] ${collection}:${key} - Consider full rebuild`);
    }

    return res.status(200).json({
      success: true,
      message: 'Revalidation triggered successfully',
      collection,
      action,
      key,
      revalidatedPaths,
      revalidatedTags: config.tags || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during revalidation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Configuration for Vercel
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};