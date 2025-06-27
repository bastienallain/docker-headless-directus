// 🔗 Netlify Build Hook Handler
// Serverless function: netlify/functions/rebuild.js

exports.handler = async (event, context) => {
  // Security: Verify webhook signature/token
  const authHeader = event.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  if (token !== process.env.REBUILD_SECRET) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        message: 'Invalid authorization token' 
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        message: 'Method not allowed' 
      })
    };
  }

  try {
    const { collection, action, key, data } = JSON.parse(event.body);
    
    console.log(`[WEBHOOK] ${collection}:${action} - ${key}`);
    
    // Define which collections trigger rebuilds
    const rebuildCollections = [
      'blog_posts',
      'pages', 
      'globals',
      'navigation',
      'products',
      'categories'
    ];
    
    // Skip rebuild for non-critical collections
    if (!rebuildCollections.includes(collection)) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: `Webhook received but no rebuild needed for: ${collection}`,
          collection,
          action
        })
      };
    }

    // For critical changes, trigger immediate rebuild
    const criticalActions = ['create', 'update', 'delete'];
    const shouldRebuild = criticalActions.includes(action);
    
    if (!shouldRebuild) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: `Webhook received but no rebuild needed for action: ${action}`,
          collection,
          action
        })
      };
    }

    // Trigger Netlify build hook
    const buildHookUrl = process.env.NETLIFY_BUILD_HOOK;
    
    if (!buildHookUrl) {
      throw new Error('NETLIFY_BUILD_HOOK environment variable not set');
    }

    const buildResponse = await fetch(buildHookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trigger_title: `Content Update: ${collection}`,
        trigger_branch: 'main', // or your default branch
        clear_cache: true
      })
    });

    if (!buildResponse.ok) {
      throw new Error(`Build hook failed: ${buildResponse.status} ${buildResponse.statusText}`);
    }

    const buildData = await buildResponse.json();
    
    console.log(`[BUILD TRIGGERED] ID: ${buildData.id}`);

    // Optional: Send notification to Slack/Discord
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚀 Site rebuild triggered by ${collection} ${action}`,
            attachments: [{
              color: 'good',
              fields: [
                { title: 'Collection', value: collection, short: true },
                { title: 'Action', value: action, short: true },
                { title: 'Key', value: key || 'N/A', short: true },
                { title: 'Build ID', value: buildData.id, short: true }
              ]
            }]
          })
        });
      } catch (notifyError) {
        console.error('[NOTIFICATION ERROR]', notifyError);
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Site rebuild triggered successfully',
        collection,
        action,
        key,
        buildId: buildData.id,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        message: 'Internal server error during rebuild',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// Alternative: Simple build hook trigger for Astro/static sites
exports.simpleRebuild = async (event, context) => {
  try {
    const buildHookUrl = process.env.NETLIFY_BUILD_HOOK;
    
    const response = await fetch(buildHookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trigger_title: 'Content Update',
        clear_cache: true
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        buildId: data.id,
        message: 'Rebuild triggered'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};