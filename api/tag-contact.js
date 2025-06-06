export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { email, tag } = req.body;

  const apiKey = process.env.ACTIVE_CAMPAIGN_API_KEY;
  const apiBase = process.env.ACTIVE_CAMPAIGN_API_BASE;

  if (!email || !tag) {
    return res.status(400).json({ success: false, message: 'Missing email or tag' });
  }

  try {
    // Step 1: Try to find the contact
    let contactId;
    const contactRes = await fetch(`${apiBase}/api/3/contacts?email=${encodeURIComponent(email)}`, {
      headers: {
        'Api-Token': apiKey
      }
    });

    const contactData = await contactRes.json();

    if (contactData.contacts?.length > 0) {
      contactId = contactData.contacts[0].id;
    } else {
      // Step 2: Create the contact
      const createRes = await fetch(`${apiBase}/api/3/contacts`, {
        method: 'POST',
        headers: {
          'Api-Token': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact: {
            email: email
          }
        })
      });

      const createData = await createRes.json();

      if (!createRes.ok || !createData.contact?.id) {
        return res.status(500).json({ success: false, message: 'Failed to create contact', createData });
      }

      contactId = createData.contact.id;
    }

    // Step 3: Apply the tag
    const tagRes = await fetch(`${apiBase}/api/3/contactTags`, {
      method: 'POST',
      headers: {
        'Api-Token': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contactTag: {
          contact: contactId,
          tag: tag
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
