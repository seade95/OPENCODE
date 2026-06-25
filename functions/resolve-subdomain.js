// ===== Appwrite Function: resolve-subdomain =====
// Deploy this function to your Appwrite project.
// It receives a subdomain slug and returns the matching school document.
//
// Trigger: Any HTTP request or SDK execution call.
// Runtime: Node.js 18+
//
// Usage:
//   const fn = new Appwrite.Functions(client);
//   fn.createExecution('resolve-subdomain', JSON.stringify({ subdomain: 'my-school' }), false);
// ============================================================================

const sdk = require('node-appwrite');

module.exports = async function (req, res) {
  // Parse input
  let subdomain = '';
  try {
    const body = JSON.parse(req.payload || '{}');
    subdomain = (body.subdomain || '').toLowerCase().trim();
  } catch (e) {
    return res.json({ error: 'Invalid payload', success: false }, 400);
  }

  if (!subdomain) {
    return res.json({ error: 'Missing subdomain', success: false }, 400);
  }

  // Reserved slugs — reject immediately
  const RESERVED = [
    'www', 'app', 'api', 'admin', 'mail', 'smtp', 'pop3', 'webmail',
    'cpanel', 'whm', 'ftp', 'ssh', 'mysql', 'test', 'dev', 'staging',
    'demo', 'beta', 'help', 'support', 'docs', 'wiki', 'blog', 'forum',
    'community', 'status', 'cdn', 'static', 'assets', 'media', 'files',
    'img', 'css', 'js', 'download', 'uploads', 'store', 'shop', 'billing',
    'pay', 'secure', 'login', 'signup', 'register', 'auth', 'oauth', 'saml',
    'ldap', 'portal', 'dashboard', 'manage', 'system', 'server', 'host',
    'hosting', 'cloud', 'edu', 'education', 'school', 'schools', 'my',
    'your', 'the', '__superadmin__',
  ];

  if (RESERVED.indexOf(subdomain) !== -1) {
    return res.json({ matched: false, reserved: true, subdomain: subdomain });
  }

  try {
    // Initialize Appwrite SDK
    const client = new sdk.Client()
      .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
      .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
      .setKey(req.variables['APPWRITE_FUNCTION_API_KEY']);

    const databases = new sdk.Databases(client);
    const databaseId = req.variables['APPWRITE_DATABASE_ID'];
    const collectionId = req.variables['APPWRITE_SCHOOLS_COLLECTION_ID'];

    if (!databaseId || !collectionId) {
      return res.json({ error: 'Missing database/collection config', success: false }, 500);
    }

    // Query schools collection by slug
    const result = await databases.listDocuments(
      databaseId,
      collectionId,
      [
        sdk.Query.equal('slug', subdomain),
        sdk.Query.equal('status', 'active'),
      ],
      1 // limit
    );

    if (result.documents && result.documents.length > 0) {
      const school = result.documents[0];
      return res.json({
        matched: true,
        school: {
          id: school.slug,
          slug: school.slug,
          name: school.name || '',
          email: school.email || '',
          phone: school.phone || '',
          address: school.address || '',
          logo: school.logo || '',
          motto: school.motto || '',
          tier: school.tier || 'full_k12',
          adminName: school.adminName || '',
          adminEmail: school.adminEmail || '',
          status: school.status || 'active',
          plan: school.plan || 'free',
          premiumOverride: !!school.premiumOverride,
          createdAt: school.createdAt || '',
        },
        success: true,
      });
    }

    return res.json({ matched: false, subdomain: subdomain });
  } catch (e) {
    return res.json({ error: e.message || 'Internal error', success: false }, 500);
  }
};
