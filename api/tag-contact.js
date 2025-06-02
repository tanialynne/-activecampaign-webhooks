export default async function handler(req, res) {
  const { email, tag } = req.body;

  const apiKey = process.env.ACTIVECAMPAIGN_API_KEY;
  const accountDomain = process.env.ACTIVECAMPAIGN_DOMAIN;

  if (!email || !tag) {
    return res.status(400).json({ success: false, message: 'Missing email or tag' });
  }

  try {
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

    const tagId = process.env[tag.toUpperCase()];
    if (!tagId) {
      return res.status(400).json({ success: false, message: 'Tag ID not found for this tag name' });
    }

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
    res.status(500).json({ success: false, message: err.message });
  }
}
