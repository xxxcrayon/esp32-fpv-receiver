import test from 'node:test';
import assert from 'node:assert/strict';
import {DiagnosticReader,parseDiagnosticLine} from '../web/diagnostics.js';
test('accepts actual upstream diagnostic formats, not missing or invented values',()=>{
 assert.deepEqual(parseDiagnosticLine(' Tuned Frequency:            5800.050 MHz (Offset: +50 kHz)'),{frequency:5800050000});
 assert.deepEqual(parseDiagnosticLine(' Receiver Channel:           R4 (5769 MHz)'),{channel:'R4'});
 assert.deepEqual(parseDiagnosticLine(' RF Bandwidth:               mode=AUTO active=BW40'),{bandwidth:'40 MHz'});
 assert.deepEqual(parseDiagnosticLine('noise 5800 MHz'),{});
 assert.deepEqual(parseDiagnosticLine(' Tuned Frequency: NA'),{});
});
test('buffers split serial chunks and resets incomplete prior-session output',()=>{
 const output=[]; const reader=new DiagnosticReader(x=>output.push(x));
 reader.feed(' Receiver Chan'); assert.equal(output.length,0);
 reader.feed('nel: R4 (5769 MHz)\r\n'); assert.deepEqual(output,[{channel:'R4'}]);
 reader.feed(' Tuned Frequency: 5800.'); reader.reset();reader.feed('000 MHz (Offset: 0 kHz)\n');assert.equal(output.length,1);
});
