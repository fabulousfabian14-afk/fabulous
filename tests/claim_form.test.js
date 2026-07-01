const assert = require('assert');
const fs = require('fs');
const path = require('path');

const viewPath = path.join(__dirname, '..', 'views', 'available_items.ejs');
const view = fs.readFileSync(viewPath, 'utf8');

assert.ok(view.includes('name="claim_reason"'), 'claim form should include a claim reason field');
assert.ok(view.includes('name="proof_of_ownership"'), 'claim form should include a proof of ownership field');

console.log('Claim form regression test passed');
