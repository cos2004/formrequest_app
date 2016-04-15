var express = require('express');
var multer = require('multer');
var mime = require('mime');
var path = require('path');
var http = require('http');

var router = express.Router();
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype));
  }
})
var upload = multer({ storage: storage});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/formdata', function(req, res, next) {
  var boundary_key = 'aotu_lab';
  var boundary = '--' + boundary_key;
  var end_boundary = boundary + '--';
  var request = http.request({
    host: '127.0.0.1',
    port: 3000,
    path: '/submit',
    method: 'post'
  }, function(req) {
    req.on('data', function(buf) {
      console.log('response from node:');
      console.log(buf.toString());
    });
  });
  var retsult = '';
  retsult += boundary;
  retsult += '\r\n';
  retsult += 'Content-Disposition: form-data; name="user"';
  retsult += '\r\n';
  retsult += '\r\n';
  retsult += 'aotu_lab';
  retsult += '\r\n';

  retsult += boundary;
  retsult += '\r\n';
  retsult += 'Content-Disposition: form-data; name="psw"';
  retsult += '\r\n';
  retsult += '\r\n';
  retsult += '123456';
  retsult += '\r\n';

  retsult += end_boundary;
  console.log(retsult);
  console.log('====');
  request.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary_key);
  // request.setHeader('Content-Length', Buffer.byteLength(retsult));
  request.write(retsult);
  console.log(request);
  request.on('error', function(e) {
    console.log('err===',e);
  });

  request.end();

  res.end('post form data success!');
});

router.post('/submit', upload.single(), function(req, res, next) {
  console.log(req.params,req.body);
  res.json({
    code: 1
  });
});
// router.post('/submit', upload.single('doc'), function(req, res, next) {
//   console.log(req.file);
//   console.log(req.params,req.body, path.normalize(req.file.path));
//   res.json({
//     code: 1,
//     url: '/'+req.file.path.replace(/\\/g, '/')
//   });
// });


module.exports = router;
