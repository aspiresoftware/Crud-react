/**
 * @jsx React.DOM
 */

'use strict';
import React from 'react';
import { render } from 'react-dom';
var  ReactDom =  require('react-dom');
// First we import some components...
import { Router, Route, Link, History, IndexRoute} from 'react-router';
import { createHistory, useBasename } from 'history';
const RaisedButton = require('material-ui/lib/raised-button');
import auth from './auth';
import { AppBar, TextField, CardActions, Card, CardHeader, FlatButton, Dialog, CardTitle, Paper  } from 'material-ui';

const NoElement = React.createClass({
  render() {
    return null;
  }
});
const Form = React.createClass({
  mixins: [ History ],
  getInitialState() {
	  return {
		  username:'',
		  password:'',
		  city:'',
		  state:'',
		  errorText:{uname:'',pwd:'',city:'',errorText:''},
      standardActions:[
  { text: 'Ok',  ref: 'Ok',onClick:this.dismissDialog }
]
	  };
  },
  handleSubmit(event) {
    event.preventDefault();
    var registerUsers = localStorage.getItem('registerUsers');
    var duplicateAccount = false;
    if (registerUsers !== null) {
      registerUsers = JSON.parse(registerUsers);
      if(registerUsers[this.refs.email.getValue()]){
        duplicateAccount = true;
        this.refs.dialog.show();
        return;
      }
          } 
    if(!duplicateAccount){
      this.setCredentials();
      this.history.replaceState(null, '/');
    }

  },
  setCredentials() {
    var credentials = localStorage.getItem('credentials'),users = {};
    users.email = this.refs.email.getValue();
    users.password = this.refs.pwd.getValue();
    if(credentials === null) {
      credentials = [];
      credentials.push(users);
    } else {
      credentials = JSON.parse(credentials);
      credentials.push(users);
    }
    localStorage.setItem('credentials',JSON.stringify(credentials));
    this.setRegistration(users.email);
  },
  setRegistration(email) {
    var registerUsers = localStorage.getItem('registerUsers'),users = {};

    if(registerUsers === null) {
      registerUsers = {};
      registerUsers.email= this.refs.email.getValue();
      registerUsers.username= this.refs.uname.getValue();
      registerUsers.password= this.refs.pwd.getValue();
      registerUsers.city = this.refs.city.getValue();
      users[email] = registerUsers;
    } else {
      users = JSON.parse(registerUsers);
      users[email] = {};
      users[email].email= this.refs.email.getValue();
      users[email].username= this.refs.uname.getValue();
      users[email].password= this.refs.pwd.getValue();
      users[email].city = this.refs.city.getValue();
    }
    localStorage.setItem('registerUsers',JSON.stringify(users));
  },
  showDialog() {
    this.refs.dialog.show();
  },
  dismissDialog() {
    this.refs.dialog.dismiss();
  },
  render() {
    return 	(<Card>
      <Dialog
  title='Account with given emailId is already created, please use different email address'
  actions={this.state.standardActions}
  ref="dialog"
  actionFocus="No"/>
      <form onAction='#' onSubmit={this.handleSubmit}>

	<TextField type="text" ref="uname" placeholder="UserName" required/><br/>
  <TextField  type="password" ref="pwd" placeholder="password" required/><br/>
  <TextField  ref="city" placeholder="City" required /><br/>
  <TextField type="email" ref="email" placeholder="Email Id" required/><br/>
  <FlatButton label="Submit" secondary={true} type="submit"/></form></Card>)
  }
});

// Then we delete a bunch of code from App and
// add some <Link> elements...
const App = React.createClass({
mixins: [ History ],
    getInitialState() {
    return {
      loggedIn: auth.loggedIn(),
      error: false,
      register:true
    }
  },

  updateAuth(loggedIn) {
    this.setState({
      loggedIn: loggedIn
    })
  },

  componentWillMount() {
    auth.onChange = this.updateAuth
    auth.login()
  },


  handleSubmit(event) {
    event.preventDefault();
    // debugger;
    const email = this.refs.email.getValue()
    const pass = this.refs.password.getValue()

    auth.login(email, pass, (loggedIn) => {
      if (!loggedIn)
        return this.setState({ error: true })

      const { location } = this.props
      this.setState({ error: false })
      if (location.state && location.state.nextPathname) {
        this.history.replaceState(null, location.state.nextPathname)
      } else {
        this.history.replaceState(null, '/about')
      }
    })
  },
  render() {
    var path;
    let unlisten = this.history.listen(function (location) {
  path = location ?location.pathname:'';
})

    console.log(this.state.loggedIn || !location.hash.match(/(register)/));
    // debugger;
    return (
      <div>
<AppBar
  title="CRUD Application using React And React-Router"
  iconElementRight={this.state.loggedIn?(<Link to="/logout"><FlatButton label="Logout" /></Link>):<NoElement />} />
  {(this.state.loggedIn || location.hash.match(/(register)/))?(this.props.children):(<Card>
  <CardTitle
    title="Login"/>
    <CardActions>
    <form onSubmit={this.handleSubmit}>
    <label style={{'minWidth':80,'display':'inline-block'}}>Email</label>
    <TextField required="true" type="email" ref="email"
    hintText="Email"/><br/>
    <label style={{'minWidth':80,'display':'inline-block'}}>Password</label>
    <TextField type="password" required="true" ref="password"
    hintText="Password"/><br/>
    <FlatButton label="Submit" type="submit" primary={true}/>
    <Link style={{'textDecoration':'none','color':'rgb(0, 188, 212)'}} to="/register">
    <FlatButton label="Register" secondary={true} />
    </Link>
    </form>
    </CardActions>
  {this.state.error && (<p>You have entered invalid credentials</p>)}
    </Card>)}
  
      </div>
    )
  }

})


