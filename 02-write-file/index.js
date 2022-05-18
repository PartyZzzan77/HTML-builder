const fs = require('fs');
const path = require('path');
const { stdin, stdout, exit } = process;
const PARTING = 'See you soon! ';

const output = fs.createWriteStream(path.join(__dirname, 'write-file.txt'));

stdout.write('Please enter your message\n(to exit use exit or control + C)\n');

stdin.on('data', (data) => {
  let msg = data.toString().trim();
  if (msg.toLowerCase() !== 'exit') {
    output.cork();
    output.write(`${msg.trim()} `);
    output.uncork();
  } else {
    stdout.write(PARTING.trim());
    exit();
  }
});

process.on('SIGINT', () => {
  stdout.write(PARTING.trim());
  exit();
});
