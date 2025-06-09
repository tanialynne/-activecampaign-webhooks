$(document).ready(function () {
  const options = [
    {
      label: "Health",
      className: "Health 101",
      tagId: 1298,
      topic: "energy",
      desc: "We took the best books on health and energy and distilled them into a single 1-hour master class. It’s been watched +317,000 times.",
     url: "https://cta-service-cms2.hubspot.com/web-interactives/public/v1/track/redirect?encryptedPayload=AVxigLKqtyonNNNjrSi9%2BUuC%2FDk%2FNGrzLTq2SE5F6E5blsQ548sqfinr6O6n629opZmuyntnCtXJBfcdvQaFeeNty8WS9%2BA3jATUIZLfqCvwzobJjtMWtyuI6ktiy%2Fd5MygWgRqtebDuWb23L8kEfYqRXhw3vRxvZ5LPVcThflNjkhv1tQ4rHXLEJmZtI2AEydXQiDH5KdoC07jo1%2FsxXpo1V8U47rL0tAUh3F5YN29LsSs%2FNso54JrORfeH%2B3pNgaOckgsXdTloR%2BKLUI16hni6qcdTvda6VgiKpWXJImRhjaobMpuCftJM6WjAKufp4DXaHknOjuydOFHaQLPB3y6vA3NFZTsjjsvpaA%3D%3D&webInteractiveContentId=190725895186&portalId=45764384"
    },
    {
      label: "Productivity",
      className: "Productivity 101",
      topic: "productivity",
      tagId: 1299,
      desc: "We took the best books on productivity and focus and distilled them into a single 1-hour master class. It’s been watched +317,000 times.",
      url: "https://heroic.us/101/productivity/free/a97ae067-e54f-4b7c-8928-d0ee1037a4d3"
    },
    {
      label: "Purpose",
      className: "Purpose 101",
      topic: "purpose",
      tagId: 1300,
      desc: "We took the best books on purpose and meaning and distilled them into a single 1-hour master class. It’s been watched +317,000 times.",
      url: "https://heroic.us/101/purpose/free/9bbee1fa-3c3b-40a8-83b3-9a3de5e3c8d2"
    },
    {
      label: "Leadership",
      className: "Leadership 101",
      topic: "lead yourself first",
      tagId: 1301,
      desc: "We took the best books on leadership and distilled them into a single 1-hour master class. It’s been watched +317,000 times.",
      url: "https://heroic.us/101/lead-yourself-first/free/db272095-b70d-4d91-8c43-60b41db49592"
    },
    {
      label: "Relationships",
      className: "Love 101",
      topic: "love",
      tagId: 1302,
      desc: "We took the best books on relationships and love and distilled them into a single 1-hour master class. It’s been watched +317,000 times.",
      url: "https://heroic.us/101/love/free/09cab238-5a37-4695-845a-2118ee57df8d"
    },
    {
      label: "Habits",
      className: "Habits 101",
      topic: "habits",
      tagId: 1303,
      desc: "We took the best books on habits and behavior change and distilled them into a single 1-hour master class. It’s been watched +317,000 times.",
      url: "https://heroic.us/101/habits/free/698b90d1-5eaf-4c31-bc0d-04ae543b5e61"
    }
  ];
  
  function submitHubspotFormViaFetch(email, className) {
  const portalId = "45764384";
  const formId = "a9a51e30-8f40-4656-80ef-ec612d149092";

  const payload = {
    fields: [
      {
        name: "0-1/email",
        value: email
      },
      {
        name: "0-1/classname", 
        value: className
      }
    ]
  };
    
    console.log(payload);

  fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    console.log("✅ HubSpot form submitted:", data);
  })
  .catch(err => {
    console.error("❌ HubSpot form submission failed:", err);
  });
}

  
 const optionsContainer = $('#options');
  options.forEach(opt => {
  const btn = $('<button>')
    .addClass('option-div')
    .text(opt.label)
    .on('click', function () {
      // Track the click event with HubSpot
      if (window._hsq) {
        _hsq.push([
          "trackEvent",
          {
            id: `topic_click_${opt.topic}`,  // Unique identifier
            value: opt.className             // Descriptive value
          }
        ]);
      }
      
      //Get email from URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");
      
      submitHubspotFormViaFetch(email, opt.className);

  // AC Tagging via Vercel Webhook
  if (email && opt.tagId) {
    fetch("https://activecampaign-webhooks.vercel.app/api/tag-contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        tag: opt.tagId
      })
    })
    .then(res => res.json())
    .then(data => console.log("✅ AC tag added", data))
    .catch(err => console.error("❌ AC tagging error", err));
  } else {
    console.warn("❗ No email found in query string.");
  }
      
      // update UI and link
      $('#display-container').addClass('hide');
      $('#user-result').html(
        `<span>Awesome! We think you might enjoy <strong>${opt.className}</strong></span><br><br>${opt.desc}<br><br>(Yours for free today. No opt-in. No Sign-up. No nothing. Pure wisdom.)`
      );
      $('#result-link').attr('href', opt.url).text(`Watch ${opt.className}`);
      $('.result-container').removeClass('hide');    
      
    });
  optionsContainer.append(btn);
});

});
