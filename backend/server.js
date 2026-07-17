const app = require('./src/app');
const { PORT } = require('./src/config/env');

app.listen(PORT, () => {
  console.log(`Urban Sips Cafe API running on http://localhost:${PORT}`);
});