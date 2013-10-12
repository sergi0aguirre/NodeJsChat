
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'NodeJs Chat' })
};


exports.chatroom = function(req, res){
  res.render('chatroom', { title: 'NodeJs Chat' })
};


exports.about = function(req, res){
  res.render('about', { title: 'NodeJs Chat' })
};