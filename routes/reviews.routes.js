const router = require("express").Router();
const Review = require('../models/Review.model.js');
const Room = require('../models/Room.model.js');
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

router.get('/reviews/:id', (req, res, next) => {
  const id = req.params.id;

  Room.findById({ _id: id })
    .populate('reviews')
    .then(room => {
      res.render('reviews/reviews', { reviews: room.reviews, roomID: room._id });
    })
    .catch(error => console.log(error))
})

router.get('/add-review/:id', isLoggedIn, (req, res, next) => {
  const id = req.params.id
  Room.findById({ _id: id })
    .then(room => {
      const ownerId = room.owner._id
      if (ownerId.toString() !== req.session.currentUser._id) {
        res.render('reviews/add-reviews', { id })
      } else {
        res.redirect(`/reviews/${id}`)
      }
    })
})

router.post('/add-review/:id', isLoggedIn, (req, res, next) => {
  const roomID = req.params.id
  const user = req.session.currentUser._id;
  const fullname = req.session.currentUser.fullname;
  const comment = req.body.comment;

  if (!comment) {
    res.render('reviews/add-review', {
      errorMessage: 'comment field cannot without text'
    });
    return;
  }

  const review = new Review({ user, fullname, comment });

  review.save()
    .then(review => {
      Room.updateOne({ _id: roomID }, { $push: { reviews: review } })
        .then(() => res.redirect(`/reviews/${roomID}`))
        .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
})

module.exports = router;