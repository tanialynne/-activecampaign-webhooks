try {
  console.log("📩 req.body:", req.body);

  let { firstName, lastName, email, phone, withBump } = req.body || {};

  if (!firstName || !email) {
    const rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    console.log("🪵 raw fallback body:", rawBody);

    const parsed = JSON.parse(rawBody);
    ({ firstName, lastName, email, phone, withBump } = parsed);
    console.log("✅ parsed fallback body:", parsed);
  }

  const customer = await stripe.customers.create({
    name: `${firstName} ${lastName}`,
    email,
    phone
  });

  const basePrice = 2700;
  const bumpPrice = 4900;
  const amount = withBump ? basePrice + bumpPrice : basePrice;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customer.id,
    description: withBump ? 'Main + Order Bump' : 'Main Only',
    metadata: { withBump: withBump.toString(), email }
  });

  return res.status(200).json({ clientSecret: paymentIntent.client_secret });

} catch (err) {
  console.error("🔥 Stripe error:", err);
  return res.status(500).json({ error: err.message });
}
