import React, { Component } from 'react'
import '../firebase.js'
import FirebaseAuthHelper from './firebaseAuth.js'
import 'firebase/auth'
import Header from './header'

function ErrorAlert(props) {
  const errorText = props.errorText;
  if (errorText.length > 0) {
    return (
      <div className="alert alert-danger" role="alert">
        {errorText}
      </div>
    );
  } else {
    return '';
  }
}

function LoginForm(props) {
  const handleChange = props.handleChange;
  const email = props.email;
  const password = props.password;
  const checkedForAuth = props.checkedForAuth;
  const handleSubmit = props.handleSubmit;
  if (checkedForAuth) {
    return (
      <form onSubmit={handleSubmit} id='loginForm'>

            <div className='form-group'>
                <label>Email address</label>
                <input type='email' className='form-control' name='email' onChange={handleChange} value={email} placeholder='Enter email' />
            </div>

            <div className='form-group'>
                <label>Password</label>
                <input type='password' className='form-control' name='password' onChange={handleChange} value={password} placeholder='Password' />
            </div>

            <button type='submit' className='btn btn-primary'>Submit</button>

        </form>
    );
  } else {
    return (
      <div className="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    );
  }
}

class Login extends Component {
  constructor(props) {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.didAuthenticate = this.didAuthenticate.bind(this);
    this.headerHandler = this.headerHandler.bind(this);
    this.state = {
      email: '',
      password: '',
      error: '',
      checkedForAuth: false
    };
  }
  handleSubmit(e) {
    e.preventDefault();

    FirebaseAuthHelper.authenticate(
      this.state.email,
      this.state.password,
      function(error) {

        if (error) {
          this.setState({
            email: '',
            password: '',
            error: 'Womp womp... Invalid email and password combo.'
          });

          setTimeout(function() {
            this.setState({
              error: ''
            });
          }.bind(this), 3000);

          return;
        }

        this.didAuthenticate();
      }.bind(this)
    );
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  didAuthenticate(e) {
   // this.props.history.push('/links');
  }
  componentDidMount() {

  }
  headerHandler() {
    this.setState({
      checkedForAuth: true
    })
  }
  render() {
    return (
      <div>

        <Header history={this.props.history} handler={this.headerHandler} />

          <div className='container'>

              <div className='row'>

                  <div className='col-sm-12 col-md-6'>

                      <LoginForm handleChange={this.handleChange} handleSubmit={this.handleSubmit} email={this.state.email} password={this.state.password} checkedForAuth={this.state.checkedForAuth} />

                      <ErrorAlert errorText={this.state.error} />

                  </div>

              </div>

          </div>

      </div>
    );
  }
}

export default Login;
