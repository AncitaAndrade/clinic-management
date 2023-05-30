const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Define the URLs for clinic data from different providers
const dentalClinicsUrl = 'https://storage.googleapis.com/scratchpay-code-challenge/dental-clinics.json';
const vetClinicsUrl = 'https://storage.googleapis.com/scratchpay-code-challenge/vet-clinics.json';

// Search endpoint
app.get('/clinics', async (req, res) => {
  try {
    const { name, state, availability } = req.query;

    const dentalClinics = await getClinicsFromProvider(dentalClinicsUrl);
    const vetClinics = await getClinicsFromProvider(vetClinicsUrl);

    const mergedClinics = dentalClinics.concat(vetClinics);

    const clinics = mergedClinics.map(clinic => {
      if (clinic.hasOwnProperty('clinicName')) {
        clinic.name = clinic.clinicName;
        delete clinic.clinicName;
      }
      if(clinic.hasOwnProperty('opening')){
        clinic.availability = clinic.opening;
        delete clinic.opening;
      }
      if(clinic.hasOwnProperty('stateCode')){
        clinic.stateName = convertStateCodeToName(clinic.stateCode);
        delete clinic.stateCode;
      }
      return clinic;
    });

    let filteredClinics = clinics;

    if (name) {
      filteredClinics = clinics.filter(clinic => clinic.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (state) {
      var stateName = state;
      if(stateName.length == 2)
        stateName = convertStateCodeToName(stateName.toUpperCase())
      filteredClinics = clinics.filter(clinic => clinic.stateName.toLowerCase() === stateName.toLowerCase());
    }

    if (availability) {
      filteredClinics = clinics.filter(clinic => {
        const { from, to } = clinic.availability;
        return availability >= from && availability <= to;
      });
    }

    res.json(filteredClinics);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function convertStateCodeToName(stateCode) {
  const stateMapping = {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming'
  };

  return stateMapping[stateCode] || stateCode;
}


// Function to retrieve clinics from a provider
async function getClinicsFromProvider(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error retrieving clinics:', error);
    return [];
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
