import React, { Component } from 'react';
import firebase from '../firebase.js';
import 'firebase/auth';
import 'firebase/database';
import Header from './header';

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

function UserLinks(props) {
  const links = props.links;
  const user = props.user;
  const openLink = props.openLink;

  if (links.length === 0) {
    return (
      <div>
        <h3>Nothing to see here.</h3>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Links You Shared</h1>

        <div className="link-list-container container">
          {links.map(item => {
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
          })}
        </div>
      </div>
    );
  }
}

class SharedLinks extends Component {
  constructor(props) {
    super();
    this.state = {
      user: '',
      links: []
    };
  }
  openLink(item, user) {
    // Open new window
    window.open(item.url);
  }
  fetchLinksForUser(user) {
    const linksRef = firebase
      .database()
      .ref('links/')
      .orderByChild('sharedBy')
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
      this.setState({
        links: newState
      });
    });
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
    });
  }
  render() {
    return (
      <div>
        <Header history={this.props.history} />

        <div className="container links-container">
          <div className="row">
            <div className="col">
              <UserLinks
                links={this.state.links}
                user={this.state.user}
                openLink={this.openLink}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default SharedLinks;
