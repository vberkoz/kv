module.exports = {
  setRandomNumber,
  setRandomString,
  setTimestamp,
};

function setRandomNumber(context, events, done) {
  context.vars.randomNum = Math.floor(Math.random() * 10000);
  return done();
}

function setRandomString(context, events, done) {
  context.vars.randomStr = Math.random().toString(36).substring(7);
  return done();
}

function setTimestamp(context, events, done) {
  context.vars.timestamp = new Date().toISOString();
  return done();
}
