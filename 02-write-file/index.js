const fs = require('fs');
const path = require('path');
const { stdin, stdout, exit } = process;
const PARTING = 'See you soon! ';

const output = fs.createWriteStream(path.join(__dirname, 'write-file.txt'));

stdout.write('Please enter your message\n(to exit use exit or cmd+C)\n');

stdin.on('data', (data) => {
  let msg = data.toString().trim();
  if (msg !== 'exit') {
    output.write(`${msg.trim()} `);
  } else {
    stdout.write(PARTING);
    exit();
  }
});

process.on('SIGINT', () => {
  stdout.write(PARTING);
  exit();
});
