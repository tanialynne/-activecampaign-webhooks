export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // or 'https://www.heroic.us'
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS) request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, tag } = req.body;

  const apiKey = process.env.ACTIVECAMPAIGN_API_KEY;
  const accountDomain = process.env.ACTIVECAMPAIGN_DOMAIN;

  if (!email || !tag) {
    return res.status(400).json({ success: false, message: 'Missing email or tag' });
  }

  try {
    // Get the contact ID from AC
    const contactRes = await fetch(`https://${accountDomain}/api/3/contacts?email=${encodeURIComponent(email)}`, {
      headers: {
        'Api-Token': apiKey
      }
    });

    const contactData = await contactRes.json();
    const contactId = contactData.contacts?.[0]?.id;

    if (!contactId) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    // Get tag ID from env (must be set manually in your project)
    const tagId = process.env[tag.toUpperCase()];
    if (!tagId) {
      return res.status(400).json({ success: false, message: `Tag ID not found for tag name '${tag}'` });
    }

    // Apply the tag
    const tagRes = await fetch(`https://${accountDomain}/api/3/contactTags`, {
      method: 'POST',
      headers: {
        'Api-Token': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactTag: {
          contact: contactId,
          tag: tagId
        }
      })
    });

    const tagData = await tagRes.json();
    res.status(200).json({ success: true, result: tagData });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
