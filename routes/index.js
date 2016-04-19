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
        console.log(buf.toString()); // 接口返回的json string结果
    });
    });
    request.setHeader('Content-Type', 'multipart/form-data; boundary='+ boundary_key);
    var retsult = '';
    retsult += boundary + '\r\n';
    retsult += 'Content-Disposition: form-data; name="user"' + '\r\n\r\n';
    retsult += 'aotu.io' + '\r\n';
    retsult += boundary + '\r\n';
    retsult += 'Content-Disposition: form-data; name="psw"' + '\r\n\r\n';
    retsult += '123456' + '\r\n';
    retsult += boundary + '\r\n';
    retsult += 'Content-Disposition: form-data; name="onefile"; filename="pic.png"' + '\r\n';
    retsult += 'Content-Type: image/png' + '\r\n\r\n';
    request.write(retsult); // 写入文本数据，该方法会自动编码字符为二进制

    var picStream = fs.createReadStream('./public/images/o2logo.png'); // 读取一张图片
    picStream.on('end', function() {
                request.write('\r\n' + end_boundary); // 写入结束符
                request.end();
                res.end('post form data success!');
             })
             .pipe(request, {end: false}); // 写入图片数据request
    
    request.on('error', function(e) {
        console.log('request err: ',e);
    });
});

router.post('/submit', upload.single('onefile'), function(req, res, next) {
    res.json({
        code: 1,
        url: '/'+req.file.path.replace(/\\/g, '/')
    });
});

module.exports = router;
