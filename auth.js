module.exports = {
  login(email, pass, cb) {
    cb = arguments[arguments.length - 1]
    if (localStorage.token) {
      if (cb) cb(true)
      this.onChange(true)
      return
    }
    pretendRequest(email, pass, (res) => {
      if (res.authenticated) {
        localStorage.token = res.token
        localStorage.currentUser = res._email
        if (cb) cb(true)
        this.onChange(true)
      } else {
        if (cb) cb(false)
        this.onChange(false)
      }
    })
  },

  getToken() {
    return localStorage.token
  },

  logout(cb) {
    delete localStorage.token
    delete localStorage.currentUser
    if (cb) cb()
    this.onChange(false)
  },

  loggedIn() {
    return !!localStorage.token
  },

  onChange() {}
}

function pretendRequest(email, pass, cb) {
  setTimeout(() => {
    var abc = localStorage.getItem('credentials');
    // debugger;
    if(abc === null) {
      cb({ authenticated: false })
      return;
    }
    else if (abc) {
      abc = JSON.parse(abc);
      var authenticated = false;
      for (var i = abc.length - 1; i >= 0; i--) {
        if(abc[i].email === email && abc[i].password === pass) {
          cb({
            authenticated: true,
            token: Math.random().toString(36).substring(7),
            _email:email
          })
          authenticated = true;
        }
      };
      if(!authenticated) {
          // debugger;
        cb({ authenticated: false })
      }
      console.log('loggedin');
    }
    else {
      cb({ authenticated: false })
      return;
    }
  }, 0)
}