const Logout = React.createClass({
  componentDidMount() {
    auth.logout()
  },

  render() {
    return <p>You are now logged out</p>
  }
})
function requireAuth(nextState, replaceState) {
  if (!auth.loggedIn())
    replaceState({ nextPathname: nextState.location.pathname }, '/')
}
function loginRedirect(nextState, replaceState) {
  if (auth.loggedIn())
    replaceState({ nextPathname: nextState.location.pathname }, '/about')
}

const Register = React.createClass({
  render() {
    return <Form/>
  }
})
const About = React.createClass({
  render() {
    return <div>
<Card>
<Link style={{'textDecoration':'none','color':'rgb(0, 188, 212)'}} to="/edit"><FlatButton secondary={true} label="Edit Detail"/></Link>
<br/>
<br/>
<Link style={{'textDecoration':'none','color':'rgb(0, 188, 212)'}} to="/delete"><FlatButton primary={true} label="Delete Account"/></Link>
</Card>
</div>
  }
})
const Edit = React.createClass({
  mixins: [ History ],
  getInitialState() {
    var email = localStorage.getItem('currentUser');
    var users = JSON.parse(localStorage.getItem('registerUsers'));
    return {
      username:users[email].username,
      password:users[email].password,
      email:users[email].email,
      city:users[email].city,
      standardActions:[{ text: 'Ok',  ref: 'Ok',onClick:this.dismissDialog }]
    }
  },
  dismissDialog() {
    this.refs.dialog.dismiss();
    this.history.replaceState(null, '/about')
  },
  updateProfile(event) {
    event.preventDefault();
    var users = JSON.parse(localStorage.getItem('credentials'));
    for (var i = users.length - 1; i >= 0; i--) {
      if(users[i].email === this.state.email) {
        users[i].password = this.refs.password.getValue()
      }
    };
    localStorage.setItem('credentials',JSON.stringify(users));
    var users = JSON.parse(localStorage.getItem('registerUsers'));
    users[this.state.email].username = this.refs.username.getValue();
    users[this.state.email].password = this.refs.password.getValue();
    users[this.state.email].city = this.refs.city.getValue();
    localStorage.setItem('registerUsers',JSON.stringify(users))
    // alert('sucessfully updated contact');
    this.refs.dialog.show();
    // this.history.replaceState(null, '/about')
  },
  render() {
    return <div>
      <Dialog
  title="sucessfully updated contact"
  actions={this.state.standardActions}
  ref="dialog"
  actionFocus="No"
  modal={this.state.modal}>
  
</Dialog>
              <h3>Edit User</h3><br/>
              <form>
              <label style={{'minWidth':80,'display':'inline-block'}}>Username</label><TextField required="true" ref="username" defaultValue={this.state.username}/><br/>
              <label style={{'minWidth':80,'display':'inline-block'}}>Password</label><TextField required="true" ref="password" type="password" defaultValue={this.state.password}/><br/>
              <label style={{'minWidth':80,'display':'inline-block'}}>Email</label><TextField type="email" disabled="true" required="true" defaultValue={this.state.email}/><br/>
              <label style={{'minWidth':80,'display':'inline-block'}}>City</label><TextField  required ref="city" defaultValue={this.state.city}/><br/>
              <FlatButton label="Update" secondary={true} onClick={this.updateProfile}/>
              </form>
            </div>
  }
})
const Delete = React.createClass({
  mixins: [ History ],
  getInitialState() {
    return {
      modal:false
    }
  },
  showDialog() {
    this.refs.dialog.show();
  },
  dismissDialog() {
    this.refs.dialog.dismiss();
  },
  deleteAccont() {
    this.refs.dialog.dismiss();
    this.deleteDetail();
  },
  render() {
    let standardActions = [
  { text: 'No' ,onClick:this.dismissDialog, ref:'No'},
  { text: 'Yes',  ref: 'Yes',onClick:this.deleteAccont }
];
    return <h3>

    <Dialog
  title="Are you sure want to delete account?"
  actions={standardActions}
  ref="dialog"
  actionFocus="No"
  modal={this.state.modal}>
  
</Dialog>
              <FlatButton label="Delete my account" onClick={this.showDialog} primary={true}/>
            </h3>
  },
  deleteDetail() {
    // if(confirm('Are you sure want to delete account?')){
      console.log('delete account');
      var email = localStorage.getItem('currentUser');
      var users = JSON.parse(localStorage.getItem('credentials'));
      for (var i = users.length - 1; i >= 0; i--) {
        if(users[i].email === email) {
            users.splice(i,1);
            users = users;
            localStorage.setItem('credentials',JSON.stringify(users));
            break;
        }
      };
      users = JSON.parse(localStorage.getItem('registerUsers'));
      delete users[email]
      localStorage.setItem('registerUsers',JSON.stringify(users));
      delete localStorage.currentUser;
      delete localStorage.token;
      auth.logout();
      this.history.replaceState(null, '/')
    // }
  }
})

render((
  <Router>
    <Route path="/" component={App} >
      <Route path="logout" component={Logout} />
      <Route path="about" component={About} onEnter={requireAuth}/>
      <Route path="edit" component={Edit} onEnter={requireAuth}/>
      <Route path="delete" component={Delete} onEnter={requireAuth}/>
      <Route path="register" component={Register} onEnter={loginRedirect}/>
    </Route>
  </Router>
), document.getElementById('App'))
