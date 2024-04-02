const router = require("express").Router();
const Room = require('../models/Room.model.js')
const multer = require("multer");
const upload = multer({ dest: './public/uploads' });

const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

router.get('/rooms', (req, res, next) => {
  Room.find()
    .populate('owner')
    .then(rooms => {
      let allRooms = []

      if (req.session.currentUser) {
        rooms.forEach(room => {
          const newRoom = room._doc
          if (room.owner.id = req.session.currentUser._id) newRoom.user = true;
          allRooms.push(newRoom);
        })
      } else {
        allRooms = [...rooms]
      }

      res.render('room/rooms', { allRooms });
    })
    .catch(error => console.log(error));
});

router.get('/new-room', isLoggedIn, (req, res, next) => {
  res.render('room/new-room');
});

router.get('/edit-room/:id', isLoggedIn, (req, res, next) => {
  const id = req.params.id;
  Room.findById({ _id: id })
    .then(room => res.render('room/edit-room', { room }))
    .catch(error => console.log(error));
})

router.get('/delete-room/:id', isLoggedIn, (req, res, next) => {
  const id = req.params.id

  Room.findByIdAndDelete({ _id: id })
    .then(() => res.redirect('/rooms'))
    .catch(error => console.log(error));
});

router.post('/edit-room/:id', isLoggedIn, upload.single('image'), (req, res, next) => {
  const id = req.params.id;
  const { name, description } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  Room.updateOne({ _id: id }, { name, description, imageUrl })
    .then(room => res.redirect('/rooms'))
    .catch(error => console.log(error));
})

router.post('/new-room', isLoggedIn, upload.single('image'), (req, res, next) => {
  const { name, description } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;
  const owner = req.session.currentUser._id;

  if (!name) {
    res.render('room/new-room', {
      errorMessage: 'Name field cannot without text'
    });
    return;
  }

  const room = new Room({ name, description, imageUrl, owner });

  room.save()
    .then(() => res.redirect('/rooms'))
    .catch(error => console.log(error));
});

module.exports = router;