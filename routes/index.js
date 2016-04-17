var express = require('express');
var multer = require('multer');
var mime = require('mime');
var path = require('path');
var http = require('http');
var fs = require('fs');

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
  request.setHeader('Content-Type', 'multipart/form-data; boundary='+ boundary_key);
  var retsult = '';
  retsult += boundary;
  retsult += '\r\n';
  retsult += 'Content-Disposition: form-data; name="user"';
  retsult += '\r\n';
  retsult += '\r\n';
  retsult += 'aotu.io';
  retsult += '\r\n';

  retsult += boundary;
  retsult += '\r\n';
  retsult += 'Content-Disposition: form-data; name="psw"';
  retsult += '\r\n';
  retsult += '\r\n';
  retsult += '123456';
  retsult += '\r\n';
  
  retsult += boundary;
  retsult += '\r\n';
  retsult += 'Content-Disposition: form-data; name="onefile"; filename="pic.png"';
  retsult += '\r\n';
  retsult += 'Content-Type: image/png';
  retsult += '\r\n';
  retsult += '\r\n';
  request.write(retsult); // 写入文本数据

  var picStream = fs.createReadStream('./public/images/o2logo.png');
  picStream.on('end', function() {
              console.log('end---------: ');
              request.write('\r\n');
              request.write(end_boundary);
              request.end();
              console.log(request);
              res.end('post form data success!');
           })
           .pipe(request, {end: false}); // 写入图片数据
  
  request.on('error', function(e) {
    console.log('request err: ',e);
  });

});

// router.post('/submit', upload.single(), function(req, res, next) {
//   console.log(req.params,req.body);
//   res.json({
//     code: 1
//   });
// });
router.post('/submit', upload.single('onefile'), function(req, res, next) {
  res.json({
    code: 1,
    url: '/'+req.file.path.replace(/\\/g, '/')
  });
});


module.exports = router;
