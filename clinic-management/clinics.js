const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 8080;

function isNullOrUndefined(input){
    if(input== null || input == undefined)
        return true;
    return false;
}

// Search endpoint
app.get('/clinics', async (req, res) => {
  try {
    const { name, state, availability } = req.query;

    const dentalClinics = await getClinicsFromProvider('https://storage.googleapis.com/scratchpay-code-challenge/dental-clinics.json');
    const vetClinics = await getClinicsFromProvider('https://storage.googleapis.com/scratchpay-code-challenge/vet-clinics.json');

    let clinics = dentalClinics.concat(vetClinics);
    console.log(name)
    if (name) {
      clinics = clinics.filter(clinic => clinic.clinicName.toLowerCase().includes(name.toLowerCase()));
    }
    console.log(state)
    if (state) {
      clinics = clinics.filter(clinic => clinic.stateCode.toLowerCase() === state.toLowerCase());
    }

    if (availability) {
      clinics = clinics.filter(clinic => {
        const { from, to } = clinic.opening;
        return availability >= from && availability <= to;
      });
    }

    res.json(clinics);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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
