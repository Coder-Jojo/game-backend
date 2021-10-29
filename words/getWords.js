const one = require("./100.js");
const two = require("./200.js");
const three = require("./300.js");
const four = require("./400.js");

const getWords = () => {
  const words = [];
  const max = 100000;
  let index;
  for (let i = 0; i < 6; i++) {
    index = Math.floor(Math.random() * max) % one.length;
    words.push({
      word: one[index],
      size: one[index].length,
      difficulty: 100,
    });
    one.splice(index, 1);
  }

  for (let i = 0; i < 6; i++) {
    index = Math.floor(Math.random() * max) % two.length;
    words.push({
      word: two[index],
      size: two[index].length,
      difficulty: 200,
    });
    two.splice(index, 1);
  }

  for (let i = 0; i < 6; i++) {
    index = Math.floor(Math.random() * max) % three.length;
    words.push({
      word: three[index],
      size: three[index].length,
      difficulty: 300,
    });
    three.splice(index, 1);
  }

  for (let i = 0; i < 6; i++) {
    index = Math.floor(Math.random() * max) % four.length;
    words.push({
      word: four[index],
      size: four[index].length,
      difficulty: 400,
    });
    four.splice(index, 1);
  }

  return words;
};

module.exports = getWords;
