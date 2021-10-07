module.exports = {
  createMyMessageBox: function (message, time){
    const myMessageBox =
      '<div class=\"mr-4 d-flex flex-row-reverse\">'
      + '<div class=\"col-5 chatbubble inputbox\">'
      +   '<span class=\"username moon\">You</span>'
      +   '<p>' + message + '</p>'
      +   '<span class=\"mytime moon\">' + time + '</span>'
      + '</div>'
    + '</div>';
    return myMessageBox;
  },

  createTheirMessageBox: function (message, time, username){
    const theirMessageBox =
      '<div class=\"ml-4 d-flex flex-row\">'
      + '<div class=\"col-5 chatbubble inputbox\">'
      +   '<span class=\"username moon\">' + username + '</span>'
      +   '<p>' + message + '</p>'
      +   '<span class=\"theirtime moon\">' + time + '</span>'
      + '</div>'
    + '</div>';
    return theirMessageBox;
  }
}
