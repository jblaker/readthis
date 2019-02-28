import React, { Component } from 'react';
import firebase from '../firebase.js';
import 'firebase/auth';
import 'firebase/database';
import $ from 'jquery';
import Header from './header';
const Favico = require('../favico.js');

function LinkTitle(props) {
  const unread = props.unread;
  const title = props.title;
  if (unread) {
    return (
      <h5 className="card-title">
        {title} <span className="badge badge-secondary">New</span>
      </h5>
    );
  } else {
    return <h5 className="card-title">{title}</h5>;
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

function DaysSinceShared(props) {
  if (!props || !props.dateAdded) {
    return '';
  }
  const dateAdded = new Date(props.dateAdded); //new Date('02/02/2019');
  const today = new Date();
  const days = Math.floor(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(
        dateAdded.getFullYear(),
        dateAdded.getMonth(),
        dateAdded.getDate()
      )) /
      (1000 * 60 * 60 * 24)
  );
  //console.log(days);
  if (days > 0) {
    return <p className="cardText dateAdded">Shared {days} days ago</p>;
  }
  return <p className="cardText dateAdded">Shared today</p>;
}

function FilterList(props) {
  const activeTab = props.activeTab;
  const newClass = activeTab === 'new' ? 'active' : '';
  const allClass = activeTab === 'all' ? 'active' : '';
  const seenClass = activeTab === 'seen' ? 'active' : '';
  const filterByTab = props.filterByTab;
  return (
    <ul className="nav nav-tabs list-filter">
      <li className="nav-item">
        <span
          className={'nav-link ' + newClass}
          onClick={() => filterByTab('new')}
        >
          New
        </span>
      </li>

      <li className="nav-item">
        <span
          className={'nav-link ' + allClass}
          onClick={() => filterByTab('all')}
        >
          All
        </span>
      </li>

      <li className="nav-item">
        <span
          className={'nav-link ' + seenClass}
          href="#"
          onClick={() => filterByTab('seen')}
        >
          Seen
        </span>
      </li>
    </ul>
  );
}

function UserLinks(props) {
  const links = props.links;
  const user = props.user;
  const openLink = props.openLink;
  const removeItem = props.removeItem;
  const activeTab = props.activeTab;
  const filterByTab = props.filterByTab;

  if (links.length === 0) {
    return (
      <div>
        <FilterList
          activeTab={activeTab}
          filterByTab={filterByTab}
          hideAllBtn={links.length === 0}
        />
        <h3>You're all caught up!</h3>
      </div>
    );
  } else {
    return (
      <div>
        <FilterList activeTab={activeTab} filterByTab={filterByTab} />

        <div className="link-list-container container">
          {links.map(item => {
            // Only show delete on read items
            if (item.unread) {
              return (
                <div className="card new" key={item.id}>
                  <div className="card-body">
                    <LinkTitle unread={item.unread} title={item.title} />
                    <p className="cardText url">{item.url}</p>
                    <DaysSinceShared dateAdded={item.dateAdded} />
                    <p className="cardText context">{item.context}</p>
                    <span
                      className="btn btn-primary"
                      onClick={() => openLink(item, user)}
                    >
                      Check it out
                    </span>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="card" key={item.id}>
                  <div className="card-body">
                    <LinkTitle unread={item.unread} title={item.title} />
                    <p className="cardText url">{item.url}</p>
                    <DaysSinceShared dateAdded={item.dateAdded} />
                    <p className="cardText context">{item.context}</p>
                    <span
                      className="btn btn-primary"
                      onClick={() => openLink(item, user)}
                    >
                      Check it out
                    </span>
                    &nbsp;
                    <span
                      className="btn btn-danger"
                      onClick={() => removeItem(item.id)}
                    >
                      Delete
                    </span>
                  </div>
                </div>
              );
            }
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
      user: '',
      newLink: '',
      linkContext: '',
      links: [],
      filteredLinks: [],
      sendToUsername: '',
      error: '',
      success: '',
      activeTab: '',
      users: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.filterByTab = this.filterByTab.bind(this);
    this.favicon = new Favico({
      animation: 'pop'
    });
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
    //console.log(e.target.name, e.target.value);
  }
  handleSubmit(e) {
    e.preventDefault();

    if (this.state.sendToUsername === '') {
      this.setState({
        error: 'No user to send to :('
      });
      setTimeout(
        function() {
          this.setState({
            error: ''
          });
        }.bind(this),
        3000
      );
      return;
    }

    var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(this.state.newLink);
    if (!valid) {
      this.setState({
        error: 'Stop being rude and enter a valid URL, punk.'
      });

      setTimeout(
        function() {
          this.setState({
            error: ''
          });
        }.bind(this),
        3000
      );

      return;
    }

    const url = this.state.newLink;
    const urlEncoded = encodeURIComponent(url);
    const apiKey = '';

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

        const itemsRef = firebase.database().ref('links/');

        const item = {
          url: this.state.newLink,
          title: title,
          image: image,
          unread: true,
          context: this.state.linkContext,
          dateAdded: new Date().getTime(),
          sharedBy: this.state.user,
          sharedTo: this.state.sendToUsername
        };

        itemsRef.push(item);

        this.setState({
          newLink: '',
          success: 'Woo! Your link was shared.',
          linkContext: ''
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
    const itemRef = firebase.database().ref('links/' + item.id);
    itemRef.update({ unread: false });

    // Open new window
    window.open(item.url);
  }
  fetchLinksForUser(user) {
    const linksRef = firebase
      .database()
      .ref('links/')
      .orderByChild('sharedTo')
      .equalTo(user);
    linksRef.on('value', snapshot => {
      let links = snapshot.val();
      let newState = [];
      for (let link in links) {
        newState.push({
          id: link,
          url: links[link].url,
          title: links[link].title,
          image: links[link].image,
          unread: links[link].unread,
          context: links[link].context,
          dateAdded: links[link].dateAdded
        });
      }
      newState.reverse();
      this.setState(
        {
          links: newState
        },
        function() {
          this.updateFavicon();
          const filterBy =
            this.state.activeTab === '' ? 'new' : this.state.activeTab;
          this.filterByTab(filterBy);
        }
      );
    });
  }
  fetchUsers(currentUsername) {
    const usersRef = firebase.database().ref('users/');
    usersRef.on('value', snapshot => {
      let users = snapshot.val();
      let newState = [];
      for (let user in users) {
        newState.push({
          id: user,
          username: users[user].username
        });
      }

      const otherUsers = newState.filter(function(user) {
        return user.username !== currentUsername;
      });

      this.setState({
        users: otherUsers,
        sendToUsername: otherUsers[0].username
      });
    });
  }
  updateFavicon() {
    const unreadItems = this.state.links.filter(function(link) {
      return link.unread;
    });
    if (unreadItems.length > 0) {
      this.favicon.badge(unreadItems.length);
    } else {
      this.favicon.reset();
    }
  }
  componentDidMount() {
    const userId = firebase.auth().currentUser.uid;

    const userRef = firebase.database().ref('users/' + userId);
    userRef.on('value', snapshot => {
      let user = snapshot.val();
      //console.log(user.username);
      this.setState({
        user: user.username
      });

      this.fetchLinksForUser(user.username);
      this.fetchUsers(user.username);
    });
  }
  removeItem(itemId) {
    if (window.confirm('Are you sure?')) {
      const itemRef = firebase.database().ref('/links/' + itemId);
      itemRef.remove();
    }
  }
  filterByTab(tabName) {
    var filteredLinks = this.state.links;

    if (tabName === 'new') {
      filteredLinks = this.state.links.filter(function(link) {
        return link.unread;
      });
    }

    if (tabName === 'seen') {
      filteredLinks = this.state.links.filter(function(link) {
        return !link.unread;
      });
    }

    this.setState({
      activeTab: tabName,
      filteredLinks: filteredLinks
    });
  }
  render() {
    return (
      <div>
        <Header history={this.props.history} />

        <div className="container links-container">
          <div className="row">
            <div className="col-sm-12 col-md-6">
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label>Share With</label>
                  <select
                    onChange={this.handleChange}
                    className="custom-select"
                    name="sendToUsername"
                  >
                    {this.state.users.map(user => {
                      return (
                        <option value={user.username} key={user.id}>
                          {user.username}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <label>What's the URL?</label>
                  <input
                    type="text"
                    className="form-control"
                    name="newLink"
                    onChange={this.handleChange}
                    value={this.state.newLink}
                  />
                </div>
                <div className="form-group">
                  <label>Why are you sharing this?</label>
                  <input
                    type="text"
                    className="form-control"
                    name="linkContext"
                    onChange={this.handleChange}
                    value={this.state.linkContext}
                  />
                </div>
                <button className="btn  share-btn" type="submit">
                  Share
                </button>
              </form>

              <ErrorAlert errorText={this.state.error} />
              <SuccessAlert successText={this.state.success} />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <UserLinks
                links={this.state.filteredLinks}
                user={this.state.user}
                openLink={this.openLink}
                removeItem={this.removeItem}
                activeTab={this.state.activeTab}
                filterByTab={this.filterByTab}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Links;
