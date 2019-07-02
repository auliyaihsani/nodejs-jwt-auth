// ========================set up ================
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var app = express();
var router = express.Router();
var cors = require('cors');


var config = require('./app/config');
var User = require('./app/model/user');

var port = 4000;


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

mongoose.connect(config.database, {useNewUrlParser: true, });
app.set('secretKey', config.secret);

app.use(cors());

// =================================Router API=================
router.post('/login', function (req, res) {
   User.findOne({
       email: req.body.email
   }, function (err, user) {

       if (err) throw err;

      if (!user) {
          res.json({ success: false, message: 'User tidak ada di database' });
      }else {
        //   harusnya passwordnya hash
          if (user.password != req.body.password) {
              res.json({ success: false, message: 'password salah !'});
          }else {
            //   buat token
            var token = jwt.sign(user.toJSON(), app.get('secretKey'),{
                
                expiresIn: "24h"
            });
            // ngirim balik token  
            res.json({
                success: 'true',
                message: 'token berhasil didapatkan!',
                token: token
            });
          }
      }     
       
   });
   
});


router.get('/', function (req, res) {
    res.send('ini route home');
});

// protextsi router
router.use(function (req, res, next) {
        //ambil token: req.body.token || req.query.token ||
        var token = req.headers['authorization'];

        if (token) {
            jwt.verify(token, app.get('secretKey'), function (err, decoded){
               if(err)
               return res.json({  success:'false', message:'problem dengan token' });
               else {
                    req.decoded = decoded;
                    next();
               }
            });


        }else{
            return res.status(403).send({
                success: 'false',
                message: 'token tidak tersedia'
            });
        }

})


router.get('/users', function (req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    })
    
})

// prefix
app.use('/api', router);
app.listen(4000);