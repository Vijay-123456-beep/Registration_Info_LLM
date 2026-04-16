const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('OK'));
app.listen(5000, () => console.log('Minimal server running on 5000'));
