const startApp = require("./app");

const PORT = 4086;

startApp().then((app) => {
  app.listen(PORT, () => {
    console.log(`Give India App listening  on the port ${PORT}`);
  });
});
