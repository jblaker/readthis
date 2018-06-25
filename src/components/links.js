import React, { Component } from 'react';
import firebase from '../firebase.js';
import $ from 'jquery';

const LinkImage = function(item) {
  //console.log(item);
  if (item && item.image) {
    return { backgroundImage: 'url(' + item.image + ')' };
  }
  return { backgroundImage: 'url(./images/fallbackImage.jpg)' };
};

function LinkTitle(props) {
  const unread = props.unread;
  const title = props.title;
  if (unread) {
    return (
      <h4>
        {title} <span className="badge badge-secondary">New</span>
      </h4>
    );
  } else {
    return <h4>{title}</h4>;
  }
}

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

function SuccessAlert(props) {
  const successText = props.successText;
  if (successText.length > 0) {
    return (
      <div className="alert alert-info" role="alert">
        {successText}
      </div>
    );
  } else {
    return '';
  }
}

function UserLinks(props) {
  const links = props.links;
  const user = props.user;
  const openLink = props.openLink;
  const removeItem = props.removeItem;

  if (links.length === 0) {
    return <h3>You're all caught up!</h3>;
  } else {
    return (
      <div>
        <h3>
          Have You Read This Yet?{' '}
          <span className="badge badge-light">{links.length}</span>
        </h3>

        <div className="link-list-container container">
          {links.map(item => {
            return (
              <div className="link row" key={item.id}>
                <div className="image col-md-2" style={LinkImage(item)} />

                <div
                  className="content col-md-9 col-sm-12"
                  onClick={() => openLink(item, user)}
                >
                  <LinkTitle unread={item.unread} title={item.title} />
                  <p>{item.url}</p>
                </div>
                <div
                  className="delete col-md-1 col-sm-12"
                  onClick={() => removeItem(user + '/' + item.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class Links extends Component {
  constructor(props) {
    super();
    this.state = {
      user: props.match.params.user,
      newLink: '',
      sendToUsername: '',
      links: [],
      error: '',
      success: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  handleSubmit(e) {
    e.preventDefault();

    var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(this.state.newLink);
    if (!valid) {
      this.setState({
        error: 'Stop being rude and enter a valid URL, punk.'
      });
      return;
    }

    const url = this.state.newLink;
    const urlEncoded = encodeURIComponent(url);
    const apiKey = '5b2e9dff6e8b4969467dfd90';

    // The entire request is just a simple get request with optional query parameters
    const requestUrl =
      'https://opengraph.io/api/1.1/site/' + urlEncoded + '?app_id=' + apiKey;

    var title = url.split('/')[2];
    var image = '';

    $.getJSON(
      requestUrl,
      function(json) {
        // Throw the object in the console to see what it looks like!
        //console.log('json', json);

        if (json.hybridGraph) {
          if (json.hybridGraph.title) {
            title = json.hybridGraph.title;
          }

          if (json.hybridGraph.image) {
            image = json.hybridGraph.image;
          }
        }

        const itemsRef = firebase
          .database()
          .ref('links/' + this.state.sendToUsername);

        const item = {
          url: this.state.newLink,
          title: title,
          image: image,
          unread: true
        };

        itemsRef.push(item);

        this.setState({
          newLink: '',
          success: 'Woo! Your link was shared.'
        });

        setTimeout(
          function() {
            this.setState({
              success: ''
            });
          }.bind(this),
          3000
        );
      }.bind(this)
    );
  }
  openLink(item, user) {
    // Mark as read
    const itemRef = firebase.database().ref('links/' + user + '/' + item.id);
    itemRef.update({ unread: false });

    // Open new window
    window.open(item.url);
  }
  fetchLinksForUser(user) {
    const linksRef = firebase
      .database()
      .ref('links/' + user)
      .orderByKey();
    linksRef.on('value', snapshot => {
      let links = snapshot.val();
      let newState = [];
      for (let link in links) {
        newState.push({
          id: link,
          url: links[link].url,
          title: links[link].title,
          image: links[link].image,
          site_name: links[link].site_name,
          unread: links[link].unread
        });
      }
      newState.reverse();
      this.setState({
        links: newState
      });
    });
  }
  componentDidMount() {
    this.fetchLinksForUser(this.state.user);
  }
  removeItem(itemId) {
    const itemRef = firebase.database().ref('/links/' + itemId);
    itemRef.remove();
  }

  render() {
    return (
      <div className="container links-container">
        <div className="row">
          <div className="col">
            <h3>Enter URL</h3>

            <form onSubmit={this.handleSubmit}>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  name="newLink"
                  onChange={this.handleChange}
                  value={this.state.newLink}
                />
                <div className="input-group-append">
                  <button
                    className="btn btn-outline-secondary share-btn"
                    type="submit"
                  >
                    Share
                  </button>
                </div>
              </div>
            </form>

            <ErrorAlert errorText={this.state.error} />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <UserLinks
              links={this.state.links}
              user={this.state.user}
              openLink={this.openLink}
              removeItem={this.removeItem}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Links;
