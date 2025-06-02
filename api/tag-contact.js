export default async function handler(req, res) {
  const { email, tag } = req.body;

  const apiKey = process.env.ACTIVE_CAMPAIGN_API_KEY;
  const apiBase = process.env.ACTIVE_CAMPAIGN_API_BASE;

  if (!email || !tag) {
    return res.status(400).json({ success: false, message: 'Missing email or tag' });
  }

  try {
    // 🔍 Fetch contact
    const contactRes = await fetch(`${apiBase}/api/3/contacts?email=${encodeURIComponent(email)}`, {
      headers: {
        'Api-Token': apiKey
      }
    });

    const contactData = await contactRes.json();

    if (!contactData.contacts?.[0]?.id) {
      return res.status(404).json({ success: false, message: 'Contact not found', contactData });
    }

    const contactId = contactData.contacts[0].id;

    const tagId = process.env[tag.toUpperCase()];
    if (!tagId) {
      return res.status(400).json({ success: false, message: `Tag ID not found for ${tag}` });
    }

    // 🔍 Apply tag
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
