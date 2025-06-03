export default async function handler(req, res) {
  // ✅ Allow CORS from anywhere (or restrict to 'https://www.heroic.us')
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🔒 You can also change '*' to 'https://www.heroic.us' for stricter security:
  // res.setHeader('Access-Control-Allow-Origin', 'https://www.heroic.us');

  // 👇 Your existing code below this line
  const { email, tagId } = req.body;

  const apiKey = process.env.ACTIVE_CAMPAIGN_API_KEY;
  const apiBase = process.env.ACTIVE_CAMPAIGN_API_BASE;

  if (!email || !tagId) {
    return res.status(400).json({ success: false, message: 'Missing email or tag' });
  }

  try {
    const contactRes = await fetch(`${apiBase}/api/3/contacts?email=${encodeURIComponent(email)}`, {
      headers: {
        'Api-Token': apiKey
      }
    });

    const contactData = await contactRes.json();
    const contactId = contactData.contacts?.[0]?.id;

    if (!contactId) {
      return res.status(404).json({ success: false, message: 'Contact not found', contactData });
    }
    const tagRes = await fetch(`${apiBase}/api/3/contactTags`, {
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

    if (!tagRes.ok) {
      return res.status(500).json({ success: false, message: 'Failed to apply tag', tagData });
    }

    return res.status(200).json({ success: true, result: tagData });
  } catch (err) {
    console.error('🔥 Server error:', err);
    return res.status(500).json({ success: false, message: 'fetch failed', error: err.message });
  }
}
